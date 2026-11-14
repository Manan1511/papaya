import { z } from "zod";
import { FinalizeError, finalizePayment } from "../../../../lib/checkout/finalize";
import { getRazorpayConfig } from "../../../../lib/payments/config";
import { razorpayOrderId, razorpayPaymentId } from "../../../../lib/payments/razorpay";
import { verifyRazorpayWebhook } from "../../../../lib/payments/signature";

// A shopper who pays and then closes the tab never reaches the confirm call. Razorpay tells us about
// every captured payment here, so the order still gets made.
const eventSchema = z.object({
  event: z.string(),
  payload: z
    .object({
      payment: z.object({
        entity: z.object({ id: razorpayPaymentId, order_id: razorpayOrderId.nullable(), created_at: z.number() }),
      }),
    })
    .optional(),
});

// The shopper's own browser is usually still confirming for a moment after the payment. Leave it that
// long before stepping in, so the two don't both try to make the order.
const LET_BROWSER_FINISH_SECONDS = 120;

export async function POST(request: Request) {
  const config = getRazorpayConfig();
  if (!config?.webhookSecret) return new Response("Webhook secret is not configured", { status: 500 });

  const body = await request.text();
  if (!verifyRazorpayWebhook(body, request.headers.get("x-razorpay-signature"), config.webhookSecret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  const event = eventSchema.safeParse(json);
  if (!event.success || event.data.event !== "payment.captured" || !event.data.payload) {
    return new Response(null, { status: 200 }); // Not an event this checkout acts on.
  }

  const payment = event.data.payload.payment.entity;
  if (!payment.order_id) return new Response(null, { status: 200 }); // Not made through this checkout.

  const ageSeconds = Date.now() / 1000 - payment.created_at;
  if (ageSeconds < LET_BROWSER_FINISH_SECONDS) {
    // Razorpay retries a non-2xx answer later.
    return new Response("Try again shortly", { status: 503 });
  }

  try {
    await finalizePayment(config, { razorpayOrderId: payment.order_id, paymentId: payment.id });
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook couldn't finish an order", error instanceof Error ? error.message : error);
    // Retrying can't fix a payment that doesn't match its order or has no order details.
    if (error instanceof FinalizeError && error.reason !== "not-captured") return new Response(null, { status: 200 });
    return new Response("Could not finish the order", { status: 500 });
  }
}
