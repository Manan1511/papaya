import Link from "next/link";
import { AdminShell } from "../../../components/admin/shell";
import { Panel, StatusChip } from "../../../components/admin/ui";
import { ButtonLink } from "../../../components/ui/button";
import { Chip } from "../../../components/ui/chip";
import { requireAdmin } from "../../../lib/auth/session";
import { entryUrlId, hasUnpublishedChanges, listEntries } from "../../../lib/cms/entries";
import { postKind } from "../../../lib/cms/model";
import { formatDateTime } from "../../../lib/format";

export default async function AdminDiary() {
  await requireAdmin();
  const entries = (await listEntries(postKind)).sort((a, b) => b.draft.publishedOn.localeCompare(a.draft.publishedOn));

  return (
    <AdminShell title="Diary">
      <div className="flex justify-end">
        <ButtonLink href="/admin/diary/new">New post</ButtonLink>
      </div>

      <Panel title="Posts">
        {entries.length === 0 ? (
          <p className="font-body text-body-md text-on-surface-variant">No posts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-body-md text-on-surface">
              <thead>
                <tr>
                  {["Title", "Category", "Date", "Status", "Last edited"].map((column) => (
                    <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-outline-variant/40">
                    <td className="py-3">
                      <Link href={`/admin/diary/${entryUrlId(entry.id)}`} className="link-underline text-primary">
                        {entry.draft.title}
                      </Link>
                    </td>
                    <td className="py-3">{entry.draft.category}</td>
                    <td className="py-3 text-on-surface-variant">{entry.draft.publishedOn}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusChip status={entry.published ? "published" : "draft"} />
                        {entry.published && hasUnpublishedChanges(entry) && <Chip>Changes not published</Chip>}
                      </div>
                    </td>
                    <td className="py-3 text-on-surface-variant">{formatDateTime(entry.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}
