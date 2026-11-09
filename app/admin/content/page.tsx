import { AdminShell } from "../../../components/admin/shell";
import { requireAdmin } from "../../../lib/auth/session";
import { hasUnpublishedChanges } from "../../../lib/cms/entries";
import { ensureHomeEntry } from "../../../lib/cms/home";
import { HomeForm } from "./home-form";

export default async function AdminContent() {
  await requireAdmin();
  const entry = await ensureHomeEntry();
  const live = entry.published !== null;
  const changed = live && hasUnpublishedChanges(entry);
  const status = live
    ? `Live on the homepage.${changed ? " Changes since the last publish are not live yet." : ""}`
    : "Not public yet. The homepage keeps its original copy until you publish.";

  return (
    <AdminShell title="Homepage">
      <p className="font-body text-body-md text-on-surface-variant">{status}</p>
      <HomeForm entry={{ id: entry.id, updatedAt: entry.updatedAt, live }} initial={entry.draft} />
    </AdminShell>
  );
}
