import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinalizeError, finalizePayment } from "../../../../lib/checkout/finalize";
import { getRazorpayConfig } from "../../../../lib/payments/config";
import { POST } from "./route";

vi.mock("server-only", () => ({}));
vi.mock("../../../../lib/payments/config", () => ({ getRazorpayConfig: vi.fn() }));
vi.mock("../../../../lib/checkout/finalize", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../../lib/checkout/finalize")>()),
  finalizePayment: vi.fn(),
}));

const config = { keyId: "rzp_test_abc", keySecret: "key-secret", webhookSecret: "hook-secret", testMode: true };

function event(overrides: { event?: string; orderId?: string | null; ageSeconds?: number } = {}) {
  return JSON.stringify({
    event: overrides.event ?? "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_BBBBBB",
          order_id: overrides.orderId === undefined ? "order_AAAAAA" : overrides.orderId,
          created_at: Math.floor(Date.now() / 1000) - (overrides.ageSeconds ?? 600),
        },
      },
    },
  });
}

function request(body: string, secret = "hook-secret") {
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  return new Request("https://example.com/api/razorpay/webhook", {
    method: "POST",
    headers: { "x-razorpay-signature": signature },
    body,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getRazorpayConfig).mockReturnValue(config);
  vi.mocked(finalizePayment).mockResolvedValue({ name: "#1001" });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("Razorpay webhook", () => {
  it("makes the order for a captured payment the browser never confirmed", async () => {
    const response = await POST(request(event()));

    expect(response.status).toBe(200);
    expect(finalizePayment).toHaveBeenCalledWith(config, { razorpayOrderId: "order_AAAAAA", paymentId: "pay_BBBBBB" });
  });

  it("rejects a body signed with the wrong secret", async () => {
    const response = await POST(request(event(), "someone-else"));

    expect(response.status).toBe(401);
    expect(finalizePayment).not.toHaveBeenCalled();
  });

  it("rejects a request with no signature", async () => {
    const response = await POST(new Request("https://example.com/api/razorpay/webhook", { method: "POST", body: event() }));
    expect(response.status).toBe(401);
  });

  it("is off until the webhook secret is set", async () => {
    vi.mocked(getRazorpayConfig).mockReturnValue({ ...config, webhookSecret: undefined });
    expect((await POST(request(event()))).status).toBe(500);
  });

  it("asks Razorpay to retry while the shopper's browser may still be confirming", async () => {
    const response = await POST(request(event({ ageSeconds: 10 })));

    expect(response.status).toBe(503);
    expect(finalizePayment).not.toHaveBeenCalled();
  });

  it("ignores events it doesn't act on and payments from outside this checkout", async () => {
    expect((await POST(request(event({ event: "payment.failed" })))).status).toBe(200);
    expect((await POST(request(event({ orderId: null })))).status).toBe(200);
    expect((await POST(request(JSON.stringify({ event: "refund.created" })))).status).toBe(200);
    expect(finalizePayment).not.toHaveBeenCalled();
  });

  it("retries when the order couldn't be finished, and gives up on a payment that can never match", async () => {
    vi.mocked(finalizePayment).mockRejectedValueOnce(new Error("Shopify is down"));
    expect((await POST(request(event()))).status).toBe(500);

    vi.mocked(finalizePayment).mockRejectedValueOnce(new FinalizeError("not-captured", "authorized"));
    expect((await POST(request(event()))).status).toBe(500);

    vi.mocked(finalizePayment).mockRejectedValueOnce(new FinalizeError("no-order-details", "no notes"));
    expect((await POST(request(event()))).status).toBe(200);
  });
});
