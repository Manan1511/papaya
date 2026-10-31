import { AdminShell } from "../../../../components/admin/shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { emptyRichText } from "../../../../lib/cms/rich-text";
import { PostForm } from "../post-form";

export default async function NewPost() {
  await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AdminShell title="New post">
      <PostForm
        initial={{
          slug: "",
          title: "",
          category: "Travel",
          excerpt: "",
          featured: false,
          publishedOn: today,
          body: emptyRichText,
        }}
      />
    </AdminShell>
  );
}
