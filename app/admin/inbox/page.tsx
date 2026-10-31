import { requireAdmin } from "../../../lib/auth/session";
import { AdminShell } from "../../../components/admin/shell";
import { Panel, StatusChip } from "../../../components/admin/ui";
import { Button } from "../../../components/ui/button";
import { adminMessages } from "../../../lib/content/admin";

export default async function AdminInbox() {
  await requireAdmin();
  return (
    <AdminShell title="Inbox">
      {adminMessages.map((message) => (
        <Panel key={message.id} title={message.subject}>
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip status={message.read ? "read" : "unread"} />
            <span className="font-body text-body-md text-on-surface-variant">From {message.from}</span>
          </div>
          <p className="font-body text-body-md text-on-surface">{message.body}</p>
          <div>
            <Button variant="outlined" disabled>
              Mark as read
            </Button>
          </div>
        </Panel>
      ))}
    </AdminShell>
  );
}
