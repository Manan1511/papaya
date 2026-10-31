import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin/shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { entryIdFromUrl, getEntry, hasUnpublishedChanges, NotFoundError } from "../../../../lib/cms/entries";
import { pageKind } from "../../../../lib/cms/model";
import { PageForm } from "../page-form";

export default async function AdminPageEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const entryId = entryIdFromUrl((await params).id);
  if (!entryId) notFound();

  const entry = await getEntry(pageKind, entryId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const changed = entry.published !== null && hasUnpublishedChanges(entry);
  const status = entry.published
    ? `Live at /pages/${entry.slug}.${changed ? " Changes since the last publish are not live yet." : ""}`
    : "Not public yet. Publish to show it on the site.";

  return (
    <AdminShell title={entry.draft.title}>
      <p className="font-body text-body-md text-on-surface-variant">{status}</p>
      <PageForm
        entry={{ id: entry.id, updatedAt: entry.updatedAt, live: entry.published !== null }}
        initial={{ slug: entry.slug, ...entry.draft }}
      />
    </AdminShell>
  );
}
