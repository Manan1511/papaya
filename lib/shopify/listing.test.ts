import { describe, expect, it } from "vitest";
import { listingHref, parseListing, toCollectionSort, toProductFilters, toShopSearch } from "./listing";

describe("parseListing", () => {
  it("defaults to best selling with no filters", () => {
    const params = parseListing({});
    expect(params.sort).toBe("best");
    expect(toProductFilters(params)).toEqual([]);
  });

  it("falls back to the default sort for an unknown value", () => {
    expect(parseListing({ sort: "random" }).sort).toBe("best");
  });

  it("uses the first value when a parameter repeats", () => {
    expect(parseListing({ sort: ["newest", "best"] }).sort).toBe("newest");
  });

  it("drops empty or oversized product types and sizes", () => {
    const params = parseListing({ type: "  ", size: "x".repeat(41) });
    expect(params.type).toBeUndefined();
    expect(params.size).toBeUndefined();
    expect(parseListing({ type: "Anklets", size: "7" })).toMatchObject({ type: "Anklets", size: "7" });
  });

  it("drops an inverted price range", () => {
    const params = parseListing({ min: "5000", max: "1000" });
    expect(params.min).toBeUndefined();
    expect(params.max).toBeUndefined();
  });
});

describe("toProductFilters", () => {
  it("builds one filter per active parameter", () => {
    const params = parseListing({ available: "1", type: "Rings", size: "7", min: "1000", max: "3000" });
    expect(toProductFilters(params)).toEqual([
      { available: true },
      { productType: "Rings" },
      { price: { min: 1000, max: 3000 } },
      { variantOption: { name: "Size", value: "7" } },
    ]);
  });
});

describe("toCollectionSort", () => {
  it("maps newest to created date, newest first", () => {
    expect(toCollectionSort("newest")).toEqual({ sortKey: "CREATED", reverse: true });
  });

  it("maps price sorts to the price key in both directions", () => {
    expect(toCollectionSort("price-asc")).toEqual({ sortKey: "PRICE", reverse: false });
    expect(toCollectionSort("price-desc")).toEqual({ sortKey: "PRICE", reverse: true });
  });
});

describe("listingHref", () => {
  const current = parseListing({ sort: "newest", type: "Rings", size: "7", min: "500", max: "2000", available: "1", after: "abc" });

  it("keeps every filter and drops the page cursor", () => {
    const href = listingHref("/shop", current);
    const query = new URLSearchParams(href.split("?")[1]);
    expect(href.startsWith("/shop?")).toBe(true);
    expect(Object.fromEntries(query)).toEqual({ sort: "newest", type: "Rings", size: "7", min: "500", max: "2000", available: "1" });
  });

  it("swaps one filter and leaves the rest", () => {
    const query = new URLSearchParams(listingHref("/shop", current, { type: "Earrings" }).split("?")[1]);
    expect(query.get("type")).toBe("Earrings");
    expect(query.get("size")).toBe("7");
  });

  it("removes a filter that is set to undefined", () => {
    const query = new URLSearchParams(listingHref("/shop", current, { type: undefined, available: undefined }).split("?")[1]);
    expect(query.has("type")).toBe(false);
    expect(query.has("available")).toBe(false);
    expect(query.get("max")).toBe("2000");
  });

  it("works under a collection's address", () => {
    expect(listingHref("/collections/necklaces", parseListing({}))).toBe("/collections/necklaces?sort=best");
  });
});

describe("toShopSearch", () => {
  it("is empty with no filters", () => {
    expect(toShopSearch(parseListing({}))).toBe("");
  });

  it("joins every active filter into one search", () => {
    const params = parseListing({ available: "1", type: "Rings", size: "7", min: "1000", max: "3000" });
    expect(toShopSearch(params)).toBe(
      'available_for_sale:true product_type:"Rings" variants.title:"7" variants.price:>=1000 variants.price:<=3000',
    );
  });

  it("strips quote marks so text can't break out of its quotes", () => {
    const params = parseListing({ type: 'Rings" OR vendor:"x' });
    expect(toShopSearch(params)).toBe('product_type:"Rings OR vendor:x"');
  });
});
