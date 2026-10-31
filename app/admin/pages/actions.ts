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
import { type PageContent, pageContentSchema, pageKind, slugSchema } from "../../../lib/cms/model";
import { firstIssue, readBody, readText } from "../form-data";

export type PageFormState = { error?: string; message?: string; updatedAt?: string };

type Outcome = PageFormState | { redirectTo: string };

type PageForm = { slug: string; content: PageContent };

const EXPECTED_ERRORS = [ConflictError, NotFoundError, SlugTakenError];

function readPage(formData: FormData): { ok: true; value: PageForm } | { ok: false; error: string } {
  const slug = slugSchema.safeParse(readText(formData, "slug"));
  if (!slug.success) return { ok: false, error: firstIssue(slug.error) };

  const body = readBody(formData);
  if (!body.ok) return { ok: false, error: body.error };

  const content = pageContentSchema.safeParse({
    title: readText(formData, "title"),
    intro: readText(formData, "intro"),
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
    await deleteEntry(pageKind, id);
    updateTag(CMS_TAG);
    return { redirectTo: "/admin/pages" };
  }

  if (intent === "unpublish") {
    const updatedAt = await unpublishEntry(pageKind, { id, updatedAt: expected });
    updateTag(CMS_TAG);
    return { message: "Unpublished. The page is no longer public.", updatedAt };
  }

  const form = readPage(formData);
  if (!form.ok) return { error: form.error };

  if (!id) {
    const newId = await createEntry(pageKind, form.value);
    if (intent === "publish") {
      const created = await getEntry(pageKind, newId);
      await publishEntry(pageKind, { id: newId, updatedAt: created.updatedAt });
      updateTag(CMS_TAG);
    }
    return { redirectTo: `/admin/pages/${entryUrlId(newId)}` };
  }

  let updatedAt = await saveDraft(pageKind, {
    id,
    updatedAt: expected,
    slug: form.value.slug,
    content: form.value.content,
  });
  if (intent === "publish") {
    updatedAt = await publishEntry(pageKind, { id, updatedAt });
    updateTag(CMS_TAG);
    return { message: "Published. The page is live.", updatedAt };
  }
  return { message: "Draft saved.", updatedAt };
}

export async function savePage(_previous: PageFormState, formData: FormData): Promise<PageFormState> {
  await requireAdmin();

  let outcome: Outcome;
  try {
    outcome = await run(formData);
  } catch (error) {
    if (EXPECTED_ERRORS.some((type) => error instanceof type)) return { error: (error as Error).message };
    console.error("Saving a page failed", error);
    return { error: "The page couldn't be saved. Try again." };
  }

  revalidatePath("/admin", "layout");
  if ("redirectTo" in outcome) redirect(outcome.redirectTo);
  return outcome;
}
