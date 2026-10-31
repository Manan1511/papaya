import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin/shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { entryIdFromUrl, getEntry, hasUnpublishedChanges, NotFoundError } from "../../../../lib/cms/entries";
import { postKind } from "../../../../lib/cms/model";
import { PostForm } from "../post-form";

export default async function AdminDiaryEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const entryId = entryIdFromUrl((await params).id);
  if (!entryId) notFound();

  const entry = await getEntry(postKind, entryId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const changed = entry.published !== null && hasUnpublishedChanges(entry);
  const status = entry.published
    ? `Live at /diary/${entry.slug}.${changed ? " Changes since the last publish are not live yet." : ""}`
    : "Not public yet. Publish to show it in the diary.";

  return (
    <AdminShell title={entry.draft.title}>
      <p className="font-body text-body-md text-on-surface-variant">{status}</p>
      <PostForm
        entry={{ id: entry.id, updatedAt: entry.updatedAt, live: entry.published !== null }}
        initial={{ slug: entry.slug, ...entry.draft }}
      />
    </AdminShell>
  );
}
