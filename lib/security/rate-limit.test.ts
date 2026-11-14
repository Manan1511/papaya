import { beforeEach, describe, expect, it } from "vitest";
import { clientAddress, hit, resetRateLimits } from "./rate-limit";

const rule = { limit: 3, windowMs: 60_000 };

beforeEach(() => resetRateLimits());

describe("hit", () => {
  it("allows requests up to the limit, then says how long to wait", () => {
    expect(hit("a", rule, 0)).toEqual({ allowed: true });
    expect(hit("a", rule, 1000)).toEqual({ allowed: true });
    expect(hit("a", rule, 2000)).toEqual({ allowed: true });
    expect(hit("a", rule, 3000)).toEqual({ allowed: false, retryAfterSeconds: 57 });
  });

  it("counts each client separately", () => {
    for (let i = 0; i < 3; i++) hit("a", rule, 0);
    expect(hit("a", rule, 0).allowed).toBe(false);
    expect(hit("b", rule, 0).allowed).toBe(true);
  });

  it("starts a fresh window once the old one has passed", () => {
    for (let i = 0; i < 4; i++) hit("a", rule, 0);
    expect(hit("a", rule, 60_000).allowed).toBe(true);
  });

  it("never asks for a wait shorter than a second", () => {
    for (let i = 0; i < 3; i++) hit("a", rule, 0);
    expect(hit("a", rule, 59_999)).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it("keeps its table bounded when a flood of addresses arrives", () => {
    for (let i = 0; i < 25_000; i++) hit(`flood-${i}`, rule, 0);
    expect(hit("someone-real", rule, 1).allowed).toBe(true);
  });
});

describe("clientAddress", () => {
  const headers = (entries: Record<string, string>) => new Headers(entries);

  it("trusts Netlify's header over anything the visitor sent", () => {
    expect(clientAddress(headers({ "x-nf-client-connection-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4" }))).toBe("203.0.113.9");
  });

  it("falls back to the first forwarded address", () => {
    expect(clientAddress(headers({ "x-forwarded-for": "198.51.100.7, 10.0.0.1" }))).toBe("198.51.100.7");
  });

  it("groups callers it can't identify together", () => {
    expect(clientAddress(headers({}))).toBe("unknown");
  });
});
