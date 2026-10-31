import { AdminShell } from "../../../components/admin/shell";
import { Panel } from "../../../components/admin/ui";
import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminContent() {
  await requireAdmin();

  return (
    <AdminShell title="Content">
      <Panel title="Homepage">
        <p className="font-body text-body-md text-on-surface-variant">
          The homepage copy and sections are still set in the code. They move into this editor with the homepage work.
          Pages and diary posts are already editable under Pages and Diary.
        </p>
      </Panel>
    </AdminShell>
  );
}
