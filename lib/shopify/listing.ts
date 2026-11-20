// Turns listing URL parameters into Storefront arguments. Every value is parsed and length-limited
// first, and reaches the API only as a typed variable.
import { z } from "zod";

export const SORT_OPTIONS = ["best", "newest", "price-asc", "price-desc"] as const;

const priceParam = z
  .string()
  .regex(/^\d{1,7}(\.\d{1,2})?$/)
  .transform(Number)
  .optional()
  .catch(undefined);

const listingSchema = z.object({
  sort: z.enum(SORT_OPTIONS).catch("best"),
  available: z
    .literal("1")
    .transform(() => true)
    .optional()
    .catch(undefined),
  // The product types and sizes come from the catalog, so any short text is accepted here. It only
  // ever goes to Shopify as a filter value, and a value nothing matches shows an empty listing.
  type: z.string().trim().min(1).max(80).optional().catch(undefined),
  size: z.string().trim().min(1).max(40).optional().catch(undefined),
  min: priceParam,
  max: priceParam,
  after: z.string().max(512).optional().catch(undefined),
});

export type ListingParams = z.infer<typeof listingSchema>;
export type SortKey = ListingParams["sort"];

export type ProductFilter = {
  available?: boolean;
  productType?: string;
  price?: { min?: number; max?: number };
  variantOption?: { name: string; value: string };
};

export function parseListing(input: Record<string, string | string[] | undefined>): ListingParams {
  const flat = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = listingSchema.parse(flat);
  // An inverted price range would match nothing, so drop it rather than send it.
  if (parsed.min !== undefined && parsed.max !== undefined && parsed.min > parsed.max) {
    return { ...parsed, min: undefined, max: undefined };
  }
  return parsed;
}

export function toProductFilters(params: ListingParams): ProductFilter[] {
  const filters: ProductFilter[] = [];
  if (params.available) filters.push({ available: true });
  if (params.type) filters.push({ productType: params.type });
  if (params.min !== undefined || params.max !== undefined) {
    filters.push({ price: { min: params.min, max: params.max } });
  }
  if (params.size) filters.push({ variantOption: { name: "Size", value: params.size } });
  return filters;
}

// The shop searches the whole catalog, because a collection only filters by what Shopify's Search &
// Discovery app has switched on, and that is never product type or size. A search string can filter
// by anything, so the shop uses one. Text is quoted, with quote marks and backslashes removed.
const quoted = (value: string) => `"${value.replace(/["\\]/g, "")}"`;

export function toShopSearch(params: ListingParams): string {
  const terms: string[] = [];
  if (params.available) terms.push("available_for_sale:true");
  if (params.type) terms.push(`product_type:${quoted(params.type)}`);
  if (params.size) terms.push(`variants.title:${quoted(params.size)}`);
  if (params.min !== undefined) terms.push(`variants.price:>=${params.min}`);
  if (params.max !== undefined) terms.push(`variants.price:<=${params.max}`);
  return terms.join(" ");
}

// Serialises the listing state back into URL parameters, for pagination links.
export function listingToSearch(params: ListingParams): Record<string, string> {
  const search: Record<string, string> = { sort: params.sort };
  if (params.available) search.available = "1";
  if (params.type) search.type = params.type;
  if (params.size) search.size = params.size;
  if (params.min !== undefined) search.min = String(params.min);
  if (params.max !== undefined) search.max = String(params.max);
  return search;
}

export type ListingChange = Partial<Pick<ListingParams, "sort" | "type" | "size" | "min" | "max" | "available">>;

// The address of this listing with some filters changed. A key that is present in `change` replaces
// the current value, and one set to undefined removes it. The page cursor always goes, because a new
// filter starts again from the first page.
export function listingHref(basePath: string, params: ListingParams, change: ListingChange = {}): string {
  const next: ListingParams = { ...params, after: undefined, ...change };
  const query = new URLSearchParams(listingToSearch(next)).toString();
  return `${basePath}?${query}`;
}

// Collections and the product search use different sort enums, so each has its own mapping.
export function toCollectionSort(sort: SortKey): {
  sortKey: "BEST_SELLING" | "CREATED" | "PRICE";
  reverse: boolean;
} {
  switch (sort) {
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}
