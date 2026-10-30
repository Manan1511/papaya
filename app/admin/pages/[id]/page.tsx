import { requireDevPreview } from "../../../../lib/content/dev";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin/shell";
import { Field, Panel, fieldClass } from "../../../../components/admin/ui";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { infoPages, policies } from "../../../../lib/content/pages";

export default async function AdminPageEditor({ params }: { params: Promise<{ id: string }> }) {
  requireDevPreview();
  const { id } = await params;
  const page = [...infoPages, ...policies].find((item) => item.slug === id);
  if (!page) notFound();

  return (
    <AdminShell title={`Edit ${page.title}`}>
      <Panel title="Page text">
        <Field label="Title">
          <Input defaultValue={page.title} disabled />
        </Field>
        <Field label="Introduction">
          <textarea rows={3} defaultValue={page.intro} disabled className={fieldClass} />
        </Field>
        {page.sections.map((section) => (
          <Field key={section.heading} label={section.heading}>
            <textarea rows={4} defaultValue={section.paragraphs.join("\n\n")} disabled className={fieldClass} />
          </Field>
        ))}
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled>
          Save draft
        </Button>
        <Button disabled>Publish</Button>
      </div>
    </AdminShell>
  );
}
