// Response shapes for the documents in ./documents.ts. Every Storefront response is
// parsed through these before the UI sees it.
import { z } from "zod";

const money = z.object({ amount: z.string(), currencyCode: z.string() });

const image = z.object({
  url: z.string(),
  altText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});

const pageInfo = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

export const productSummary = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  productType: z.string(),
  tags: z.array(z.string()),
  availableForSale: z.boolean(),
  priceRange: z.object({ minVariantPrice: money }),
  compareAtPriceRange: z.object({ minVariantPrice: money }),
  featuredImage: image.nullable(),
});
export type ProductSummary = z.infer<typeof productSummary>;

const collectionSummary = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  image: image.nullable(),
});
export type CollectionSummary = z.infer<typeof collectionSummary>;

const variant = z.object({
  id: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  price: money,
  compareAtPrice: money.nullable(),
  selectedOptions: z.array(z.object({ name: z.string(), value: z.string() })),
});
export type ProductVariant = z.infer<typeof variant>;

export const productDetail = productSummary.extend({
  description: z.string(),
  images: z.object({ nodes: z.array(image) }),
  options: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
  variants: z.object({ nodes: z.array(variant) }),
  collections: z.object({ nodes: z.array(z.object({ handle: z.string(), title: z.string() })) }),
  careTips: z.object({ value: z.string().nullable() }).nullable(),
  completeTheLook: z
    .object({ references: z.object({ nodes: z.array(productSummary) }) })
    .nullable(),
});
export type ProductDetail = z.infer<typeof productDetail>;

export const collectionsResponse = z.object({
  collections: z.object({ nodes: z.array(collectionSummary) }),
});

export const collectionResponse = z.object({
  collection: z
    .object({
      id: z.string(),
      handle: z.string(),
      title: z.string(),
      description: z.string(),
      image: image.nullable(),
      products: z.object({ pageInfo, nodes: z.array(productSummary) }),
    })
    .nullable(),
});
export type CollectionPage = NonNullable<z.infer<typeof collectionResponse>["collection"]>;

export const productResponse = z.object({ product: productDetail.nullable() });

export const searchResponse = z.object({
  search: z.object({ pageInfo, nodes: z.array(productSummary) }),
});

const cartLine = z.object({
  id: z.string(),
  quantity: z.number(),
  cost: z.object({ totalAmount: money }),
  merchandise: z.object({
    id: z.string(),
    title: z.string(),
    availableForSale: z.boolean(),
    price: money,
    image: image.nullable(),
    product: z.object({ handle: z.string(), title: z.string() }),
  }),
});

export const cart = z.object({
  id: z.string(),
  checkoutUrl: z.string(),
  totalQuantity: z.number(),
  cost: z.object({ subtotalAmount: money, totalAmount: money }),
  discountCodes: z.array(z.object({ code: z.string(), applicable: z.boolean() })),
  lines: z.object({ nodes: z.array(cartLine) }),
});
export type Cart = z.infer<typeof cart>;
export type CartLine = z.infer<typeof cartLine>;

const userError = z.object({
  code: z.string().nullable(),
  field: z.array(z.string()).nullable(),
  message: z.string(),
});

const cartPayload = z.object({ cart: cart.nullable(), userErrors: z.array(userError) });

export const cartQueryResponse = z.object({ cart: cart.nullable() });
export const cartCreateResponse = z.object({ cartCreate: cartPayload });
export const cartLinesAddResponse = z.object({ cartLinesAdd: cartPayload });
export const cartLinesUpdateResponse = z.object({ cartLinesUpdate: cartPayload });
export const cartLinesRemoveResponse = z.object({ cartLinesRemove: cartPayload });
export const cartDiscountCodesResponse = z.object({ cartDiscountCodesUpdate: cartPayload });
