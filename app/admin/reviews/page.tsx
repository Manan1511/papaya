import { AdminShell } from "../../../components/admin/shell";
import { Panel } from "../../../components/admin/ui";
import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminReviews() {
  await requireAdmin();

  return (
    <AdminShell title="Reviews">
      <Panel title="Moderation queue">
        <p className="font-body text-body-md text-on-surface-variant">
          No reviews yet. Shoppers&apos; reviews appear here for approval once they can leave them on the product pages.
        </p>
      </Panel>
    </AdminShell>
  );
}
