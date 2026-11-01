import "server-only";
import { cache } from "react";
import * as documents from "./documents";
import * as schemas from "./schemas";
import { storefront } from "./storefront";

// The legal pages show the shop's own policies, written in Shopify's policy editor. Checkout links to
// the same text, so the site and checkout agree. Policies are read on each visit, so an edit shows at once.
const POLICY_FIELDS = {
  "privacy-policy": "privacyPolicy",
  "terms-of-service": "termsOfService",
  "refund-policy": "refundPolicy",
} as const;

export type PolicyHandle = keyof typeof POLICY_FIELDS;

export function isPolicyHandle(handle: string): handle is PolicyHandle {
  return Object.hasOwn(POLICY_FIELDS, handle);
}

// Null until the policy is written in Shopify. `cache` lets the page and its metadata share one request.
export const getPolicy = cache(async (handle: PolicyHandle): Promise<schemas.ShopPolicy | null> => {
  const data = await storefront(documents.SHOP_POLICIES_QUERY, schemas.shopPoliciesResponse, {}, "no-store");
  return data.shop[POLICY_FIELDS[handle]];
});
