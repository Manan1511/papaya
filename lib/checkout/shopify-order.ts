import "server-only";
import { z } from "zod";
import { fromPaise, toPaise } from "../payments/money";
import { adminRequest } from "../shopify/admin";
import type { OrderDraft } from "./notes";
import { stateName } from "./schema";

export type CreatedOrder = { id: string; name: string };

export type Charge = {
  razorpayOrderId: string;
  paymentId: string;
  chargedPaise: number;
  testMode: boolean;
};

const FIND = `query ($query: String!) {
  orders(first: 1, query: $query) { nodes { id name } }
}`;

const CREATE = `mutation ($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
  orderCreate(order: $order, options: $options) {
    order { id name totalPriceSet { shopMoney { amount } } }
    userErrors { field message }
  }
}`;

const TAGS_ADD = `mutation ($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) { userErrors { message } }
}`;

const findResult = z.object({ orders: z.object({ nodes: z.array(z.object({ id: z.string(), name: z.string() })) }) });

const createResult = z.object({
  orderCreate: z.object({
    order: z
      .object({ id: z.string(), name: z.string(), totalPriceSet: z.object({ shopMoney: z.object({ amount: z.string() }) }) })
      .nullable(),
    userErrors: z.array(z.object({ message: z.string() })),
  }),
});

const tagsResult = z.object({ tagsAdd: z.object({ userErrors: z.array(z.object({ message: z.string() })) }) });

// Every order made for a Razorpay order carries this tag, which is how a repeat is spotted.
export const paymentTag = (razorpayOrderId: string) => `rzp_${razorpayOrderId}`;

// Razorpay order ids are letters, digits and underscores, so the tag is safe inside the search query.
export async function findOrderByTag(tag: string): Promise<CreatedOrder | null> {
  if (!/^[A-Za-z0-9_]+$/.test(tag)) throw new Error("Unexpected characters in an order tag");
  const data = await adminRequest(FIND, findResult, { query: `tag:${tag}` }, "no-store");
  return data.orders.nodes[0] ?? null;
}

const money = (paise: number) => ({ shopMoney: { amount: fromPaise(paise), currencyCode: "INR" } });

type Shape = { provinceCode: boolean; customerRecord: boolean };

function orderInput(draft: OrderDraft, charge: Charge, shape: Shape) {
  const [firstName, ...rest] = draft.name.split(/\s+/);
  const lastName = rest.join(" ");
  const phone = `+91${draft.phone}`;

  // If Shopify won't take the state code, the state's name goes on the address instead.
  const address2 = shape.provinceCode ? draft.address2 : [draft.address2, stateName(draft.state)].filter(Boolean).join(", ");
  const address = {
    firstName,
    lastName,
    address1: draft.address1,
    address2,
    city: draft.city,
    zip: draft.pin,
    countryCode: "IN",
    phone,
    ...(shape.provinceCode ? { provinceCode: draft.state } : {}),
  };

  return {
    currency: "INR",
    email: draft.email,
    phone,
    lineItems: draft.lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    shippingAddress: address,
    billingAddress: address,
    ...(shape.customerRecord ? { customer: { toUpsert: { email: draft.email, firstName, lastName } } } : {}),
    ...(draft.discountPaise > 0
      ? {
          discountCode: {
            itemFixedDiscountCode: { code: draft.discountCode || "Discount", amountSet: money(draft.discountPaise) },
          },
        }
      : {}),
    ...(draft.shippingPaise > 0 ? { shippingLines: [{ title: "Shipping", priceSet: money(draft.shippingPaise) }] } : {}),
    financialStatus: "PAID",
    transactions: [
      {
        kind: "SALE",
        status: "SUCCESS",
        gateway: "Razorpay",
        amountSet: money(charge.chargedPaise),
        receiptJson: { razorpay_order_id: charge.razorpayOrderId, razorpay_payment_id: charge.paymentId },
        test: charge.testMode,
      },
    ],
    tags: [paymentTag(charge.razorpayOrderId), "razorpay", ...(charge.testMode ? ["razorpay-test"] : [])],
    note: `Razorpay payment ${charge.paymentId}`,
    sourceName: "web",
    test: charge.testMode,
  };
}

async function attempt(draft: OrderDraft, charge: Charge, shape: Shape) {
  const data = await adminRequest(
    CREATE,
    createResult,
    {
      order: orderInput(draft, charge, shape),
      // Without this, Shopify records the order but never takes the stock out.
      options: { inventoryBehaviour: "DECREMENT_OBEYING_POLICY", sendReceipt: !charge.testMode },
    },
    "no-store",
  );
  return data.orderCreate;
}

// The customer has already paid when this runs, so a rejected state code or a clashing customer
// record must not lose the order. A second try drops both and keeps what the shopper typed.
export async function createShopifyOrder(draft: OrderDraft, charge: Charge): Promise<CreatedOrder> {
  let result = await attempt(draft, charge, { provinceCode: true, customerRecord: true });
  if (!result.order) {
    result = await attempt(draft, charge, { provinceCode: false, customerRecord: false });
  }
  if (!result.order) {
    throw new Error(`Shopify rejected the order: ${result.userErrors.map((error) => error.message).join("; ")}`);
  }

  const order = result.order;
  // Shopify prices the lines as they are now. If that no longer matches what was charged, say so on
  // the order for a person to settle, rather than failing a payment that has already gone through.
  if (toPaise(order.totalPriceSet.shopMoney.amount) !== charge.chargedPaise) {
    console.error(`Order ${order.name} total differs from the amount charged`);
    await adminRequest(TAGS_ADD, tagsResult, { id: order.id, tags: ["amount-mismatch"] }, "no-store").catch(() => undefined);
  }
  return { id: order.id, name: order.name };
}
