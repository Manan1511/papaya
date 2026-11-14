import { createHmac, timingSafeEqual } from "node:crypto";

function matches(expected: string, received: string | null | undefined): boolean {
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

// After a payment, Razorpay's checkout hands the browser a signature over "<order>|<payment>", made
// with the key secret. Anyone can call our confirm endpoint, so this proves the payment is real.
export function verifyPaymentSignature(
  payment: { orderId: string; paymentId: string; signature: string },
  keySecret: string,
): boolean {
  const expected = createHmac("sha256", keySecret).update(`${payment.orderId}|${payment.paymentId}`).digest("hex");
  return matches(expected, payment.signature);
}

// Razorpay signs each webhook body with the webhook secret and sends the hex digest in a header.
export function verifyRazorpayWebhook(body: string, header: string | null, webhookSecret: string): boolean {
  const expected = createHmac("sha256", webhookSecret).update(body, "utf8").digest("hex");
  return matches(expected, header);
}
