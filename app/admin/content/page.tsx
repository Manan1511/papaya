import { requireDevPreview } from "../../../lib/content/dev";
import { AdminShell } from "../../../components/admin/shell";
import { Field, Panel, fieldClass } from "../../../components/admin/ui";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { adminContentSections } from "../../../lib/content/admin";
import { landingCopy } from "../../../lib/content/landing";

export default function AdminContent() {
  requireDevPreview();
  return (
    <AdminShell title="Content">
      <Panel title="Homepage sections">
        <ul className="divide-y divide-outline-variant/40">
          {adminContentSections.map((section) => (
            <li key={section.id} className="flex items-center justify-between gap-4 py-3">
              <span className="font-body text-body-md text-on-surface">{section.title}</span>
              <label className="flex items-center gap-2 font-label text-label-md text-on-surface-variant">
                <input type="checkbox" defaultChecked={section.visible} disabled className="size-4 accent-primary" />
                Visible
              </label>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Hero">
        <Field label="Heading">
          <Input defaultValue={landingCopy.heroTitle} disabled />
        </Field>
        <Field label="Supporting text">
          <textarea rows={3} defaultValue={landingCopy.heroBody} disabled className={fieldClass} />
        </Field>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled>
          Save draft
        </Button>
        <Button disabled>Publish</Button>
        <Button variant="outlined" disabled>
          Discard changes
        </Button>
      </div>
    </AdminShell>
  );
}
