import type { ProductSummary } from "../shopify/schemas";

// Placeholder products from the seed CSV (docs/seed/placeholder-products.csv). They stand in for
// real products until the catalog is connected. Prices are placeholders, not conversions.
function placeholder(
  handle: string,
  title: string,
  productType: string,
  amount: string,
  tags: string[] = [],
): ProductSummary {
  return {
    id: `placeholder:${handle}`,
    handle,
    title,
    productType,
    tags,
    availableForSale: true,
    priceRange: { minVariantPrice: { amount, currencyCode: "INR" } },
    compareAtPriceRange: { minVariantPrice: { amount: "0.0", currencyCode: "INR" } },
    featuredImage: null,
  };
}

const placeholders: ProductSummary[] = [
  placeholder("riviera-chain", "Riviera Chain", "Necklaces", "2499.0", ["new"]),
  placeholder("capri-hoops", "Capri Hoops", "Earrings", "1199.0"),
  placeholder("citrine-solitaire", "Citrine Solitaire", "Rings", "2199.0", ["limited"]),
  placeholder("positano-bracelet", "Positano Bracelet", "Bracelets", "1499.0"),
  placeholder("sorrento-sun-ring", "Sorrento Sun Ring", "Rings", "1999.0", ["best-seller"]),
];

export function getPlaceholder(handle: string): ProductSummary {
  const product = placeholders.find((item) => item.handle === handle);
  if (!product) throw new Error(`No placeholder product with handle ${handle}`);
  return product;
}
