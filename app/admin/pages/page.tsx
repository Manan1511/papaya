import Link from "next/link";
import { AdminShell } from "../../../components/admin/shell";
import { Panel, StatusChip } from "../../../components/admin/ui";
import { ButtonLink } from "../../../components/ui/button";
import { Chip } from "../../../components/ui/chip";
import { requireAdmin } from "../../../lib/auth/session";
import { entryUrlId, hasUnpublishedChanges, listEntries } from "../../../lib/cms/entries";
import { pageKind } from "../../../lib/cms/model";
import { formatDateTime } from "../../../lib/format";

export default async function AdminPages() {
  await requireAdmin();
  const entries = (await listEntries(pageKind)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <AdminShell title="Pages">
      <div className="flex justify-end">
        <ButtonLink href="/admin/pages/new">New page</ButtonLink>
      </div>

      <Panel title="Information pages">
        {entries.length === 0 ? (
          <p className="font-body text-body-md text-on-surface-variant">No pages yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-body-md text-on-surface">
              <thead>
                <tr>
                  {["Title", "Address", "Status", "Last edited"].map((column) => (
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
                      <Link href={`/admin/pages/${entryUrlId(entry.id)}`} className="link-underline text-primary">
                        {entry.draft.title}
                      </Link>
                    </td>
                    <td className="py-3 text-on-surface-variant">/pages/{entry.slug}</td>
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

      <p className="font-body text-body-md text-on-surface-variant">
        Privacy, terms and refund pages come from your Shopify policies once the text is written. They aren&apos;t edited here.
      </p>
    </AdminShell>
  );
}
