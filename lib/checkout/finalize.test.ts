import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RazorpayConfig } from "../payments/config";
import {
  captureRazorpayPayment,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  type RazorpayOrder,
  type RazorpayPayment,
  setRazorpayOrderNotes,
} from "../payments/razorpay";
import { FinalizeError, finalizePayment } from "./finalize";
import { type OrderDraft, packNotes } from "./notes";
import { createShopifyOrder, findOrderByTag } from "./shopify-order";

vi.mock("server-only", () => ({}));
vi.mock("../payments/razorpay", () => ({
  fetchRazorpayOrder: vi.fn(),
  fetchRazorpayPayment: vi.fn(),
  captureRazorpayPayment: vi.fn(),
  setRazorpayOrderNotes: vi.fn(),
}));
vi.mock("./shopify-order", () => ({
  createShopifyOrder: vi.fn(),
  findOrderByTag: vi.fn(),
  paymentTag: (id: string) => `rzp_${id}`,
}));

const config: RazorpayConfig = { keyId: "rzp_test_abc", keySecret: "secret", webhookSecret: "hook", testMode: true };
const ids = { razorpayOrderId: "order_AAAAAA", paymentId: "pay_BBBBBB" };

const draft: OrderDraft = {
  lines: [{ variantId: "gid://shopify/ProductVariant/41000000000001", quantity: 2 }],
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "9876543210",
  address1: "12 Marine Drive",
  address2: "",
  city: "Mumbai",
  state: "MH",
  pin: "400001",
  discountCode: "",
  discountPaise: 0,
  shippingPaise: 0,
};

function order(notes: Record<string, string>, amount = 200000): RazorpayOrder {
  return { id: ids.razorpayOrderId, amount, amount_paid: amount, currency: "INR", status: "paid", notes };
}

function payment(overrides: Partial<RazorpayPayment> = {}): RazorpayPayment {
  return {
    id: ids.paymentId,
    order_id: ids.razorpayOrderId,
    status: "captured",
    amount: 200000,
    currency: "INR",
    created_at: 1_700_000_000,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(findOrderByTag).mockResolvedValue(null);
  vi.mocked(createShopifyOrder).mockResolvedValue({ id: "gid://shopify/Order/1", name: "#1001" });
  vi.mocked(setRazorpayOrderNotes).mockResolvedValue(order({}));
  vi.mocked(fetchRazorpayOrder).mockResolvedValue(order(packNotes(draft)));
  vi.mocked(fetchRazorpayPayment).mockResolvedValue(payment());
});

describe("finalizePayment", () => {
  it("builds the order from the saved notes and the amount Razorpay actually took", async () => {
    await expect(finalizePayment(config, ids)).resolves.toEqual({ name: "#1001" });

    expect(createShopifyOrder).toHaveBeenCalledWith(draft, {
      razorpayOrderId: ids.razorpayOrderId,
      paymentId: ids.paymentId,
      chargedPaise: 200000,
      testMode: true,
    });
    expect(setRazorpayOrderNotes).toHaveBeenCalledWith(
      config,
      ids.razorpayOrderId,
      expect.objectContaining({ so: "#1001", nm: "Asha Rao" }),
    );
  });

  it("returns the existing order when the Razorpay order already records one", async () => {
    vi.mocked(fetchRazorpayOrder).mockResolvedValue(order({ ...packNotes(draft), so: "#1000" }));

    await expect(finalizePayment(config, ids)).resolves.toEqual({ name: "#1000" });
    expect(createShopifyOrder).not.toHaveBeenCalled();
    expect(fetchRazorpayPayment).not.toHaveBeenCalled();
  });

  it("returns the order Shopify already holds under the payment's tag", async () => {
    vi.mocked(findOrderByTag).mockResolvedValue({ id: "gid://shopify/Order/9", name: "#1009" });

    await expect(finalizePayment(config, ids)).resolves.toEqual({ name: "#1009" });
    expect(findOrderByTag).toHaveBeenCalledWith("rzp_order_AAAAAA");
    expect(createShopifyOrder).not.toHaveBeenCalled();
  });

  it("captures a payment that was only authorised", async () => {
    vi.mocked(fetchRazorpayPayment).mockResolvedValue(payment({ status: "authorized" }));
    vi.mocked(captureRazorpayPayment).mockResolvedValue(payment({ status: "captured" }));

    await finalizePayment(config, ids);
    expect(captureRazorpayPayment).toHaveBeenCalledWith(config, ids.paymentId, 200000);
    expect(createShopifyOrder).toHaveBeenCalledTimes(1);
  });

  it("makes no order for a payment that hasn't been captured", async () => {
    for (const status of ["created", "failed", "refunded"]) {
      vi.mocked(fetchRazorpayPayment).mockResolvedValue(payment({ status }));
      await expect(finalizePayment(config, ids)).rejects.toMatchObject({ reason: "not-captured" });
    }
    expect(createShopifyOrder).not.toHaveBeenCalled();
  });

  it("makes no order when the payment belongs to a different Razorpay order", async () => {
    vi.mocked(fetchRazorpayPayment).mockResolvedValue(payment({ order_id: "order_OTHER1" }));
    await expect(finalizePayment(config, ids)).rejects.toMatchObject({ reason: "mismatch" });
    expect(createShopifyOrder).not.toHaveBeenCalled();
  });

  it("makes no order when the amount paid isn't the amount ordered", async () => {
    vi.mocked(fetchRazorpayPayment).mockResolvedValue(payment({ amount: 100 }));
    await expect(finalizePayment(config, ids)).rejects.toMatchObject({ reason: "mismatch" });
    expect(createShopifyOrder).not.toHaveBeenCalled();
  });

  it("leaves a payment with no order details for a person, instead of guessing", async () => {
    vi.mocked(fetchRazorpayOrder).mockResolvedValue(order({}));
    await expect(finalizePayment(config, ids)).rejects.toBeInstanceOf(FinalizeError);
    await expect(finalizePayment(config, ids)).rejects.toMatchObject({ reason: "no-order-details" });
    expect(createShopifyOrder).not.toHaveBeenCalled();
  });

  it("still returns the order when the note about it can't be saved", async () => {
    vi.mocked(setRazorpayOrderNotes).mockRejectedValue(new Error("Razorpay is down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(finalizePayment(config, ids)).resolves.toEqual({ name: "#1001" });
  });
});
