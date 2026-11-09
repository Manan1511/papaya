"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "../../../lib/auth/session";
import { CMS_TAG, ConflictError, NotFoundError, publishEntry, saveDraft } from "../../../lib/cms/entries";
import { HOME_SLUG, homeContentSchema, homeKind } from "../../../lib/cms/model";
import { pickMp4Url, VIDEO_TYPES, validateVideoUpload } from "../../../lib/cms/video";
import { adminRequest } from "../../../lib/shopify/admin";
import { firstIssue, readText } from "../form-data";

export type HomeFormState = { error?: string; message?: string; updatedAt?: string };

export async function saveHome(_previous: HomeFormState, formData: FormData): Promise<HomeFormState> {
  await requireAdmin();

  const content = homeContentSchema.safeParse({
    heroVideo: readText(formData, "heroVideo"),
    heroTitle: readText(formData, "heroTitle"),
    heroBody: readText(formData, "heroBody"),
    latestTitle: readText(formData, "latestTitle"),
    latestBody: readText(formData, "latestBody"),
    amalfiTitle: readText(formData, "amalfiTitle"),
    amalfiBody: readText(formData, "amalfiBody"),
    makingTitle: readText(formData, "makingTitle"),
    makingBody: readText(formData, "makingBody"),
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

// Video uploads go in three steps. The browser sends the file straight to the upload address Shopify
// returns, so the video never passes through this server. Then Shopify is told about the file, and
// the browser asks for its status until the MP4 is ready.

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

const fileStatusResult = z.object({
  node: z
    .object({
      fileStatus: z.enum(["UPLOADED", "PROCESSING", "READY", "FAILED"]),
      fileErrors: z.array(z.object({ message: z.string() })),
      sources: z.array(z.object({ url: z.string(), mimeType: z.string(), height: z.number().nullable() })),
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

const FILE_STATUS = `query ($id: ID!) {
  node(id: $id) {
    ... on Video { fileStatus fileErrors { message } sources { url mimeType height } }
  }
}`;

// Shopify refuses file calls until the app holds the files permissions. Say what to add, in plain words.
function fileAccessMessage(error: unknown): string | undefined {
  if (error instanceof Error && /write_files|read_files|Access denied/i.test(error.message)) {
    return "Shopify won't take videos until the app has the file permissions. Add read_files and write_files to the Shopify app, approve the update, then try again.";
  }
  return undefined;
}

const startRequest = z.object({
  filename: z.string().trim().min(1).max(120),
  mimeType: z.enum(VIDEO_TYPES),
  size: z.number().int().positive(),
});

export type VideoUploadTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

export type StartUploadResult = { ok: true; target: VideoUploadTarget } | { ok: false; error: string };

export async function startVideoUpload(input: {
  filename: string;
  mimeType: string;
  size: number;
}): Promise<StartUploadResult> {
  await requireAdmin();

  const parsed = startRequest.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose an MP4, WebM or MOV video." };
  const problem = validateVideoUpload(parsed.data);
  if (problem) return { ok: false, error: problem };

  try {
    const data = await adminRequest(
      STAGED_UPLOAD,
      stagedUploadResult,
      {
        input: [
          {
            resource: "VIDEO",
            filename: parsed.data.filename,
            mimeType: parsed.data.mimeType,
            fileSize: String(parsed.data.size),
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
    console.error("Starting a video upload failed", error);
    return { ok: false, error: fileAccessMessage(error) ?? "Shopify couldn't start the upload. Try again." };
  }
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

export async function registerVideo(input: { resourceUrl: string; filename: string }): Promise<RegisterResult> {
  await requireAdmin();

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
            contentType: "VIDEO",
            alt: "Homepage hero video",
            filename: `${Date.now()}-${parsed.data.filename}`,
          },
        ],
      },
      "no-store",
    );

    const { files, userErrors } = data.fileCreate;
    const file = files?.[0];
    if (userErrors.length > 0 || !file) return { ok: false, error: "Shopify couldn't add that video. Try again." };
    return { ok: true, fileId: file.id };
  } catch (error) {
    console.error("Adding the video to Shopify failed", error);
    return { ok: false, error: fileAccessMessage(error) ?? "Shopify couldn't add that video. Try again." };
  }
}

export type VideoStatus = { state: "processing" } | { state: "ready"; url: string } | { state: "failed"; message: string };

export async function checkVideo(fileId: string): Promise<VideoStatus> {
  await requireAdmin();

  if (!/^gid:\/\/shopify\/[A-Za-z]+\/\d+$/.test(fileId)) {
    return { state: "failed", message: "That video can't be checked. Upload it again." };
  }

  try {
    const data = await adminRequest(FILE_STATUS, fileStatusResult, { id: fileId }, "no-store");
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
