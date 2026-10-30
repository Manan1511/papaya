"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { CART_COOKIE } from "./cart-id";
import {
  type CartResult,
  addLine,
  applyDiscountCode,
  createCart,
  removeLine,
  setLineQuantity,
} from "./cart";
import { CART_COOKIE_OPTIONS, readCartId } from "./session";

export type CartState = { error?: string; ok?: boolean };

const variantIdSchema = z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/);
const lineIdSchema = z.string().regex(/^gid:\/\/shopify\/CartLine\/[A-Za-z0-9?=&_.%-]{1,300}$/);

const addSchema = z.object({
  variantId: variantIdSchema,
  quantity: z.coerce.number().int().min(1).max(10),
});

const updateSchema = z.object({
  lineId: lineIdSchema,
  // Zero removes the line, which is how the drawer's Remove button works.
  quantity: z.coerce.number().int().min(0).max(10),
});

const discountSchema = z.object({
  code: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/),
});

// Every action checks its input and reports failures as messages, never as thrown errors.
export async function addToCart(_previous: CartState, formData: FormData): Promise<CartState> {
  const parsed = addSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { error: "Choose a size and quantity." };
  const { variantId, quantity } = parsed.data;

  const existing = await readCartId();
  let outcome: CartResult | null = existing ? await addLine(existing, variantId, quantity) : null;
  // No cart yet, or the stored cart has expired on Shopify's side: start a fresh one.
  if (!outcome?.cart) outcome = await createCart(variantId, quantity);

  if (outcome.errors.length > 0 || !outcome.cart) {
    return { error: outcome.errors[0] ?? "We couldn't add that to your bag." };
  }

  if (outcome.cart.id !== existing) {
    (await cookies()).set(CART_COOKIE, outcome.cart.id, CART_COOKIE_OPTIONS);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartLine(_previous: CartState, formData: FormData): Promise<CartState> {
  const cartId = await readCartId();
  const parsed = updateSchema.safeParse({
    lineId: formData.get("lineId"),
    quantity: formData.get("quantity"),
  });
  if (!cartId || !parsed.success) return { error: "Your bag could not be updated." };

  const outcome =
    parsed.data.quantity === 0
      ? await removeLine(cartId, parsed.data.lineId)
      : await setLineQuantity(cartId, parsed.data.lineId, parsed.data.quantity);
  revalidatePath("/", "layout");
  return outcome.errors.length > 0 ? { error: outcome.errors[0] } : { ok: true };
}

export async function applyDiscount(_previous: CartState, formData: FormData): Promise<CartState> {
  const cartId = await readCartId();
  const parsed = discountSchema.safeParse({ code: formData.get("code") });
  if (!cartId || !parsed.success) return { error: "Enter a valid discount code." };

  const code = parsed.data.code;
  const outcome = await applyDiscountCode(cartId, code);
  revalidatePath("/", "layout");
  if (outcome.errors.length > 0) return { error: outcome.errors[0] };

  const applied = outcome.cart?.discountCodes.some(
    (entry) => entry.code.toUpperCase() === code.toUpperCase() && entry.applicable,
  );
  return applied ? { ok: true } : { error: "That code can't be applied to your bag." };
}
