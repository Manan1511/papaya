import Image from "next/image";
import Link from "next/link";
import type { CollectionSummary } from "../../lib/shopify/schemas";
import { Icon } from "../ui/icon";

// A collection on the homepage: its photo, then its name. The framed card follows the product cards.
// A collection with no photo at all shows the diamond, so the row keeps its shape.
export function CollectionTile({ collection }: { collection: CollectionSummary }) {
  const image = collection.image;

  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest shadow-hard-secondary transition-transform duration-300 ease-emphasized motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-[4/5]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? collection.title}
            width={image.width ?? 800}
            height={image.height ?? 1000}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="absolute -inset-[5%] h-[110%] w-[110%] max-w-none object-cover mix-blend-multiply"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-tertiary-fixed-dim/20 text-outline">
            <Icon name="diamond" className="text-[48px]" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t-[1.5px] border-tertiary p-4">
        <h3 className="font-headline text-body-lg font-bold text-on-surface transition-colors duration-200 group-hover:text-primary">
          {collection.title}
        </h3>
        <span className="font-label text-label-md text-secondary">Shop</span>
      </div>
    </Link>
  );
}
