import Image from "next/image";
import Link from "next/link";
import type { CollectionSummary } from "../../lib/shopify/schemas";
import { CategoryIcon, drawingFor } from "./category-icon";

// The row of shortcuts at the top of the homepage: "Shop All", then every collection with something in
// it, so a new one in Shopify appears by itself. A collection whose name matches none of the drawings
// shows its photo. The row scrolls sideways when it doesn't fit.
export function CategoryBar({ collections }: { collections: CollectionSummary[] }) {
  const items = [
    { href: "/shop", title: "Shop All", drawing: "papaya" as const, image: null },
    ...collections.map((collection) => ({
      href: `/collections/${encodeURIComponent(collection.handle)}`,
      title: collection.title,
      drawing: drawingFor(collection.title),
      image: collection.image,
    })),
  ];

  return (
    <nav aria-label="Shop by category" className="border-b-[1.5px] border-tertiary bg-surface">
      <ul className="flex snap-x scroll-px-3 gap-1 overflow-x-auto overscroll-x-contain px-3 py-4 [justify-content:safe_center] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.href} className="w-[5.25rem] shrink-0 snap-start md:w-28">
            <Link href={item.href} className="group flex flex-col items-center gap-2 text-center">
              <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary-fixed/60 transition-transform duration-200 ease-emphasized motion-safe:group-hover:-translate-y-1 md:size-20">
                {item.drawing ? (
                  <CategoryIcon drawing={item.drawing} />
                ) : item.image ? (
                  <Image src={item.image.url} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <CategoryIcon drawing="papaya" />
                )}
              </span>
              <span className="text-balance font-label text-label-sm tracking-normal text-on-surface transition-colors duration-200 group-hover:text-primary md:text-label-md">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
