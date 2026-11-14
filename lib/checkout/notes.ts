import { z } from "zod";

// Everything needed to build the Shopify order, small enough to ride in a Razorpay order's notes.
// The browser's confirm call and Razorpay's webhook both rebuild the order from these notes, so
// neither trusts anything the browser sends after the payment.
export type OrderDraft = {
  lines: { variantId: string; quantity: number }[];
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pin: string;
  discountCode: string;
  discountPaise: number;
  shippingPaise: number;
};

export class NotesTooLargeError extends Error {}

// Razorpay allows 15 notes. A value is cut off past 256 characters, so keep well under that.
const MAX_VALUE = 250;
const LINE_KEYS = ["l1", "l2", "l3"] as const;

// Notes added after the order is placed. "so" holds the Shopify order name once it exists.
export const ORDER_DONE_KEY = "so";

const VARIANT_GID = /^gid:\/\/shopify\/ProductVariant\/(\d+)$/;

function packLines(lines: OrderDraft["lines"]): Record<string, string> {
  const parts = lines.map((line) => {
    const id = VARIANT_GID.exec(line.variantId)?.[1];
    if (!id) throw new Error(`Not a product variant: ${line.variantId}`);
    return `${id}:${line.quantity}`;
  });

  // Fill each key with whole entries so a variant never splits across two keys.
  const packed: Record<string, string> = {};
  let key = 0;
  let current = "";
  for (const part of parts) {
    const next = current ? `${current},${part}` : part;
    if (next.length <= MAX_VALUE) {
      current = next;
      continue;
    }
    if (key >= LINE_KEYS.length - 1) throw new NotesTooLargeError("Too many different items for one order");
    packed[LINE_KEYS[key++]] = current;
    current = part;
  }
  if (current) packed[LINE_KEYS[key]] = current;
  return packed;
}

export function packNotes(draft: OrderDraft): Record<string, string> {
  const notes: Record<string, string> = {
    ...packLines(draft.lines),
    nm: draft.name,
    em: draft.email,
    ph: draft.phone,
    a1: draft.address1,
    a2: draft.address2,
    ct: draft.city,
    st: draft.state,
    zp: draft.pin,
    dc: draft.discountCode,
    dd: String(draft.discountPaise),
    sh: String(draft.shippingPaise),
  };
  for (const [key, value] of Object.entries(notes)) {
    if (value.length > MAX_VALUE) throw new NotesTooLargeError(`Order note ${key} is too long`);
  }
  return notes;
}

const lineEntry = /^(\d+):([1-9]\d?)$/;

const paiseString = z.string().regex(/^\d{1,9}$/).transform(Number);

const notesSchema = z.object({
  nm: z.string().min(1),
  em: z.string().min(1),
  ph: z.string().min(1),
  a1: z.string().min(1),
  a2: z.string().default(""),
  ct: z.string().min(1),
  st: z.string().min(1),
  zp: z.string().min(1),
  dc: z.string().default(""),
  dd: paiseString,
  sh: paiseString,
});

// Null when the notes don't describe a whole order, so a payment that wasn't made by this checkout
// is left for a person to look at instead of becoming a half-filled order.
export function unpackNotes(notes: Record<string, string>): OrderDraft | null {
  const lines: OrderDraft["lines"] = [];
  for (const key of LINE_KEYS) {
    const value = notes[key];
    if (!value) continue;
    for (const entry of value.split(",")) {
      const match = lineEntry.exec(entry);
      if (!match) return null;
      lines.push({ variantId: `gid://shopify/ProductVariant/${match[1]}`, quantity: Number(match[2]) });
    }
  }
  if (lines.length === 0) return null;

  const parsed = notesSchema.safeParse(notes);
  if (!parsed.success) return null;
  const n = parsed.data;
  return {
    lines,
    name: n.nm,
    email: n.em,
    phone: n.ph,
    address1: n.a1,
    address2: n.a2,
    city: n.ct,
    state: n.st,
    pin: n.zp,
    discountCode: n.dc,
    discountPaise: n.dd,
    shippingPaise: n.sh,
  };
}
