import { FREE_SHIPPING_THRESHOLD_INR, SHIPPING_FEE_INR } from "../content/site";
import { toPaise } from "../payments/money";
import type { Cart } from "../shopify/schemas";

export type ShippingRules = { feePaise: number; freeAbovePaise: number | null };

// The store's shipping settings, in paise. Both settings are whole rupees.
export const shippingRules: ShippingRules = {
  feePaise: SHIPPING_FEE_INR * 100,
  freeAbovePaise: FREE_SHIPPING_THRESHOLD_INR === null ? null : FREE_SHIPPING_THRESHOLD_INR * 100,
};

export type PricedBag = {
  lines: { variantId: string; quantity: number }[];
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  // The code Shopify accepted for this bag, or "" when none applies.
  discountCode: string;
};

export type PriceResult = { ok: true; bag: PricedBag } | { ok: false; message: string };

// Razorpay won't take less than one rupee.
const MIN_CHARGE_PAISE = 100;

// The amount to charge comes from the cart Shopify holds for this shopper, never from the browser.
// Shopify has already applied the discount, so the discount is whatever it took off the subtotal.
export function priceBag(cart: Cart, rules: ShippingRules): PriceResult {
  if (cart.lines.nodes.length === 0) return { ok: false, message: "Your bag is empty." };

  const currencies = new Set([cart.cost.subtotalAmount.currencyCode, cart.cost.totalAmount.currencyCode]);
  if (currencies.size !== 1 || !currencies.has("INR")) {
    return { ok: false, message: "This store only takes payments in rupees." };
  }
  if (cart.lines.nodes.some((line) => !line.merchandise.availableForSale)) {
    return { ok: false, message: "Something in your bag just sold out. Remove it to continue." };
  }

  const subtotalPaise = toPaise(cart.cost.subtotalAmount.amount);
  const goodsPaise = toPaise(cart.cost.totalAmount.amount);
  const discountPaise = Math.max(0, subtotalPaise - goodsPaise);
  const free = rules.freeAbovePaise !== null && subtotalPaise >= rules.freeAbovePaise;
  const shippingPaise = free ? 0 : rules.feePaise;
  const totalPaise = goodsPaise + shippingPaise;

  if (totalPaise < MIN_CHARGE_PAISE) return { ok: false, message: "Your bag total is too low to check out." };

  const code = discountPaise > 0 ? cart.discountCodes.find((entry) => entry.applicable)?.code : undefined;

  return {
    ok: true,
    bag: {
      lines: cart.lines.nodes.map((line) => ({ variantId: line.merchandise.id, quantity: line.quantity })),
      subtotalPaise,
      discountPaise,
      shippingPaise,
      totalPaise,
      discountCode: code ?? "",
    },
  };
}
