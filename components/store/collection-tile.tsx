import Link from "next/link";
import type { CollectionSummary } from "../../lib/shopify/schemas";
import { Icon } from "../ui/icon";
import { FittedPhoto } from "./fitted-photo";

// A collection on the homepage: its photo, then its name. The framed card follows the product cards.
// A collection with no photo at all shows the diamond, so the row keeps its shape.
export function CollectionTile({ collection }: { collection: CollectionSummary }) {
  const image = collection.image;

  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest shadow-hard-secondary transition-transform duration-300 ease-emphasized motion-safe:hover:-translate-y-1"
    >
      {image ? (
        <FittedPhoto
          photo={image}
          alt={image.altText ?? collection.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      ) : (
        <div className="flex aspect-[4/5] w-full flex-1 items-center justify-center bg-tertiary-fixed-dim/20 text-outline">
          <Icon name="diamond" className="text-[48px]" />
        </div>
      )}
      {/* On a phone the name has the whole width, since the card itself is the link. The footer is tall
          enough for two lines, so footers in a row stay level. */}
      <div className="flex min-h-[4.5rem] items-center justify-between gap-3 border-t-[1.5px] border-tertiary p-3 md:min-h-0 md:p-4">
        <h3 className="font-headline text-body-md font-bold text-on-surface transition-colors duration-200 group-hover:text-primary md:text-body-lg">
          {collection.title}
        </h3>
        <span className="hidden font-label text-label-md text-secondary md:inline">Shop</span>
      </div>
    </Link>
  );
}
