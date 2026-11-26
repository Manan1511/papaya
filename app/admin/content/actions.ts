"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "../../../lib/auth/session";
import { CMS_TAG, ConflictError, NotFoundError, publishEntry, saveDraft } from "../../../lib/cms/entries";
import { HOME_SLUG, homeContentSchema, homeKind } from "../../../lib/cms/model";
import { IMAGE_TYPES, validateImageUpload } from "../../../lib/cms/image";
import { pickMp4Url, VIDEO_TYPES, validateVideoUpload } from "../../../lib/cms/video";
import { adminRequest } from "../../../lib/shopify/admin";
import { firstIssue, readJson, readText } from "../form-data";

export type HomeFormState = { error?: string; message?: string; updatedAt?: string };

export async function saveHome(_previous: HomeFormState, formData: FormData): Promise<HomeFormState> {
  await requireAdmin();

  const content = homeContentSchema.safeParse({
    heroVideo: readText(formData, "heroVideo"),
    heroTitle: readText(formData, "heroTitle"),
    heroBody: readText(formData, "heroBody"),
    collectionsTitle: readText(formData, "collectionsTitle"),
    collectionsBody: readText(formData, "collectionsBody"),
    reelsTitle: readText(formData, "reelsTitle"),
    reelsBody: readText(formData, "reelsBody"),
    reelsPlaceholders: formData.get("reelsPlaceholders") === "on",
    reels: formData.getAll("reels").filter((value): value is string => typeof value === "string"),
    amalfiTitle: readText(formData, "amalfiTitle"),
    amalfiBody: readText(formData, "amalfiBody"),
    makingTitle: readText(formData, "makingTitle"),
    makingBody: readText(formData, "makingBody"),
    stacksTitle: readText(formData, "stacksTitle"),
    stacksBody: readText(formData, "stacksBody"),
    stacks: readJson(formData, "stacks"),
  });
  if (!content.success) return { error: firstIssue(content.error) };

  const id = readText(formData, "id");
  const expected = readText(formData, "updatedAt");
  const publish = readText(formData, "intent") === "publish";

  try {
    let updatedAt = await saveDraft(homeKind, { id, updatedAt: expected, slug: HOME_SLUG, content: content.data });
    if (!publish) return { message: "Draft saved.", updatedAt };

    updatedAt = await publishEntry(homeKind, { id, updatedAt });
    updateTag(CMS_TAG);
    revalidatePath("/");
    return { message: "Published. The homepage shows this now.", updatedAt };
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) return { error: error.message };
    console.error("Saving the homepage failed", error);
    return { error: "The homepage couldn't be saved. Try again." };
  }
}

// Uploads go in three steps. The browser sends the file straight to the upload address Shopify
// returns, so it never passes through this server. Then Shopify is told about the file, and the
// browser asks for its status until it is ready.

const stagedUploadResult = z.object({
  stagedUploadsCreate: z.object({
    stagedTargets: z.array(
      z.object({
        url: z.string(),
        resourceUrl: z.string().nullable(),
        parameters: z.array(z.object({ name: z.string(), value: z.string() })),
      }),
    ),
    userErrors: z.array(z.object({ message: z.string() })),
  }),
});

const fileCreateResult = z.object({
  fileCreate: z.object({
    files: z.array(z.object({ id: z.string() })).nullable(),
    userErrors: z.array(z.object({ message: z.string() })),
  }),
});

const fileState = {
  fileStatus: z.enum(["UPLOADED", "PROCESSING", "READY", "FAILED"]),
  fileErrors: z.array(z.object({ message: z.string() })),
};

const videoStatusResult = z.object({
  node: z
    .object({
      ...fileState,
      sources: z.array(z.object({ url: z.string(), mimeType: z.string(), height: z.number().nullable() })),
    })
    .nullable(),
});

const imageStatusResult = z.object({
  node: z
    .object({
      ...fileState,
      image: z.object({ url: z.string(), width: z.number().nullable(), height: z.number().nullable() }).nullable(),
    })
    .nullable(),
});

const STAGED_UPLOAD = `mutation ($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets { url resourceUrl parameters { name value } }
    userErrors { message }
  }
}`;

const FILE_CREATE = `mutation ($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files { id }
    userErrors { message }
  }
}`;

const VIDEO_STATUS = `query ($id: ID!) {
  node(id: $id) {
    ... on Video { fileStatus fileErrors { message } sources { url mimeType height } }
  }
}`;

const IMAGE_STATUS = `query ($id: ID!) {
  node(id: $id) {
    ... on MediaImage { fileStatus fileErrors { message } image { url width height } }
  }
}`;

// Shopify refuses file calls until the app holds the files permissions. Say what to add, in plain words.
function fileAccessMessage(error: unknown): string | undefined {
  if (error instanceof Error && /write_files|read_files|Access denied/i.test(error.message)) {
    return "Shopify won't take files until the app has the file permissions. Add read_files and write_files to the Shopify app, approve the update, then try again.";
  }
  return undefined;
}

const fileDetails = {
  filename: z.string().trim().min(1).max(120),
  size: z.number().int().positive(),
};
const videoStart = z.object({ ...fileDetails, mimeType: z.enum(VIDEO_TYPES) });
const imageStart = z.object({ ...fileDetails, mimeType: z.enum(IMAGE_TYPES) });

export type UploadTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

export type StartUploadResult = { ok: true; target: UploadTarget } | { ok: false; error: string };

type UploadRequest = { filename: string; mimeType: string; size: number };

