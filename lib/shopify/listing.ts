// Turns listing URL parameters into safe Storefront arguments. Values are whitelisted,
// so nothing from the URL reaches the API unchecked.
import { z } from "zod";

export const SORT_OPTIONS = ["best", "newest", "price-asc", "price-desc"] as const;
export const PRODUCT_TYPES = ["Necklaces", "Earrings", "Rings", "Bracelets", "Anklets"] as const;
export const RING_SIZES = ["6", "7", "8", "9"] as const;

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
  type: z.enum(PRODUCT_TYPES).optional().catch(undefined),
  size: z.enum(RING_SIZES).optional().catch(undefined),
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
