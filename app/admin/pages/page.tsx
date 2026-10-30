import { requireDevPreview } from "../../../lib/content/dev";
import Link from "next/link";
import { AdminShell } from "../../../components/admin/shell";
import { Panel, StatusChip } from "../../../components/admin/ui";
import { infoPages, policies } from "../../../lib/content/pages";

// Policies are drafts until the legal text is written, so they show as drafts here.
const rows = [
  ...infoPages.map((page) => ({ page, status: "published" as const })),
  ...policies.map((page) => ({ page, status: "draft" as const })),
];

export default function AdminPages() {
  requireDevPreview();
  return (
    <AdminShell title="Pages">
      <Panel title="Information and legal pages">
        <table className="w-full text-left font-body text-body-md text-on-surface">
          <thead>
            <tr>
              {["Title", "Status", ""].map((column) => (
                <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ page, status }) => (
              <tr key={page.slug} className="border-b border-outline-variant/40">
                <td className="py-3">{page.title}</td>
                <td className="py-3">
                  <StatusChip status={status} />
                </td>
                <td className="py-3 text-right">
                  <Link href={`/admin/pages/${page.slug}`} className="link-underline font-label text-label-md text-secondary">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </AdminShell>
  );
}
