import "server-only";
import { draftMode } from "next/headers";
import { isAdminSession } from "../auth/session";

// Drafts need both draft mode and a signed-in admin. If the admin signs out while the draft-mode
// cookie is still in the browser, the page goes back to showing the live copy.
export async function isPreviewing(): Promise<boolean> {
  return (await draftMode()).isEnabled && (await isAdminSession());
}
