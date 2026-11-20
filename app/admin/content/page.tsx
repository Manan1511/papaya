import { AdminShell } from "../../../components/admin/shell";
import { PublishState } from "../../../components/admin/ui";
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
    ? "What visitors see is the last published version."
    : "Not public yet. The homepage keeps its original copy until you publish.";

  return (
    <AdminShell title="Homepage">
      <div className="flex flex-wrap items-center gap-3">
        <PublishState live={live} changed={changed} />
        <p className="font-body text-body-md text-on-surface-variant">{status}</p>
      </div>
      <HomeForm entry={{ id: entry.id, updatedAt: entry.updatedAt, live }} initial={entry.draft} />
    </AdminShell>
  );
}
