"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { addStackToCart, type CartState } from "../../lib/cart/actions";
import { formatPrice } from "../../lib/format";
import type { StackProduct } from "../../lib/shopify/schemas";
import { defaultVariant, sumPrices } from "../../lib/shopify/stack";
import { Button } from "../ui/button";

// The pieces of a stack and the one button that bags them all. A piece with sizes lets the shopper pick
// one. A sold-out piece is listed but left out of the bag.
export function ShopStackForm({ pieces }: { pieces: StackProduct[] }) {
  const [state, formAction, pending] = useActionState(addStackToCart, {} as CartState);
  const [picked, setPicked] = useState<Record<string, string>>({});

  const chosen = pieces.flatMap((piece) => {
    const variant = piece.variants.nodes.find((one) => one.id === picked[piece.id]) ?? defaultVariant(piece);
    return variant ? [{ piece, variant }] : [];
  });
  const total = sumPrices(chosen.map(({ variant }) => variant.price));
  const label =
    chosen.length === 0
      ? "Sold out"
      : chosen.length < pieces.length
        ? `Shop the ${chosen.length} available`
        : "Shop the Stack";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Sent from here, not from the size menus, so a form reset can't change what goes in the bag. */}
      {chosen.map(({ piece, variant }) => (
        <input key={piece.id} type="hidden" name="variantId" value={variant.id} />
      ))}

      <ul className="divide-y divide-outline-variant border-y border-outline-variant">
        {pieces.map((piece) => {
          const variant = chosen.find((one) => one.piece.id === piece.id)?.variant;
          return (
            <li key={piece.id} className="flex items-start gap-4 py-4">
              <Link href={`/products/${piece.handle}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                {piece.featuredImage && (
                  <Image src={piece.featuredImage.url} alt="" fill sizes="80px" className="object-contain" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Link href={`/products/${piece.handle}`} className="font-headline text-body-lg font-bold text-on-surface hover:text-primary">
                  {piece.title}
                </Link>
                <p className="font-body text-body-md text-on-surface-variant">
                  {variant ? formatPrice(variant.price) : "Sold out, not included"}
                </p>
                {variant && piece.variants.nodes.length > 1 && (
                  <label className="flex items-center gap-2 font-label text-label-md text-on-surface">
                    {piece.options[0]?.name ?? "Option"}
                    <select
                      value={variant.id}
                      onChange={(event) => setPicked((current) => ({ ...current, [piece.id]: event.target.value }))}
                      className="h-11 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body text-body-md"
                    >
                      {piece.variants.nodes.map((one) => (
                        <option key={one.id} value={one.id} disabled={!one.availableForSale}>
                          {one.title}
                          {!one.availableForSale && " (sold out)"}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {total && (
        <p className="flex justify-between font-headline text-headline-md text-on-surface">
          <span>Stack total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </p>
      )}

      <Button type="submit" size="lg" disabled={chosen.length === 0 || pending}>
        {pending ? "Adding…" : label}
      </Button>

      {state.error && (
        <p role="alert" className="font-body text-body-md text-error motion-safe:animate-fade-in">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="font-body text-body-md text-on-surface-variant motion-safe:animate-fade-in">
          Added to your bag.{" "}
          <Link href="/cart" className="link-underline text-secondary">
            View bag
          </Link>
        </p>
      )}
    </form>
  );
}
