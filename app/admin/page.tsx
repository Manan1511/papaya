import { AdminShell } from "../../components/admin/shell";
import { Panel, StatCard } from "../../components/admin/ui";
import { Grid } from "../../components/ui/grid";
import { requireAdmin } from "../../lib/auth/session";
import { hasUnpublishedChanges, listEntries } from "../../lib/cms/entries";
import { pageKind, postKind } from "../../lib/cms/model";

export default async function AdminDashboard() {
  await requireAdmin();
  const [pages, posts] = await Promise.all([listEntries(pageKind), listEntries(postKind)]);
  const waiting = pages.filter(hasUnpublishedChanges).length + posts.filter(hasUnpublishedChanges).length;
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

      <Panel title="Still to come">
        <p className="font-body text-body-md text-on-surface-variant">
          Reviews and messages appear here once shoppers can leave reviews and send the contact form. Homepage copy
          moves into this editor with the homepage work.
        </p>
      </Panel>
    </AdminShell>
  );
}
