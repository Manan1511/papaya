import type { Limit } from "./rate-limit";

const MINUTE = 60_000;

export type Rule = Limit & { name: string };

// How many POSTs one address may send per minute. Server actions are POSTs to the page they belong
// to, so "/checkout" covers starting and confirming a payment. Only POSTs are limited: they are what
// changes things, and they cost an API call each.
export function limitFor(method: string, pathname: string): Rule | null {
  if (method !== "POST") return null;

  // Razorpay's calls carry a signature that is checked. The limit only stops a flood of forged ones.
  if (pathname === "/api/razorpay/webhook") return { name: "razorpay-webhook", limit: 120, windowMs: MINUTE };
  // Shopify's catalog webhook can arrive in bursts after a bulk edit, and is signature-checked too.
  if (pathname.startsWith("/api/")) return null;

  // Each payment attempt makes a Razorpay order, so keep this low. A real shopper makes a few.
  if (pathname === "/checkout") return { name: "payment", limit: 15, windowMs: MINUTE };
  if (pathname === "/admin/login") return { name: "admin-login", limit: 20, windowMs: MINUTE };
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return { name: "admin", limit: 120, windowMs: MINUTE };

  // Add to bag, quantity changes, discount codes, and search suggestions while typing.
  return { name: "store-action", limit: 240, windowMs: MINUTE };
}

// Admin pages other than the sign-in page. The proxy turns away a request with no session cookie
// before the page runs. Whether the cookie is genuine is still checked by the page and each action.
export function isAdminArea(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
