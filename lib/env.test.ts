import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const token = { SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "test-token" };

describe("parseEnv", () => {
  it("accepts a store domain and token, and defaults the API version", () => {
    expect(parseEnv({ SHOPIFY_STORE_DOMAIN: "papaya-dev.myshopify.com", ...token })).toEqual({
      SHOPIFY_STORE_DOMAIN: "papaya-dev.myshopify.com",
      SHOPIFY_API_VERSION: "2026-04",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "test-token",
    });
  });

  it("names the missing variables", () => {
    expect(() => parseEnv({})).toThrow(
      "Invalid environment: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
    );
  });

  it("rejects a store domain that is not a myshopify.com host", () => {
    expect(() => parseEnv({ SHOPIFY_STORE_DOMAIN: "https://evil.example", ...token })).toThrow(
      "Invalid environment: SHOPIFY_STORE_DOMAIN",
    );
  });
});
