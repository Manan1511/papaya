"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

const SITE_PATH = /^\/[a-z0-9/-]*$/;

// Turns draft mode off and goes back to the page. Only paths on this site are accepted.
export async function exitPreview(formData: FormData): Promise<void> {
  const requested = formData.get("path");
  (await draftMode()).disable();
  redirect(typeof requested === "string" && SITE_PATH.test(requested) ? requested : "/");
}
