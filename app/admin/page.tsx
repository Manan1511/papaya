import { requireAdmin } from "../../lib/auth/session";
import { AdminShell } from "../../components/admin/shell";
import { Panel, StatCard } from "../../components/admin/ui";
import { Grid } from "../../components/ui/grid";
import { adminActivity, adminStats } from "../../lib/content/admin";

export default async function AdminDashboard() {
  await requireAdmin();
  return (
    <AdminShell title="Dashboard">
      <Grid>
        <div className="col-span-4 md:col-span-4 lg:col-span-4">
          <StatCard label="Reviews waiting" value={adminStats.pendingReviews} hint="Approve or reject them in Reviews" />
        </div>
        <div className="col-span-4 md:col-span-4 lg:col-span-4">
          <StatCard label="Unread messages" value={adminStats.unreadMessages} hint="Read them in Inbox" />
        </div>
        <div className="col-span-4 md:col-span-4 lg:col-span-4">
          <StatCard label="Unpublished changes" value={adminStats.unpublishedChanges} hint="Drafts waiting to go live" />
        </div>
      </Grid>

      <Panel title="Recent activity">
        <ul className="divide-y divide-outline-variant/40">
          {adminActivity.map((item) => (
            <li key={item.text} className="flex flex-wrap justify-between gap-4 py-3 font-body text-body-md text-on-surface">
              <span>{item.text}</span>
              <span className="text-on-surface-variant">{item.when}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </AdminShell>
  );
}
