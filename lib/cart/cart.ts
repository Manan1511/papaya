import "server-only";
import * as documents from "../shopify/documents";
import * as schemas from "../shopify/schemas";
import { storefront } from "../shopify/storefront";

// A bag is per shopper and changes on every action, so it is never cached.
const NO_CACHE = "no-store" as const;

export type CartResult = { cart: schemas.Cart | null; errors: string[] };

function toResult(payload: { cart: schemas.Cart | null; userErrors: { message: string }[] }): CartResult {
  return { cart: payload.cart, errors: payload.userErrors.map((error) => error.message) };
}

export async function fetchCart(id: string): Promise<schemas.Cart | null> {
  const data = await storefront(documents.CART_QUERY, schemas.cartQueryResponse, { id }, NO_CACHE);
  return data.cart;
}

export async function createCart(merchandiseId: string, quantity: number): Promise<CartResult> {
  const data = await storefront(
    documents.CART_CREATE_MUTATION,
    schemas.cartCreateResponse,
    { input: { lines: [{ merchandiseId, quantity }] } },
    NO_CACHE,
  );
  return toResult(data.cartCreate);
}

export async function addLine(cartId: string, merchandiseId: string, quantity: number): Promise<CartResult> {
  const data = await storefront(
    documents.CART_LINES_ADD_MUTATION,
    schemas.cartLinesAddResponse,
    { cartId, lines: [{ merchandiseId, quantity }] },
    NO_CACHE,
  );
  return toResult(data.cartLinesAdd);
}

export async function setLineQuantity(cartId: string, lineId: string, quantity: number): Promise<CartResult> {
  const data = await storefront(
    documents.CART_LINES_UPDATE_MUTATION,
    schemas.cartLinesUpdateResponse,
    { cartId, lines: [{ id: lineId, quantity }] },
    NO_CACHE,
  );
  return toResult(data.cartLinesUpdate);
}

export async function removeLine(cartId: string, lineId: string): Promise<CartResult> {
  const data = await storefront(
    documents.CART_LINES_REMOVE_MUTATION,
    schemas.cartLinesRemoveResponse,
    { cartId, lineIds: [lineId] },
    NO_CACHE,
  );
  return toResult(data.cartLinesRemove);
}

export async function applyDiscountCode(cartId: string, code: string): Promise<CartResult> {
  const data = await storefront(
    documents.CART_DISCOUNT_CODES_MUTATION,
    schemas.cartDiscountCodesResponse,
    { cartId, discountCodes: [code] },
    NO_CACHE,
  );
  return toResult(data.cartDiscountCodesUpdate);
}
