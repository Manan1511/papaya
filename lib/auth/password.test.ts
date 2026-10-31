import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword and verifyPassword", () => {
  it("accepts the password a hash was made from and rejects other passwords", async () => {
    const stored = await hashPassword("correct horse battery");

    expect(stored.startsWith("scrypt:")).toBe(true);
    expect(await verifyPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyPassword("correct horse batterY", stored)).toBe(false);
  });

  it("salts each hash, so the same password gives different strings", async () => {
    expect(await hashPassword("same password here")).not.toBe(await hashPassword("same password here"));
  });

  it("treats malformed or out-of-range hashes as a mismatch", async () => {
    expect(await verifyPassword("anything", "")).toBe(false);
    expect(await verifyPassword("anything", "md5:abc")).toBe(false);
    expect(await verifyPassword("anything", "scrypt:1:8:1:abc:def")).toBe(false);
    expect(await verifyPassword("anything", "scrypt:32768:8:1:abc:def:extra")).toBe(false);
  });
});
