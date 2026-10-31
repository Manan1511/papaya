"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth/session";
import {
  CMS_TAG,
  entryUrlId,
  ConflictError,
  NotFoundError,
  SlugTakenError,
  createEntry,
  deleteEntry,
  getEntry,
  publishEntry,
  saveDraft,
  unpublishEntry,
} from "../../../lib/cms/entries";
import { type PostContent, postContentSchema, postKind, slugSchema } from "../../../lib/cms/model";
import { firstIssue, readBody, readText } from "../form-data";

export type PostFormState = { error?: string; message?: string; updatedAt?: string };

type Outcome = PostFormState | { redirectTo: string };

type PostForm = { slug: string; content: PostContent };

const EXPECTED_ERRORS = [ConflictError, NotFoundError, SlugTakenError];

function readPost(formData: FormData): { ok: true; value: PostForm } | { ok: false; error: string } {
  const slug = slugSchema.safeParse(readText(formData, "slug"));
  if (!slug.success) return { ok: false, error: firstIssue(slug.error) };

  const body = readBody(formData);
  if (!body.ok) return { ok: false, error: body.error };

  const content = postContentSchema.safeParse({
    title: readText(formData, "title"),
    category: readText(formData, "category"),
    excerpt: readText(formData, "excerpt"),
    featured: formData.get("featured") === "on",
    publishedOn: readText(formData, "publishedOn"),
    body: body.body,
  });
  if (!content.success) return { ok: false, error: firstIssue(content.error) };

  return { ok: true, value: { slug: slug.data, content: content.data } };
}

async function run(formData: FormData): Promise<Outcome> {
  const intent = readText(formData, "intent") || "save";
  const id = readText(formData, "id");
  const expected = readText(formData, "updatedAt");

  if (intent === "delete") {
    await deleteEntry(postKind, id);
    updateTag(CMS_TAG);
    return { redirectTo: "/admin/diary" };
  }

  if (intent === "unpublish") {
    const updatedAt = await unpublishEntry(postKind, { id, updatedAt: expected });
    updateTag(CMS_TAG);
    return { message: "Unpublished. The post is no longer public.", updatedAt };
  }

  const form = readPost(formData);
  if (!form.ok) return { error: form.error };

  if (!id) {
    const newId = await createEntry(postKind, form.value);
    if (intent === "publish") {
      const created = await getEntry(postKind, newId);
      await publishEntry(postKind, { id: newId, updatedAt: created.updatedAt });
      updateTag(CMS_TAG);
    }
    return { redirectTo: `/admin/diary/${entryUrlId(newId)}` };
  }

  let updatedAt = await saveDraft(postKind, {
    id,
    updatedAt: expected,
    slug: form.value.slug,
    content: form.value.content,
  });
  if (intent === "publish") {
    updatedAt = await publishEntry(postKind, { id, updatedAt });
    updateTag(CMS_TAG);
    return { message: "Published. The post is live.", updatedAt };
  }
  return { message: "Draft saved.", updatedAt };
}

export async function savePost(_previous: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin();

  let outcome: Outcome;
  try {
    outcome = await run(formData);
  } catch (error) {
    if (EXPECTED_ERRORS.some((type) => error instanceof type)) return { error: (error as Error).message };
    console.error("Saving a diary post failed", error);
    return { error: "The post couldn't be saved. Try again." };
  }

  revalidatePath("/admin", "layout");
  if ("redirectTo" in outcome) redirect(outcome.redirectTo);
  return outcome;
}
