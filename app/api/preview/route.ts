import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminSession } from "../../../lib/auth/session";
import { getDraftBySlug } from "../../../lib/cms/entries";
import { pageKind, postKind, slugSchema } from "../../../lib/cms/model";

// Opens a draft on the storefront. Only a signed-in admin can turn draft mode on. The address comes
// from the editor, so it is checked before it becomes a path.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const slug = slugSchema.safeParse(url.searchParams.get("slug") ?? "");
  if (!slug.success || (type !== "page" && type !== "diary")) {
    return new Response("This preview link is not valid.", { status: 400 });
  }
  if (!(await isAdminSession())) {
    return new Response("Sign in to the admin to preview drafts.", { status: 401 });
  }

  const draft =
    type === "page" ? await getDraftBySlug(pageKind, slug.data) : await getDraftBySlug(postKind, slug.data);
  if (!draft) return new Response("Nothing is saved under that address.", { status: 404 });

  (await draftMode()).enable();
  redirect(type === "page" ? `/pages/${slug.data}` : `/diary/${slug.data}`);
}
