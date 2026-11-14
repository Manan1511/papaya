import { describe, expect, it } from "vitest";
import { isAdminArea, limitFor } from "./rules";

describe("limitFor", () => {
  it("only limits POSTs", () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) expect(limitFor(method, "/checkout")).toBeNull();
  });

  it("keeps payment attempts low", () => {
    expect(limitFor("POST", "/checkout")).toMatchObject({ name: "payment", limit: 15 });
  });

  it("limits the Razorpay webhook but leaves Shopify's catalog webhook alone", () => {
    expect(limitFor("POST", "/api/razorpay/webhook")).toMatchObject({ name: "razorpay-webhook" });
    expect(limitFor("POST", "/api/revalidate")).toBeNull();
  });

  it("limits admin sign-in and the rest of the admin separately", () => {
    expect(limitFor("POST", "/admin/login")).toMatchObject({ name: "admin-login", limit: 20 });
    expect(limitFor("POST", "/admin/content")).toMatchObject({ name: "admin" });
    expect(limitFor("POST", "/admin")).toMatchObject({ name: "admin" });
  });

  it("gives other store actions room for search-as-you-type", () => {
    const rule = limitFor("POST", "/products/sun");
    expect(rule).toMatchObject({ name: "store-action" });
    expect(rule?.limit).toBeGreaterThanOrEqual(200);
  });
});

describe("isAdminArea", () => {
  it("covers the admin pages", () => {
    for (const path of ["/admin", "/admin/", "/admin/content", "/admin/pages/123"]) expect(isAdminArea(path)).toBe(true);
  });

  it("leaves the sign-in page open", () => {
    expect(isAdminArea("/admin/login")).toBe(false);
  });

  it("doesn't catch paths that only start with the same letters", () => {
    for (const path of ["/administrator", "/adminx", "/shop", "/"]) expect(isAdminArea(path)).toBe(false);
  });
});
