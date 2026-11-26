import Image from "next/image";
import Link from "next/link";
import type { Stack } from "../../lib/cms/model";
import { formatPrice } from "../../lib/format";
import type { StackProduct } from "../../lib/shopify/schemas";
import { defaultVariant, sumPrices } from "../../lib/shopify/stack";
import { buttonClass } from "../ui/button";

// A styled picture on the homepage. The whole card opens the stack, where it can be bought together.
export function StackCard({ stack, pieces }: { stack: Stack; pieces: StackProduct[] }) {
  const total = sumPrices(pieces.flatMap((piece) => defaultVariant(piece)?.price ?? []));

  return (
    <Link
      href={`/stacks/${stack.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest shadow-hard-secondary transition-transform duration-300 ease-emphasized motion-safe:hover:-translate-y-1"
    >
      <Image
        src={stack.image.url}
        alt={stack.title}
        width={stack.image.width}
        height={stack.image.height}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 80vw"
        className="h-auto w-full"
      />
      <div className="flex flex-col gap-3 border-t-[1.5px] border-tertiary p-4">
        <h3 className="font-headline text-body-lg font-bold text-on-surface transition-colors duration-200 group-hover:text-primary">
          {stack.title}
        </h3>
        <p className="font-body text-body-md text-on-surface-variant">
          {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
          {total ? ` · ${formatPrice(total)}` : " · Sold out"}
        </p>
        {/* Drawn as a button, but part of the card's one link. */}
        <span className={buttonClass({ className: "w-full" })}>Shop the Stack</span>
      </div>
    </Link>
  );
}
