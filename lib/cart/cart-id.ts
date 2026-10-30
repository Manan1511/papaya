// Name of the httpOnly cookie that holds the Storefront cart ID.
export const CART_COOKIE = "papaya_cart";

// Shopify cart IDs look like gid://shopify/Cart/c1-<token>?key=<token>.
const CART_ID = /^gid:\/\/shopify\/Cart\/[A-Za-z0-9?=&_.%-]{1,300}$/;

export function isCartId(value: unknown): value is string {
  return typeof value === "string" && CART_ID.test(value);
}
