import { z } from "zod";

// The product facts set under a product's category in Shopify (Color, Jewelry material, Earring design,
// and whatever a new category brings). They live in the "shopify" metafield namespace, one list of values
// per fact. Nothing here names a fact: the Admin API says which ones a product has and what Shopify
// calls them, and the Storefront API then returns the values.

// Admin API: the facts this product has, with Shopify's name for each.
export const ATTRIBUTE_KEYS_QUERY = `query ProductAttributeKeys($id: ID!) {
  product(id: $id) {
    metafields(first: 50, namespace: "shopify") {
      nodes {
        key
        definition {
          name
        }
      }
    }
  }
}`;

export const attributeKeysResponse = z.object({
  product: z
    .object({
      metafields: z.object({
        nodes: z.array(z.object({ key: z.string(), definition: z.object({ name: z.string() }).nullable() })),
      }),
    })
    .nullable(),
});

export type AttributeKey = { key: string; name: string };

export function toAttributeKeys(response: z.infer<typeof attributeKeysResponse>): AttributeKey[] {
  return (response.product?.metafields.nodes ?? []).flatMap(({ key, definition }) =>
    // Keys go into a query, so only plain keys are used.
    definition && /^[a-z0-9_-]+$/i.test(key) ? [{ key, name: definition.name }] : [],
  );
}

const label = `... on Metaobject {
            label: field(key: "label") {
              value
            }
          }`;

// Storefront API: the values for those keys, each as the label of the option chosen in Shopify.
export function attributeValuesQuery(keys: AttributeKey[]): string {
  const fields = keys
    .map(
      ({ key }, index) => `a${index}: metafield(namespace: "shopify", key: "${key}") {
        reference {
          ${label}
        }
        references(first: 20) {
          nodes {
            ${label}
          }
        }
      }`,
    )
    .join("\n      ");
  return `query ProductAttributes($id: ID!) {
  node(id: $id) {
    ... on Product {
      ${fields}
    }
  }
}`;
}

const option = z.object({ label: z.object({ value: z.string() }).nullable().optional() });
const attribute = z
  .object({ reference: option.nullable().optional(), references: z.object({ nodes: z.array(option) }).nullable().optional() })
  .nullable();

export const attributeValuesResponse = z.object({ node: z.record(z.string(), attribute).nullable() });

// The facts that have values, in the order Shopify lists them. Empty ones are left out, and facts that
// share a name (a bracelet has both "Bracelet design" and "Necklace design") stay separate.
export function toProductAttributes(
  keys: AttributeKey[],
  response: z.infer<typeof attributeValuesResponse>,
): { label: string; values: string[] }[] {
  return keys.flatMap(({ name }, index) => {
    const found = response.node?.[`a${index}`];
    const options = [...(found?.reference ? [found.reference] : []), ...(found?.references?.nodes ?? [])];
    const values = options.map((entry) => entry.label?.value?.trim()).filter((value): value is string => Boolean(value));
    return values.length > 0 ? [{ label: name, values: [...new Set(values)] }] : [];
  });
}
