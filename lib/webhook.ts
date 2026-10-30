import { createHmac, timingSafeEqual } from "node:crypto";

// Shopify signs each webhook body with HMAC-SHA256 and sends it base64-encoded.
export function verifyWebhookHmac(body: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body, "utf8").digest("base64"));
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
