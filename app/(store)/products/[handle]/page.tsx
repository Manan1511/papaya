import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBagForm } from "../../../../components/store/add-to-bag-form";
import { ProductCard } from "../../../../components/store/product-card";
import { ProductGallery } from "../../../../components/store/product-gallery";
import { ReviewDialog } from "../../../../components/store/review-dialog";
import { Container } from "../../../../components/ui/container";
import { Grid } from "../../../../components/ui/grid";
import { formatPrice } from "../../../../lib/format";
import { FREE_SHIPPING_THRESHOLD_INR } from "../../../../lib/content/site";
import { getProduct } from "../../../../lib/shopify/catalog";
import { galleryItems } from "../../../../lib/shopify/gallery";
import { readProductAttributes } from "../../../../lib/shopify/product-attributes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 160) || undefined,
    openGraph: product.featuredImage ? { images: [{ url: product.featuredImage.url }] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const collection = product.collections.nodes[0];
  const items = galleryItems(product.media.nodes, product.featuredImage);
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const showCompare = Number(compareAt.amount) > Number(price.amount);
  const attributes = readProductAttributes(product);
  const careTips = product.careTips?.value?.trim();
  const related = product.completeTheLook?.references.nodes ?? [];

  // JSON-LD for search engines. "<" is escaped so product text can't close the script tag.
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: items.flatMap((item) => (item.kind === "image" ? [item.url] : [])),
    offers: {
      "@type": "Offer",
      priceCurrency: price.currencyCode,
      price: price.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }).replace(/</g, "\\u003c");

  return (
    <Container className="space-y-xl py-lg">
      <nav aria-label="Breadcrumb" className="font-label text-label-sm uppercase tracking-[0.05em] text-on-surface-variant">
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        {collection && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/collections/${collection.handle}`} className="hover:text-primary">
              {collection.title}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery items={items} title={product.title} />

        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="font-headline text-headline-lg text-on-surface">{product.title}</h1>
            <p className="font-headline text-headline-md text-primary">
              {formatPrice(price)}
              {showCompare && (
                <>
                  <span className="sr-only"> Was </span>
                  <s className="ml-3 font-body text-body-md text-outline">{formatPrice(compareAt)}</s>
                </>
              )}
            </p>
          </div>

          {product.description && (
            <p className="whitespace-pre-line font-body text-body-lg text-on-surface-variant">{product.description}</p>
          )}

          <AddToBagForm
            variants={product.variants.nodes.map((variant) => ({
              id: variant.id,
              title: variant.title,
              availableForSale: variant.availableForSale,
            }))}
            optionName={product.options[0]?.name ?? null}
          />

          {FREE_SHIPPING_THRESHOLD_INR !== null && (
            <p className="font-body text-body-md text-on-surface-variant">
              Free shipping on orders over{" "}
              {formatPrice({ amount: String(FREE_SHIPPING_THRESHOLD_INR), currencyCode: "INR" })}.
            </p>
          )}

          <Link href="/pages/size-guide" className="link-underline w-fit font-label text-label-md text-secondary">
            Size guide
          </Link>

          {attributes.length > 0 && (
            <section aria-labelledby="product-details" className="space-y-2">
              <h2 id="product-details" className="font-headline text-headline-md text-on-surface">
                Details
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-body text-body-md">
                {attributes.map(({ label, values }) => (
                  <div key={label} className="contents">
                    <dt className="font-semibold text-on-surface">{label}</dt>
                    <dd className="text-on-surface-variant">{values.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {careTips && (
            <section aria-labelledby="care-tips" className="space-y-2">
              <h2 id="care-tips" className="font-headline text-headline-md text-on-surface">
                Keep it shining
              </h2>
              <p className="whitespace-pre-line font-body text-body-md text-on-surface-variant">{careTips}</p>
            </section>
          )}
        </div>
      </div>

      <section aria-labelledby="product-reviews" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="product-reviews" className="font-headline text-headline-lg text-on-surface">
            Reviews
          </h2>
          <ReviewDialog />
        </div>
        <p className="font-body text-body-lg text-on-surface-variant">
          No reviews yet. Approved reviews will appear here.
        </p>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="complete-the-look" className="space-y-md">
          <h2 id="complete-the-look" className="font-headline text-headline-lg text-on-surface">
            Complete the look
          </h2>
          <Grid>
            {related.map((item) => (
              <div key={item.id} className="col-span-2 md:col-span-4 lg:col-span-3">
                <ProductCard product={item} />
              </div>
            ))}
          </Grid>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
    </Container>
  );
}
