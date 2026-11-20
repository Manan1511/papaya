import "server-only";
import * as documents from "./documents";
import type { ProductFilter, SortKey } from "./listing";
import type { ListingParams } from "./listing";
import { toCollectionSort, toShopSearch } from "./listing";
import * as schemas from "./schemas";
import { storefront } from "./storefront";

// The "All products" collection backs the shop page, so every product can be filtered.
export const ALL_PRODUCTS_HANDLE = "all";

export const PAGE_SIZE = 24;

const CATALOG_TAGS = ["products", "collections"];

export async function getCollections(): Promise<schemas.CollectionSummary[]> {
  const data = await storefront(
    documents.COLLECTIONS_QUERY,
    schemas.collectionsResponse,
    { first: 50 },
    { tags: CATALOG_TAGS },
  );
  return data.collections.nodes.filter((collection) => collection.handle !== ALL_PRODUCTS_HANDLE);
}

// The shop page: every product matching the filters, searched rather than read from a collection.
export async function getShopPage(params: ListingParams) {
  const { sortKey, reverse } = toCollectionSort(params.sort);
  const data = await storefront(
    documents.SHOP_QUERY,
    schemas.shopResponse,
    {
      query: toShopSearch(params) || null,
      first: PAGE_SIZE,
      after: params.after ?? null,
      sortKey: sortKey === "CREATED" ? "CREATED_AT" : sortKey,
      reverse,
    },
    { tags: CATALOG_TAGS },
  );
  return data.products;
}

export type ListingFacets = { types: string[]; sizes: string[] };

// The choices the shop's filters offer, taken from the catalog so nothing is listed by hand: every
// product type in use (in Shopify's order), and every value of the "Size" option, smallest first.
export async function getListingFacets(): Promise<ListingFacets> {
  const data = await storefront(documents.FACETS_QUERY, schemas.facetsResponse, {}, { tags: CATALOG_TAGS });
  const sizes = new Set<string>();
  for (const product of data.products.nodes) {
    for (const option of product.options) if (option.name === "Size") option.values.forEach((value) => sizes.add(value));
  }
  return {
    types: data.productTypes.nodes.filter((type) => type.trim() !== ""),
    sizes: [...sizes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
  };
}

// Shopify's automatic home page collection isn't one a shopper would browse by.
const HOME_PAGE_HANDLE = "frontpage";

// The collections the homepage shows: those with something in them, up to six.
export async function getHomeCollections(): Promise<schemas.CollectionSummary[]> {
  const collections = await getCollections();
  return collections.filter((collection) => collection.hasProducts && collection.handle !== HOME_PAGE_HANDLE).slice(0, 6);
}

export async function getCollectionPage(args: {
  handle: string;
  sort: SortKey;
  filters: ProductFilter[];
  after?: string;
}) {
  const { sortKey, reverse } = toCollectionSort(args.sort);
  const data = await storefront(
    documents.COLLECTION_QUERY,
    schemas.collectionResponse,
    {
      handle: args.handle,
      first: PAGE_SIZE,
      after: args.after ?? null,
      sortKey,
      reverse,
      filters: args.filters,
    },
    { tags: CATALOG_TAGS },
  );
  return data.collection;
}

export async function getProduct(handle: string) {
  const data = await storefront(
    documents.PRODUCT_QUERY,
    schemas.productResponse,
    { handle },
    { tags: CATALOG_TAGS },
  );
  return data.product;
}

// Shopper queries vary without limit, so they are never cached.
export async function searchProducts(query: string, after?: string) {
  const data = await storefront(
    documents.SEARCH_QUERY,
    schemas.searchResponse,
    { query, first: PAGE_SIZE, after: after ?? null },
    "no-store",
  );
  return data.search;
}
