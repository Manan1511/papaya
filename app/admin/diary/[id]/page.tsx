import { requireAdmin } from "../../../../lib/auth/session";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin/shell";
import { Field, Panel, fieldClass } from "../../../../components/admin/ui";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { diaryCategories, getDiaryPost } from "../../../../lib/content/diary";

export default async function AdminDiaryEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = getDiaryPost(id);
  if (!post) notFound();

  return (
    <AdminShell title="Edit post">
      <Panel title="Details">
        <Field label="Title">
          <Input defaultValue={post.title} disabled />
        </Field>
        <Field label="Slug">
          <Input defaultValue={post.slug} disabled />
        </Field>
        <Field label="Category">
          <select defaultValue={post.category} disabled className={fieldClass}>
            {diaryCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Excerpt">
          <textarea rows={2} defaultValue={post.excerpt} disabled className={fieldClass} />
        </Field>
        <Field label="Body">
          <textarea rows={10} defaultValue={post.body.join("\n\n")} disabled className={fieldClass} />
        </Field>
        <label className="flex items-center gap-2 font-label text-label-md text-on-surface">
          <input type="checkbox" defaultChecked={post.featured ?? false} disabled className="size-4 accent-primary" />
          Featured
        </label>
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
