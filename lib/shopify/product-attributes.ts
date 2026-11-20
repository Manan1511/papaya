import { z } from "zod";

// The product facts set under a product's category in Shopify (Color, Jewelry material, and so on).
// Each is a list of values stored in the "shopify" metafield namespace. Add a row to show another.
const ATTRIBUTES = [
  { key: "color-pattern", label: "Colour" },
  { key: "jewelry-material", label: "Material" },
  { key: "necklace-design", label: "Design" },
  { key: "necklace-length-type", label: "Length" },
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
  return ATTRIBUTES.flatMap(({ label }, index) => {
    const parsed = attribute.safeParse(product[alias(index)] ?? null);
    const values = (parsed.success ? parsed.data?.references?.nodes : undefined)
      ?.map((node) => node.label?.value?.trim())
      .filter((value): value is string => Boolean(value));
    return values && values.length > 0 ? [{ label, values }] : [];
  });
}
