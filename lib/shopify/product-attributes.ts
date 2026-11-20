import { z } from "zod";

// The product facts set under a product's category in Shopify (Color, Jewelry material, and so on).
// Each is a list of values stored in the "shopify" metafield namespace, named after the field (Earring design
// is "earring-design"). A product only has the fields of its own category, and rows with the same label
// are shown together. Add a row to show another.
const ATTRIBUTES = [
  { key: "color-pattern", label: "Colour" },
  { key: "jewelry-material", label: "Material" },
  { key: "clothing-accessory-material", label: "Material" },
  { key: "necklace-design", label: "Design" },
  { key: "earring-design", label: "Design" },
  { key: "ring-design", label: "Design" },
  { key: "bracelet-design", label: "Design" },
  { key: "body-jewelry-type", label: "Style" },
  { key: "necklace-length-type", label: "Length" },
  { key: "chain-link-type", label: "Chain link" },
  { key: "earring-closure-type", label: "Closure" },
  { key: "belt-buckle-type", label: "Buckle" },
  { key: "stone-shape", label: "Stone shape" },
  { key: "gemstone-type", label: "Gemstone" },
  { key: "gemstone-cut-style", label: "Gemstone cut" },
  { key: "metal-purity", label: "Metal purity" },
  { key: "clothing-features", label: "Features" },
  { key: "accessory-size", label: "Size" },
  { key: "target-gender", label: "For" },
  { key: "age-group", label: "Age group" },
] as const;

const alias = (index: number) => `attribute${index}`;

// GraphQL fields for the product query: one aliased metafield per attribute, with each value's label.
export const PRODUCT_ATTRIBUTE_FIELDS = ATTRIBUTES.map(
  ({ key }, index) => `${alias(index)}: metafield(namespace: "shopify", key: "${key}") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              label: field(key: "label") {
                value
              }
            }
          }
        }
      }`,
).join("\n      ");

const attribute = z
  .object({ references: z.object({ nodes: z.array(z.object({ label: z.object({ value: z.string() }).nullable().optional() })) }).nullable() })
  .nullable();

export const productAttributeShape = Object.fromEntries(ATTRIBUTES.map((_, index) => [alias(index), attribute.optional()]));

// The attributes this product has values for, in display order. Empty ones are left out.
export function readProductAttributes(product: Record<string, unknown>): { label: string; values: string[] }[] {
  const byLabel = new Map<string, string[]>();
  ATTRIBUTES.forEach(({ label }, index) => {
    const parsed = attribute.safeParse(product[alias(index)] ?? null);
    const values = (parsed.success ? parsed.data?.references?.nodes : undefined)
      ?.map((node) => node.label?.value?.trim())
      .filter((value): value is string => Boolean(value));
    if (values && values.length > 0) byLabel.set(label, [...(byLabel.get(label) ?? []), ...values]);
  });
  return [...byLabel].map(([label, values]) => ({ label, values: [...new Set(values)] }));
}
