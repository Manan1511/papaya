import { AdminShell } from "../../../components/admin/shell";
import { Panel } from "../../../components/admin/ui";
import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminInbox() {
  await requireAdmin();

  return (
    <AdminShell title="Inbox">
      <Panel title="Messages">
        <p className="font-body text-body-md text-on-surface-variant">
          No messages yet. Messages from the contact form appear here once the form is live.
        </p>
      </Panel>
    </AdminShell>
  );
}
