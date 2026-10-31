import { AdminShell } from "../../../../components/admin/shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { emptyRichText } from "../../../../lib/cms/rich-text";
import { PageForm } from "../page-form";

export default async function NewPage() {
  await requireAdmin();

  return (
    <AdminShell title="New page">
      <PageForm initial={{ slug: "", title: "", intro: "", body: emptyRichText }} />
    </AdminShell>
  );
}
