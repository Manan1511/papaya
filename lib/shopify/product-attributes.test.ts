import { describe, expect, it } from "vitest";
import { attributeValuesQuery, toAttributeKeys, toProductAttributes } from "./product-attributes";

const option = (value: string) => ({ label: { value } });

describe("product attributes", () => {
  it("takes the facts and Shopify's names from the Admin response, skipping unsafe keys", () => {
    const keys = toAttributeKeys({
      product: {
        metafields: {
          nodes: [
            { key: "jewelry-material", definition: { name: "Jewelry material" } },
            { key: 'bad"key', definition: { name: "Bad" } },
            { key: "no-definition", definition: null },
          ],
        },
      },
    });
    expect(keys).toEqual([{ key: "jewelry-material", name: "Jewelry material" }]);
  });

  it("builds one aliased metafield per key", () => {
    const query = attributeValuesQuery([
      { key: "color-pattern", name: "Color" },
      { key: "earring-design", name: "Earring design" },
    ]);
    expect(query).toContain('a0: metafield(namespace: "shopify", key: "color-pattern")');
    expect(query).toContain('a1: metafield(namespace: "shopify", key: "earring-design")');
  });

  it("returns the facts that have values, in order, and drops empty ones", () => {
    const keys = [
      { key: "color-pattern", name: "Color" },
      { key: "age-group", name: "Age group" },
      { key: "target-gender", name: "Target gender" },
    ];
    const result = toProductAttributes(keys, {
      node: {
        a0: { references: { nodes: [option("Bronze"), option("Gold"), option("Gold")] } },
        a1: { references: { nodes: [] } },
        a2: { reference: option("Unisex") },
      },
    });
    expect(result).toEqual([
      { label: "Color", values: ["Bronze", "Gold"] },
      { label: "Target gender", values: ["Unisex"] },
    ]);
  });
});
