import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { resetRateLimits } from "./lib/security/rate-limit";
import { proxy } from "./proxy";

const ORIGIN = "https://shop.example";

function request(path: string, init: { method?: string; headers?: Record<string, string> } = {}) {
  return new NextRequest(`${ORIGIN}${path}`, { method: init.method ?? "GET", headers: init.headers });
}

const passed = (response: Response) => response.headers.get("x-middleware-next") === "1";

beforeEach(() => resetRateLimits());

describe("admin pages", () => {
  it("send a visitor with no session cookie to the sign-in page", () => {
    const response = proxy(request("/admin/content"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/admin/login`);
  });

  it("let a request with a session cookie through to the page, which checks it", () => {
    expect(passed(proxy(request("/admin/content", { headers: { cookie: "papaya_admin=sealed" } })))).toBe(true);
  });

  it("leave the sign-in page open", () => {
    expect(passed(proxy(request("/admin/login")))).toBe(true);
    expect(passed(proxy(request("/admin/login", { method: "POST", headers: { "x-nf-client-connection-ip": "9.9.9.9" } })))).toBe(true);
  });
});

describe("storefront", () => {
  it("lets ordinary page views through, however many", () => {
    for (let i = 0; i < 500; i++) expect(passed(proxy(request("/shop")))).toBe(true);
  });
});

describe("payment attempts", () => {
  const post = (ip: string) => proxy(request("/checkout", { method: "POST", headers: { "x-nf-client-connection-ip": ip } }));

  it("stop after 15 a minute from one address, and say when to retry", () => {
    for (let i = 0; i < 15; i++) expect(passed(post("1.1.1.1"))).toBe(true);

    const blocked = post("1.1.1.1");
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("don't affect another address", () => {
    for (let i = 0; i < 16; i++) post("1.1.1.1");
    expect(passed(post("2.2.2.2"))).toBe(true);
  });

  it("don't use up the allowance for browsing actions like add to bag", () => {
    for (let i = 0; i < 16; i++) post("1.1.1.1");
    const addToBag = proxy(request("/products/sun", { method: "POST", headers: { "x-nf-client-connection-ip": "1.1.1.1" } }));
    expect(passed(addToBag)).toBe(true);
  });
});

describe("Razorpay webhook", () => {
  it("turns away a body too large to be a webhook", () => {
    const response = proxy(
      request("/api/razorpay/webhook", { method: "POST", headers: { "content-length": "5000000", "x-nf-client-connection-ip": "3.3.3.3" } }),
    );
    expect(response.status).toBe(413);
  });

  it("lets a normal one through to be signature-checked", () => {
    const response = proxy(
      request("/api/razorpay/webhook", { method: "POST", headers: { "content-length": "900", "x-nf-client-connection-ip": "3.3.3.3" } }),
    );
    expect(passed(response)).toBe(true);
  });
});
