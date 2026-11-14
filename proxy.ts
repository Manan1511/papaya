import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "./lib/auth/cookie";
import { clientAddress, hit } from "./lib/security/rate-limit";
import { isAdminArea, limitFor } from "./lib/security/rules";

// The webhook bodies are small JSON. Anything near this size isn't one.
const MAX_WEBHOOK_BYTES = 1_000_000;

// Runs before a page or action. It turns away what can be judged from the request alone: a flood of
// POSTs, an admin page asked for without a session, an oversized webhook. Real checks stay where the
// work happens: each admin page and action verifies the session, each payment step verifies
// Razorpay's signature.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminArea(pathname) && !request.cookies.has(ADMIN_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const rule = limitFor(request.method, pathname);
  if (rule) {
    const verdict = hit(`${rule.name}:${clientAddress(request.headers)}`, rule);
    if (!verdict.allowed) {
      return new Response("Too many requests. Please wait a moment and try again.", {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfterSeconds) },
      });
    }
  }

  if (pathname === "/api/razorpay/webhook") {
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > MAX_WEBHOOK_BYTES) return new Response("Payload too large", { status: 413 });
  }

  return NextResponse.next();
}

// Everything except Next's own files and anything with a file extension (images, fonts, the favicon).
export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
