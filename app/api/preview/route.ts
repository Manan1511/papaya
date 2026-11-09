import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminSession } from "../../../lib/auth/session";
import { getDraftBySlug } from "../../../lib/cms/entries";
import { homeKind, pageKind, postKind, slugSchema } from "../../../lib/cms/model";

type PreviewType = "page" | "diary" | "home";

function isPreviewType(value: string | null): value is PreviewType {
  return value === "page" || value === "diary" || value === "home";
}

async function hasDraft(type: PreviewType, slug: string): Promise<boolean> {
  const draft =
    type === "page"
      ? await getDraftBySlug(pageKind, slug)
      : type === "diary"
        ? await getDraftBySlug(postKind, slug)
        : await getDraftBySlug(homeKind, slug);
  return draft !== undefined;
}

function pathFor(type: PreviewType, slug: string): string {
  if (type === "page") return `/pages/${slug}`;
  if (type === "diary") return `/diary/${slug}`;
  return "/";
}

// Opens a draft on the storefront. Only a signed-in admin can turn draft mode on. The address comes
// from the editor, so it is checked before it becomes a path.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const slug = slugSchema.safeParse(url.searchParams.get("slug") ?? "");
  if (!slug.success || !isPreviewType(type)) {
    return new Response("This preview link is not valid.", { status: 400 });
  }
  if (!(await isAdminSession())) {
    return new Response("Sign in to the admin to preview drafts.", { status: 401 });
  }
  if (!(await hasDraft(type, slug.data))) {
    return new Response("Nothing is saved under that address.", { status: 404 });
  }

  (await draftMode()).enable();
  redirect(pathFor(type, slug.data));
}
