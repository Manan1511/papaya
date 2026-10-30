import { describe, expect, it } from "vitest";
import { isCartId } from "./cart-id";

describe("isCartId", () => {
  it("accepts a Shopify cart ID with its key query", () => {
    expect(isCartId("gid://shopify/Cart/c1-0123456789abcdef?key=abc123")).toBe(true);
  });

  it("rejects other Shopify resources", () => {
    expect(isCartId("gid://shopify/Product/1")).toBe(false);
  });

  it("rejects characters that could smuggle a second value", () => {
    expect(isCartId("gid://shopify/Cart/c1;evil")).toBe(false);
  });

  it("rejects overlong values and non-strings", () => {
    expect(isCartId(`gid://shopify/Cart/${"a".repeat(301)}`)).toBe(false);
    expect(isCartId(undefined)).toBe(false);
  });
});
