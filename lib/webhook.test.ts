import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookHmac } from "./webhook";

const secret = "test-secret";
const body = '{"id":1,"title":"Riviera Chain"}';
const sign = (payload: string) => createHmac("sha256", secret).update(payload, "utf8").digest("base64");

describe("verifyWebhookHmac", () => {
  it("accepts a body signed with the shared secret", () => {
    expect(verifyWebhookHmac(body, sign(body), secret)).toBe(true);
  });

  it("rejects a body that changed after signing", () => {
    expect(verifyWebhookHmac(body.replace("1", "2"), sign(body), secret)).toBe(false);
  });

  it("rejects a signature made with another secret", () => {
    const forged = createHmac("sha256", "other").update(body, "utf8").digest("base64");
    expect(verifyWebhookHmac(body, forged, secret)).toBe(false);
  });

  it("rejects a missing header and a signature of the wrong length", () => {
    expect(verifyWebhookHmac(body, null, secret)).toBe(false);
    expect(verifyWebhookHmac(body, "short", secret)).toBe(false);
  });
});
