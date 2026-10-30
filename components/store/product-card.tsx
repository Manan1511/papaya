import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../../lib/format";
import type { ProductSummary } from "../../lib/shopify/schemas";
import { Chip } from "../ui/chip";
import { Icon } from "../ui/icon";

// Sold out wins over the tags, so a shopper never sees "New" on something they can't buy.
function badgeFor(product: ProductSummary): string | null {
  if (!product.availableForSale) return "Sold out";
  if (product.tags.includes("limited")) return "Limited";
  if (product.tags.includes("new")) return "New";
  return null;
}

// Products without a photo show a plain placeholder, so the grid keeps its shape.
// The framed card and the tinted photo well follow the landing page's product cards.
export function ProductCard({ product, href }: { product: ProductSummary; href?: string }) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const showCompare = Number(compareAt.amount) > Number(price.amount);
  const image = product.featuredImage;
  const badge = badgeFor(product);

  return (
    <Link
      href={href ?? `/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest transition-transform duration-300 ease-emphasized motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-tertiary-fixed-dim/20 md:aspect-auto md:h-64">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            width={image.width ?? 800}
            height={image.height ?? 1000}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 ease-emphasized motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-outline">
            <Icon name="diamond" className="text-[48px]" />
          </div>
        )}
        {badge && <Chip tone="primary" className="absolute right-3 top-3">{badge}</Chip>}
      </div>
      <div className="flex flex-col gap-2 border-t-[1.5px] border-tertiary p-4">
        <h3 className="font-headline text-body-lg font-bold text-on-surface transition-colors duration-200 group-hover:text-primary">
          {product.title}
        </h3>
        <p className="font-body text-body-md text-on-surface-variant">
          {formatPrice(price)}
          {showCompare && (
            <>
              <span className="sr-only"> Was </span>
              <s className="ml-2 text-outline">{formatPrice(compareAt)}</s>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
