import "server-only";
import { type ZodType, z } from "zod";
import type { RazorpayConfig } from "./config";

const API = "https://api.razorpay.com/v1";

export class RazorpayError extends Error {}

// Razorpay ids go into URL paths, so only their known shape is allowed in.
export const razorpayOrderId = z.string().regex(/^order_[A-Za-z0-9]{6,40}$/);
export const razorpayPaymentId = z.string().regex(/^pay_[A-Za-z0-9]{6,40}$/);

// An order with no notes comes back as [] instead of {}.
const notes = z
  .union([
    z.record(z.string(), z.union([z.string(), z.number()]).transform(String)),
    z.array(z.unknown()).transform((): Record<string, string> => ({})),
  ])
  .default({});

const orderResponse = z.object({
  id: z.string(),
  amount: z.number().int(),
  amount_paid: z.number().int(),
  currency: z.string(),
  status: z.string(),
  notes,
});

const paymentResponse = z.object({
  id: z.string(),
  order_id: z.string().nullable(),
  status: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  created_at: z.number().int(),
});

export type RazorpayOrder = z.infer<typeof orderResponse>;
export type RazorpayPayment = z.infer<typeof paymentResponse>;

const errorBody = z.object({ error: z.object({ description: z.string().optional() }).optional() });

// One call to Razorpay's REST API. Errors carry Razorpay's own description and the status, never the keys.
async function call<T>(
  config: RazorpayConfig,
  method: "GET" | "POST" | "PATCH",
  path: string,
  schema: ZodType<T>,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const description = errorBody.safeParse(json).data?.error?.description;
    throw new RazorpayError(`Razorpay ${method} ${path.split("/").slice(0, 2).join("/")} responded ${response.status}${description ? `: ${description}` : ""}`);
  }
  return schema.parse(json);
}

export function createRazorpayOrder(
  config: RazorpayConfig,
  input: { amountPaise: number; receipt: string; notes: Record<string, string> },
): Promise<RazorpayOrder> {
  return call(config, "POST", "/orders", orderResponse, {
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
}

export function fetchRazorpayOrder(config: RazorpayConfig, id: string): Promise<RazorpayOrder> {
  return call(config, "GET", `/orders/${razorpayOrderId.parse(id)}`, orderResponse);
}

export function fetchRazorpayPayment(config: RazorpayConfig, id: string): Promise<RazorpayPayment> {
  return call(config, "GET", `/payments/${razorpayPaymentId.parse(id)}`, paymentResponse);
}

// A payment that was authorised but not captured is refunded after a few days, so capture it here.
export function captureRazorpayPayment(config: RazorpayConfig, id: string, amountPaise: number): Promise<RazorpayPayment> {
  return call(config, "POST", `/payments/${razorpayPaymentId.parse(id)}/capture`, paymentResponse, {
    amount: amountPaise,
    currency: "INR",
  });
}

// Replaces the order's notes, so callers pass the whole set.
export function setRazorpayOrderNotes(config: RazorpayConfig, id: string, all: Record<string, string>): Promise<RazorpayOrder> {
  return call(config, "PATCH", `/orders/${razorpayOrderId.parse(id)}`, orderResponse, { notes: all });
}
