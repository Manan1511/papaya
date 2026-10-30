import "server-only";
import { cookies } from "next/headers";
import { CART_COOKIE, isCartId } from "./cart-id";

// Layouts and pages can read cookies but not set them. Server actions set them.
export async function readCartId(): Promise<string | null> {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return isCartId(value) ? value : null;
}

export const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