async function stageUpload(resource: "VIDEO" | "IMAGE", file: UploadRequest): Promise<StartUploadResult> {
  try {
    const data = await adminRequest(
      STAGED_UPLOAD,
      stagedUploadResult,
      {
        input: [
          {
            resource,
            filename: file.filename,
            mimeType: file.mimeType,
            fileSize: String(file.size),
            httpMethod: "POST",
          },
        ],
      },
      "no-store",
    );

    const { stagedTargets, userErrors } = data.stagedUploadsCreate;
    const target = stagedTargets[0];
    if (userErrors.length > 0 || !target?.resourceUrl) {
      return { ok: false, error: "Shopify wouldn't take that upload. Try again." };
    }
    return {
      ok: true,
      target: { url: target.url, resourceUrl: target.resourceUrl, parameters: target.parameters },
    };
  } catch (error) {
    console.error("Starting an upload failed", error);
    return { ok: false, error: fileAccessMessage(error) ?? "Shopify couldn't start the upload. Try again." };
  }
}

export async function startVideoUpload(input: UploadRequest): Promise<StartUploadResult> {
  await requireAdmin();

  const parsed = videoStart.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose an MP4, WebM or MOV video." };
  const problem = validateVideoUpload(parsed.data);
  if (problem) return { ok: false, error: problem };
  return stageUpload("VIDEO", parsed.data);
}

export async function startImageUpload(input: UploadRequest): Promise<StartUploadResult> {
  await requireAdmin();

  const parsed = imageStart.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a JPEG, PNG or WebP picture." };
  const problem = validateImageUpload(parsed.data);
  if (problem) return { ok: false, error: problem };
  return stageUpload("IMAGE", parsed.data);
}

const registerRequest = z.object({
  resourceUrl: z.string().url().max(2000),
  filename: z.string().trim().min(1).max(120),
});

// Shopify stages uploads on its own Google Cloud Storage bucket. Only that kind of address is accepted.
function isStagedUploadAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".storage.googleapis.com");
  } catch {
    return false;
  }
}

export type RegisterResult = { ok: true; fileId: string } | { ok: false; error: string };

async function createFile(
  contentType: "VIDEO" | "IMAGE",
  alt: string,
  input: { resourceUrl: string; filename: string },
): Promise<RegisterResult> {
  const parsed = registerRequest.safeParse(input);
  if (!parsed.success || !isStagedUploadAddress(parsed.data.resourceUrl)) {
    return { ok: false, error: "That upload can't be used. Try again." };
  }

  try {
    const data = await adminRequest(
      FILE_CREATE,
      fileCreateResult,
      {
        files: [
          {
            originalSource: parsed.data.resourceUrl,
            contentType,
            alt,
            filename: `${Date.now()}-${parsed.data.filename}`,
          },
        ],
      },
      "no-store",
    );

    const { files, userErrors } = data.fileCreate;
    const file = files?.[0];
    if (userErrors.length > 0 || !file) return { ok: false, error: "Shopify couldn't add that file. Try again." };
    return { ok: true, fileId: file.id };
  } catch (error) {
    console.error("Adding a file to Shopify failed", error);
    return { ok: false, error: fileAccessMessage(error) ?? "Shopify couldn't add that file. Try again." };
  }
}

export async function registerVideo(input: { resourceUrl: string; filename: string }): Promise<RegisterResult> {
  await requireAdmin();
  return createFile("VIDEO", "Homepage video", input);
}

export async function registerImage(input: { resourceUrl: string; filename: string }): Promise<RegisterResult> {
  await requireAdmin();
  return createFile("IMAGE", "Styled jewellery stack", input);
}

const FILE_ID = /^gid:\/\/shopify\/[A-Za-z]+\/\d+$/;

type Pending = { state: "processing" } | { state: "failed"; message: string };

export type VideoStatus = Pending | { state: "ready"; url: string };

export async function checkVideo(fileId: string): Promise<VideoStatus> {
  await requireAdmin();

  if (!FILE_ID.test(fileId)) return { state: "failed", message: "That video can't be checked. Upload it again." };

  try {
    const data = await adminRequest(VIDEO_STATUS, videoStatusResult, { id: fileId }, "no-store");
    const node = data.node;
    if (!node) return { state: "failed", message: "Shopify can't find that video. Upload it again." };

    if (node.fileStatus === "FAILED") {
      return { state: "failed", message: node.fileErrors[0]?.message ?? "Shopify couldn't process that video." };
    }
    if (node.fileStatus !== "READY") return { state: "processing" };

    const url = pickMp4Url(node.sources);
    if (!url) return { state: "failed", message: "Shopify didn't make an MP4 of that video. Try an MP4 file." };
    return { state: "ready", url };
  } catch (error) {
    console.error("Checking the video failed", error);
    return { state: "failed", message: fileAccessMessage(error) ?? "The video couldn't be checked. Try again." };
  }
}

export type ImageStatus = Pending | { state: "ready"; image: { url: string; width: number; height: number } };

export async function checkImage(fileId: string): Promise<ImageStatus> {
  await requireAdmin();

  if (!FILE_ID.test(fileId)) return { state: "failed", message: "That picture can't be checked. Upload it again." };

  try {
    const data = await adminRequest(IMAGE_STATUS, imageStatusResult, { id: fileId }, "no-store");
    const node = data.node;
    if (!node) return { state: "failed", message: "Shopify can't find that picture. Upload it again." };

    if (node.fileStatus === "FAILED") {
      return { state: "failed", message: node.fileErrors[0]?.message ?? "Shopify couldn't process that picture." };
    }
    const { image } = node;
    if (node.fileStatus !== "READY" || !image?.width || !image.height) return { state: "processing" };
    return { state: "ready", image: { url: image.url, width: image.width, height: image.height } };
  } catch (error) {
    console.error("Checking the picture failed", error);
    return { state: "failed", message: fileAccessMessage(error) ?? "The picture couldn't be checked. Try again." };
  }
}
