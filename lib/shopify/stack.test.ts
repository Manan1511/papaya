import { describe, expect, it } from "vitest";
import type { StackProduct } from "./schemas";
import { defaultVariant, stackPieces, sumPrices } from "./stack";

const variant = (id: string, availableForSale: boolean) => ({
  id,
  title: id,
  availableForSale,
  price: { amount: "100.0", currencyCode: "INR" },
});
const product = (id: string, variants = [variant(`${id}-v`, true)]) =>
  ({ id, variants: { nodes: variants } }) as StackProduct;

describe("stackPieces", () => {
  it("keeps the chosen order and leaves out products that are gone", () => {
    const pieces = stackPieces(["b", "gone", "a"], [product("a"), product("b")]);
    expect(pieces.map((piece) => piece.id)).toEqual(["b", "a"]);
  });
});

describe("defaultVariant", () => {
  it("takes the first variant in stock, or none when sold out", () => {
    expect(defaultVariant(product("a", [variant("1", false), variant("2", true)]))?.id).toBe("2");
    expect(defaultVariant(product("a", [variant("1", false)]))).toBeUndefined();
  });
});

describe("sumPrices", () => {
  it("adds in paise", () => {
    const prices = ["0.1", "0.2"].map((amount) => ({ amount, currencyCode: "INR" }));
    expect(sumPrices(prices)).toEqual({ amount: "0.3", currencyCode: "INR" });
    expect(sumPrices([])).toBeNull();
  });
});
