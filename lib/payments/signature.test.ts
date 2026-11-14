import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPaymentSignature, verifyRazorpayWebhook } from "./signature";

const hex = (secret: string, text: string) => createHmac("sha256", secret).update(text).digest("hex");

describe("verifyPaymentSignature", () => {
  const payment = { orderId: "order_A1", paymentId: "pay_B2" };
  const signature = hex("key-secret", "order_A1|pay_B2");

  it("accepts the signature Razorpay made for that order and payment", () => {
    expect(verifyPaymentSignature({ ...payment, signature }, "key-secret")).toBe(true);
  });

  it("rejects a signature made with another secret", () => {
    expect(verifyPaymentSignature({ ...payment, signature: hex("other", "order_A1|pay_B2") }, "key-secret")).toBe(false);
  });

  it("rejects a valid signature paired with a different payment or order", () => {
    expect(verifyPaymentSignature({ orderId: "order_A1", paymentId: "pay_OTHER", signature }, "key-secret")).toBe(false);
    expect(verifyPaymentSignature({ orderId: "order_OTHER", paymentId: "pay_B2", signature }, "key-secret")).toBe(false);
  });

  it("rejects empty and wrong-length signatures without throwing", () => {
    expect(verifyPaymentSignature({ ...payment, signature: "" }, "key-secret")).toBe(false);
    expect(verifyPaymentSignature({ ...payment, signature: "abc" }, "key-secret")).toBe(false);
  });
});

describe("verifyRazorpayWebhook", () => {
  const body = JSON.stringify({ event: "payment.captured" });

  it("accepts a body signed with the webhook secret", () => {
    expect(verifyRazorpayWebhook(body, hex("hook-secret", body), "hook-secret")).toBe(true);
  });

  it("rejects a changed body, a wrong secret and a missing header", () => {
    expect(verifyRazorpayWebhook(`${body} `, hex("hook-secret", body), "hook-secret")).toBe(false);
    expect(verifyRazorpayWebhook(body, hex("other", body), "hook-secret")).toBe(false);
    expect(verifyRazorpayWebhook(body, null, "hook-secret")).toBe(false);
  });
});
