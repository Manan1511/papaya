import Image from "next/image";
import Link from "next/link";
import type { CollectionSummary } from "../../lib/shopify/schemas";
import { CategoryIcon, drawingFor } from "./category-icon";

// One wave of the bar's lower edge, 56 wide: the band above it, then the navy line along it.
const WAVE_FILL = "M0 0H56V6C42 6 42 15 28 15S14 6 0 6Z";
const WAVE_LINE = "M0 6C14 6 14 15 28 15S42 6 56 6";

// Hangs over the top of whatever follows the bar, which shows through below the curve. It starts a
// pixel inside the band, so no seam shows between them.
function WavyEdge() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] h-[17px] w-full">
      <defs>
        <pattern id="category-wave" width="56" height="17" patternUnits="userSpaceOnUse">
          <path d={WAVE_FILL} className="fill-blush" />
          <path d={WAVE_LINE} className="fill-none stroke-tertiary" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#category-wave)" />
    </svg>
  );
}

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
    <nav aria-label="Shop by category" className="relative z-10 bg-surface">
      <ul className="flex snap-x bg-blush scroll-px-3 gap-1 overflow-x-auto overscroll-x-contain px-3 py-4 [justify-content:safe_center] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.href} className="w-[5.25rem] shrink-0 snap-start md:w-28">
            <Link href={item.href} className="group flex flex-col items-center gap-2 text-center">
              <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-surface transition-transform duration-200 ease-emphasized motion-safe:group-hover:-translate-y-1 md:size-20">
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
      <WavyEdge />
    </nav>
  );
}
