import "server-only";
import * as documents from "./documents";
import type { ProductFilter, SortKey } from "./listing";
import { toCollectionSort } from "./listing";
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
