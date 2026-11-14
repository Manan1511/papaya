"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { fetchCart } from "../cart/cart";
import { CART_COOKIE } from "../cart/cart-id";
import { readCartId } from "../cart/session";
import { getRazorpayConfig } from "../payments/config";
import { createRazorpayOrder, razorpayOrderId, razorpayPaymentId } from "../payments/razorpay";
import { verifyPaymentSignature } from "../payments/signature";
import { FinalizeError, finalizePayment } from "./finalize";
import { NotesTooLargeError, packNotes } from "./notes";
import { priceBag, shippingRules } from "./pricing";
import { checkoutFormSchema } from "./schema";

export type StartPaymentResult =
  | {
      ok: true;
      keyId: string;
      orderId: string;
      amountPaise: number;
      contact: { name: string; email: string; phone: string };
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// Step 1. Checks the address, prices the bag from Shopify's own copy of it, and asks Razorpay for an
// order of exactly that amount. The browser sends the address and nothing else: no prices, no lines.
export async function startPayment(input: unknown): Promise<StartPaymentResult> {
  const config = getRazorpayConfig();
  if (!config) return { ok: false, error: "Online payments aren't set up yet." };

  const form = checkoutFormSchema.safeParse(input);
  if (!form.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(z.flattenError(form.error).fieldErrors)) {
      const first = (messages as string[] | undefined)?.[0];
      if (first) fieldErrors[field] = first;
    }
    return { ok: false, error: "Check the highlighted fields.", fieldErrors };
  }

  const cartId = await readCartId();
  const cart = cartId ? await fetchCart(cartId) : null;
  if (!cart) return { ok: false, error: "Your bag is empty." };

  const priced = priceBag(cart, shippingRules);
  if (!priced.ok) return { ok: false, error: priced.message };
  const { bag } = priced;

  const details = form.data;
  let notes: Record<string, string>;
  try {
    notes = packNotes({
      lines: bag.lines,
      name: details.name,
      email: details.email,
      phone: details.phone,
      address1: details.address1,
      address2: details.address2,
      city: details.city,
      state: details.state,
      pin: details.pin,
      discountCode: bag.discountCode,
      discountPaise: bag.discountPaise,
      shippingPaise: bag.shippingPaise,
    });
  } catch (error) {
    if (error instanceof NotesTooLargeError) {
      return { ok: false, error: "That's too many different items for one order. Split it into two." };
    }
    throw error;
  }

  try {
    const order = await createRazorpayOrder(config, {
      amountPaise: bag.totalPaise,
      receipt: `papaya_${Date.now()}`,
      notes,
    });
    return {
      ok: true,
      keyId: config.keyId,
      orderId: order.id,
      amountPaise: order.amount,
      contact: { name: details.name, email: details.email, phone: details.phone },
    };
  } catch (error) {
    console.error("Starting a payment failed", error instanceof Error ? error.message : error);
    return { ok: false, error: "We couldn't start the payment. Please try again." };
  }
}

const confirmInput = z.object({
  orderId: razorpayOrderId,
  paymentId: razorpayPaymentId,
  signature: z.string().min(1).max(200),
});

export type ConfirmPaymentResult = { ok: true; order: string } | { ok: false; error: string };

const PAID_BUT_PENDING =
  "Your payment was received, but we couldn't finish your order just now. Please don't pay again. We'll complete it shortly and email you a confirmation.";

// Step 2, once the shopper has paid. The signature proves the payment came from Razorpay. The order
// itself is rebuilt on the server, so this call carries no prices either.
export async function confirmPayment(input: unknown): Promise<ConfirmPaymentResult> {
  const config = getRazorpayConfig();
  const parsed = confirmInput.safeParse(input);
  if (!config || !parsed.success) return { ok: false, error: "We couldn't confirm that payment." };

  const { orderId, paymentId, signature } = parsed.data;
  if (!verifyPaymentSignature({ orderId, paymentId, signature }, config.keySecret)) {
    return { ok: false, error: "We couldn't confirm that payment." };
  }

  try {
    const order = await finalizePayment(config, { razorpayOrderId: orderId, paymentId });
    (await cookies()).delete(CART_COOKIE);
    revalidatePath("/", "layout");
    return { ok: true, order: order.name };
  } catch (error) {
    console.error("Confirming a payment failed", error instanceof Error ? error.message : error);
    if (error instanceof FinalizeError && error.reason === "mismatch") {
      return { ok: false, error: "We couldn't confirm that payment." };
    }
    return { ok: false, error: PAID_BUT_PENDING };
  }
}
