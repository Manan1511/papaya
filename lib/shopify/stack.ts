import type { Money } from "../format";
import type { StackProduct } from "./schemas";

// A stack's products in the order the admin chose them. A product that has since been unpublished or
// deleted is left out.
export function stackPieces(productIds: string[], products: StackProduct[]): StackProduct[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return productIds.flatMap((id) => byId.get(id) ?? []);
}

// The variant a piece is added as until the shopper picks another: the first one in stock.
export function defaultVariant(product: StackProduct) {
  return product.variants.nodes.find((variant) => variant.availableForSale);
}

// Added up in paise, so the total has no rounding drift. Null when there is nothing to add up.
export function sumPrices(prices: Money[]): Money | null {
  const [first] = prices;
  if (!first) return null;
  const paise = prices.reduce((total, price) => total + Math.round(Number(price.amount) * 100), 0);
  return { amount: String(paise / 100), currencyCode: first.currencyCode };
}
