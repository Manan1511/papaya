import { describe, expect, it } from "vitest";
import { parseListing, toCollectionSort, toProductFilters } from "./listing";

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

  it("ignores product types and sizes outside the whitelist", () => {
    const params = parseListing({ type: "Hats", size: "12" });
    expect(params.type).toBeUndefined();
    expect(params.size).toBeUndefined();
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
