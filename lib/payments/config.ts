import "server-only";
import { z } from "zod";

const razorpayEnv = z.object({
  RAZORPAY_KEY_ID: z.string().regex(/^rzp_(test|live)_[A-Za-z0-9]+$/),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  // Only the webhook needs this. Checkout works without it, but then a payment made after the
  // shopper closes the tab can't be turned into an order.
  webhookSecret: string | undefined;
  // True for rzp_test_ keys. Orders made with them are flagged as test orders in Shopify.
  testMode: boolean;
};

// Null until the key pair is set, so the checkout can say payments aren't ready instead of failing.
export function getRazorpayConfig(): RazorpayConfig | null {
  // A blank line copied from .env.example means the variable is unset.
  const source = Object.fromEntries(Object.entries(process.env).map(([key, value]) => [key, value || undefined]));
  const parsed = razorpayEnv.safeParse(source);
  if (!parsed.success) return null;

  return {
    keyId: parsed.data.RAZORPAY_KEY_ID,
    keySecret: parsed.data.RAZORPAY_KEY_SECRET,
    webhookSecret: parsed.data.RAZORPAY_WEBHOOK_SECRET,
    testMode: parsed.data.RAZORPAY_KEY_ID.startsWith("rzp_test_"),
  };
}
