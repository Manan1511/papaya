import { describe, expect, it } from "vitest";
import type { Cart } from "../shopify/schemas";
import { priceBag, type ShippingRules } from "./pricing";

const inr = (amount: string) => ({ amount, currencyCode: "INR" });
const free: ShippingRules = { feePaise: 0, freeAbovePaise: null };

function cart(overrides: {
  subtotal?: string;
  total?: string;
  currency?: string;
  available?: boolean;
  codes?: Cart["discountCodes"];
  lines?: number;
}): Cart {
  const currency = overrides.currency ?? "INR";
  return {
    id: "gid://shopify/Cart/c1-abc",
    checkoutUrl: "https://example.myshopify.com/cart/c/abc",
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: overrides.subtotal ?? "2000.00", currencyCode: currency },
      totalAmount: { amount: overrides.total ?? "2000.00", currencyCode: currency },
    },
    discountCodes: overrides.codes ?? [],
    lines: {
      nodes: Array.from({ length: overrides.lines ?? 1 }, (_, i) => ({
        id: `gid://shopify/CartLine/${i}`,
        quantity: 2,
        cost: { totalAmount: inr("1000.00") },
        merchandise: {
          id: `gid://shopify/ProductVariant/${i + 1}`,
          title: "Default Title",
          availableForSale: overrides.available ?? true,
          price: inr("1000.00"),
          image: null,
          product: { handle: "sun-necklace", title: "Sun necklace" },
        },
      })),
    },
  };
}

describe("priceBag", () => {
  it("prices the bag from the cart Shopify holds", () => {
    const result = priceBag(cart({}), free);
    expect(result).toMatchObject({
      ok: true,
      bag: { subtotalPaise: 200000, discountPaise: 0, shippingPaise: 0, totalPaise: 200000, discountCode: "" },
    });
    if (result.ok) expect(result.bag.lines).toEqual([{ variantId: "gid://shopify/ProductVariant/1", quantity: 2 }]);
  });

  it("takes the discount as what Shopify removed from the subtotal, and names the accepted code", () => {
    const result = priceBag(
      cart({ total: "1800.00", codes: [{ code: "SUMMER", applicable: true }] }),
      free,
    );
    expect(result).toMatchObject({ ok: true, bag: { discountPaise: 20000, totalPaise: 180000, discountCode: "SUMMER" } });
  });

  it("ignores a code Shopify did not accept", () => {
    const result = priceBag(cart({ codes: [{ code: "OLD", applicable: false }] }), free);
    expect(result).toMatchObject({ ok: true, bag: { discountCode: "", discountPaise: 0 } });
  });

  it("adds the shipping fee to the charge", () => {
    const result = priceBag(cart({}), { feePaise: 9900, freeAbovePaise: null });
    expect(result).toMatchObject({ ok: true, bag: { shippingPaise: 9900, totalPaise: 209900 } });
  });

  it("waives the fee once the subtotal reaches the free-shipping threshold", () => {
    const rules = { feePaise: 9900, freeAbovePaise: 200000 };
    expect(priceBag(cart({}), rules)).toMatchObject({ ok: true, bag: { shippingPaise: 0, totalPaise: 200000 } });
    expect(priceBag(cart({ subtotal: "1999.99", total: "1999.99" }), rules)).toMatchObject({
      ok: true,
      bag: { shippingPaise: 9900 },
    });
  });

  it("refuses an empty bag", () => {
    expect(priceBag(cart({ lines: 0 }), free)).toMatchObject({ ok: false });
  });

  it("refuses a bag with a sold-out line", () => {
    expect(priceBag(cart({ available: false }), free)).toMatchObject({ ok: false, message: expect.stringContaining("sold out") });
  });

  it("refuses any currency but rupees", () => {
    expect(priceBag(cart({ currency: "USD" }), free)).toMatchObject({ ok: false });
  });

  it("refuses a total under one rupee", () => {
    expect(priceBag(cart({ subtotal: "0.50", total: "0.50" }), free)).toMatchObject({ ok: false });
  });
});
