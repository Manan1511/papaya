import { notFound } from "next/navigation";

// Sample reviews, orders and admin data show only in development. Production builds show
// empty states, so nothing that looks like a real customer or order reaches a shopper.
export const isDevPreview = process.env.NODE_ENV !== "production";

// Admin screens have no sign-in yet, so they stay hidden in production builds.
export function requireDevPreview(): void {
  if (!isDevPreview) notFound();
}
