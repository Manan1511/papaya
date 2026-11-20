import Link from "next/link";
import { AdminShell } from "../../components/admin/shell";
import { Panel, PublishState, StatCard } from "../../components/admin/ui";
import { Grid } from "../../components/ui/grid";
import { requireAdmin } from "../../lib/auth/session";
import { entryUrlId, hasUnpublishedChanges, listEntries, type StoredEntry } from "../../lib/cms/entries";
import { homeKind, pageKind, postKind } from "../../lib/cms/model";
import { formatDateTime } from "../../lib/format";

export default async function AdminDashboard() {
  await requireAdmin();
  const [pages, posts, home] = await Promise.all([
    listEntries(pageKind),
    listEntries(postKind),
    listEntries(homeKind),
  ]);
  const waiting =
    pages.filter(hasUnpublishedChanges).length +
    posts.filter(hasUnpublishedChanges).length +
    home.filter(hasUnpublishedChanges).length;
  // Everything editable, with where each piece stands. What is not fully live comes first.
  const row = <T,>(entry: StoredEntry<T>, kind: string, title: string, href: string) => ({
    id: entry.id,
    updatedAt: entry.updatedAt,
    kind,
    title,
    href,
    live: entry.published !== null,
    changed: hasUnpublishedChanges(entry),
  });
  const rows = [
    ...home.map((entry) => row(entry, "Homepage", "Homepage", "/admin/content")),
    ...pages.map((entry) => row(entry, "Page", entry.draft.title, `/admin/pages/${entryUrlId(entry.id)}`)),
    ...posts.map((entry) => row(entry, "Diary post", entry.draft.title, `/admin/diary/${entryUrlId(entry.id)}`)),
  ].sort((a, b) => Number(a.live) - Number(b.live) || Number(b.changed) - Number(a.changed) || b.updatedAt.localeCompare(a.updatedAt));
  const live =
    pages.filter((entry) => entry.published !== null).length + posts.filter((entry) => entry.published !== null).length;

  return (
    <AdminShell title="Dashboard">
      <Grid>
        <div className="col-span-4 md:col-span-4 lg:col-span-4">
          <StatCard label="Changes waiting" value={waiting} hint="Drafts that differ from the live copy, or were never published" />
        </div>
        <div className="col-span-4 md:col-span-4 lg:col-span-4">
          <StatCard label="Live pages and posts" value={live} hint="What visitors can read right now" />
        </div>
      </Grid>

      <Panel title="All content">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-body-md text-on-surface">
            <thead>
              <tr>
                {["Name", "Type", "Status", "Last edited"].map((column) => (
                  <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, updatedAt, kind, title, href, live: isLive, changed }) => (
                <tr key={id} className="border-b border-outline-variant/40">
                  <td className="py-3">
                    <Link href={href} className="link-underline text-primary">
                      {title}
                    </Link>
                  </td>
                  <td className="py-3 text-on-surface-variant">{kind}</td>
                  <td className="py-3">
                    <PublishState live={isLive} changed={changed} />
                  </td>
                  <td className="py-3 text-on-surface-variant">{formatDateTime(updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Still to come">
        <p className="font-body text-body-md text-on-surface-variant">
          Reviews and messages appear here once shoppers can leave reviews and send the contact form.
        </p>
      </Panel>
    </AdminShell>
  );
}
