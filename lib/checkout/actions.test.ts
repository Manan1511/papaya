import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCart } from "../cart/cart";
import { readCartId } from "../cart/session";
import { getRazorpayConfig } from "../payments/config";
import { createRazorpayOrder } from "../payments/razorpay";
import type { Cart } from "../shopify/schemas";
import { confirmPayment, startPayment } from "./actions";
import { FinalizeError, finalizePayment } from "./finalize";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const cookieJar = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));
vi.mock("../cart/cart", () => ({ fetchCart: vi.fn() }));
vi.mock("../cart/session", () => ({ readCartId: vi.fn() }));
vi.mock("../payments/config", () => ({ getRazorpayConfig: vi.fn() }));
vi.mock("../payments/razorpay", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../payments/razorpay")>()),
  createRazorpayOrder: vi.fn(),
}));
vi.mock("./finalize", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./finalize")>()),
  finalizePayment: vi.fn(),
}));

const config = { keyId: "rzp_test_abc", keySecret: "key-secret", webhookSecret: "hook", testMode: true };

const address = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "9876543210",
  address1: "12 Marine Drive",
  address2: "",
  city: "Mumbai",
  state: "MH",
  pin: "400001",
};

const inr = (amount: string) => ({ amount, currencyCode: "INR" });

function cart(total = "1800.00"): Cart {
  return {
    id: "gid://shopify/Cart/c1-abc",
    checkoutUrl: "https://example.myshopify.com/cart/c/abc",
    totalQuantity: 2,
    cost: { subtotalAmount: inr("2000.00"), totalAmount: inr(total) },
    discountCodes: [{ code: "SUMMER", applicable: true }],
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          cost: { totalAmount: inr("2000.00") },
          merchandise: {
            id: "gid://shopify/ProductVariant/41000000000001",
            title: "Default Title",
            availableForSale: true,
            price: inr("1000.00"),
            image: null,
            product: { handle: "sun-necklace", title: "Sun necklace" },
          },
        },
      ],
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getRazorpayConfig).mockReturnValue(config);
  vi.mocked(readCartId).mockResolvedValue("gid://shopify/Cart/c1-abc");
  vi.mocked(fetchCart).mockResolvedValue(cart());
  vi.mocked(createRazorpayOrder).mockResolvedValue({
    id: "order_AAAAAA",
    amount: 180000,
    amount_paid: 0,
    currency: "INR",
    status: "created",
    notes: {},
  });
});

describe("startPayment", () => {
  it("charges the amount Shopify computed for the bag, whatever the browser claims", async () => {
    const result = await startPayment({ ...address, total: 1, amountPaise: 100, lines: [{ price: "1.00" }] });

    expect(result).toMatchObject({ ok: true, orderId: "order_AAAAAA", amountPaise: 180000, keyId: "rzp_test_abc" });
    expect(createRazorpayOrder).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        amountPaise: 180000,
        notes: expect.objectContaining({ dd: "20000", dc: "SUMMER", sh: "0", nm: "Asha Rao", st: "MH" }),
      }),
    );
  });

  it("reports address problems per field without calling Razorpay", async () => {
    const result = await startPayment({ ...address, phone: "123", pin: "12" });

    expect(result).toMatchObject({ ok: false, fieldErrors: { phone: expect.any(String), pin: expect.any(String) } });
    expect(createRazorpayOrder).not.toHaveBeenCalled();
  });

  it("says so when payments aren't set up", async () => {
    vi.mocked(getRazorpayConfig).mockReturnValue(null);
    expect(await startPayment(address)).toMatchObject({ ok: false, error: expect.stringContaining("aren't set up") });
  });

  it("refuses when there is no bag", async () => {
    vi.mocked(readCartId).mockResolvedValue(null);
    expect(await startPayment(address)).toMatchObject({ ok: false, error: "Your bag is empty." });
    expect(createRazorpayOrder).not.toHaveBeenCalled();
  });

  it("gives a plain message when Razorpay is unreachable", async () => {
    vi.mocked(createRazorpayOrder).mockRejectedValue(new Error("Razorpay POST /orders responded 500"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await startPayment(address)).toMatchObject({ ok: false, error: expect.stringContaining("couldn't start") });
  });
});

describe("confirmPayment", () => {
  const payment = { orderId: "order_AAAAAA", paymentId: "pay_BBBBBB" };
  const signed = (secret: string) => createHmac("sha256", secret).update("order_AAAAAA|pay_BBBBBB").digest("hex");

  it("makes the order and clears the bag when the signature is genuine", async () => {
    vi.mocked(finalizePayment).mockResolvedValue({ name: "#1001" });

    expect(await confirmPayment({ ...payment, signature: signed("key-secret") })).toEqual({ ok: true, order: "#1001" });
    expect(finalizePayment).toHaveBeenCalledWith(config, { razorpayOrderId: "order_AAAAAA", paymentId: "pay_BBBBBB" });
    expect(cookieJar.delete).toHaveBeenCalledWith("papaya_cart");
  });

  it("makes no order for a forged signature", async () => {
    expect(await confirmPayment({ ...payment, signature: signed("someone-else") })).toMatchObject({ ok: false });
    expect(finalizePayment).not.toHaveBeenCalled();
    expect(cookieJar.delete).not.toHaveBeenCalled();
  });

  it("refuses ids that aren't Razorpay's, before any lookup", async () => {
    expect(await confirmPayment({ orderId: "../admin", paymentId: "pay_BBBBBB", signature: "x" })).toMatchObject({ ok: false });
    expect(finalizePayment).not.toHaveBeenCalled();
  });

  it("keeps the bag and tells the shopper not to pay twice when the order can't be finished yet", async () => {
    vi.mocked(finalizePayment).mockRejectedValue(new Error("Shopify is down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await confirmPayment({ ...payment, signature: signed("key-secret") });
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("don't pay again") });
    expect(cookieJar.delete).not.toHaveBeenCalled();
  });

  it("doesn't promise an order for a payment that doesn't match", async () => {
    vi.mocked(finalizePayment).mockRejectedValue(new FinalizeError("mismatch", "wrong order"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await confirmPayment({ ...payment, signature: signed("key-secret") });
    expect(result).toEqual({ ok: false, error: "We couldn't confirm that payment." });
  });
});
