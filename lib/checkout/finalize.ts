import "server-only";
import type { RazorpayConfig } from "../payments/config";
import {
  captureRazorpayPayment,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  setRazorpayOrderNotes,
} from "../payments/razorpay";
import { ORDER_DONE_KEY, unpackNotes } from "./notes";
import { createShopifyOrder, findOrderByTag, paymentTag } from "./shopify-order";

export type PaidOrder = { name: string };

// Why a payment could not be turned into an order. The browser shows a message for each. The webhook
// retries the ones that may clear up (not captured yet) and gives up on the rest.
export class FinalizeError extends Error {
  constructor(
    readonly reason: "not-captured" | "mismatch" | "no-order-details",
    message: string,
  ) {
    super(message);
  }
}

// Turns a captured Razorpay payment into a Shopify order, once. The browser's confirm call and
// Razorpay's webhook both come through here, so whichever arrives first makes the order and the
// other finds it. The order is rebuilt from the notes saved when the payment was created, and the
// amount comes from Razorpay's own record, not from anything the browser sends.
export async function finalizePayment(
  config: RazorpayConfig,
  ids: { razorpayOrderId: string; paymentId: string },
): Promise<PaidOrder> {
  const rzpOrder = await fetchRazorpayOrder(config, ids.razorpayOrderId);

  // Fast check: the order was made for this payment already.
  const done = rzpOrder.notes[ORDER_DONE_KEY];
  if (done) return { name: done };

  let payment = await fetchRazorpayPayment(config, ids.paymentId);
  if (payment.order_id !== rzpOrder.id) throw new FinalizeError("mismatch", "That payment belongs to a different order");
  if (payment.currency !== "INR" || payment.amount !== rzpOrder.amount) {
    throw new FinalizeError("mismatch", "The payment doesn't match the order amount");
  }

  if (payment.status === "authorized") payment = await captureRazorpayPayment(config, payment.id, payment.amount);
  if (payment.status !== "captured") throw new FinalizeError("not-captured", `Payment is ${payment.status}`);

  // Slower check, for an order made before the note could be saved.
  const existing = await findOrderByTag(paymentTag(rzpOrder.id));
  if (existing) {
    await rememberOrder(config, rzpOrder.id, rzpOrder.notes, existing.name);
    return { name: existing.name };
  }

  const draft = unpackNotes(rzpOrder.notes);
  if (!draft) throw new FinalizeError("no-order-details", "The payment has no order details to build from");

  const created = await createShopifyOrder(draft, {
    razorpayOrderId: rzpOrder.id,
    paymentId: payment.id,
    chargedPaise: payment.amount,
    testMode: config.testMode,
  });
  await rememberOrder(config, rzpOrder.id, rzpOrder.notes, created.name);
  return { name: created.name };
}

// Best effort: the order tag already guards against a repeat, so a failed note is only logged.
async function rememberOrder(config: RazorpayConfig, razorpayOrderId: string, notes: Record<string, string>, name: string) {
  try {
    await setRazorpayOrderNotes(config, razorpayOrderId, { ...notes, [ORDER_DONE_KEY]: name });
  } catch (error) {
    console.error("Couldn't record the Shopify order on the Razorpay order", error instanceof Error ? error.message : error);
  }
}
