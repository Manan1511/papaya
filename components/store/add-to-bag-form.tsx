"use client";

import { useActionState } from "react";
import { addToCart, type CartState } from "../../lib/cart/actions";
import { Button } from "../ui/button";

type VariantOption = { id: string; title: string; availableForSale: boolean };

export function AddToBagForm({ variants, optionName }: { variants: VariantOption[]; optionName: string | null }) {
  const [state, formAction, pending] = useActionState(addToCart, {} as CartState);
  const firstAvailable = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const soldOut = !variants.some((variant) => variant.availableForSale);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {variants.length > 1 ? (
        <fieldset className="space-y-3">
          <legend className="font-label text-label-md text-on-surface">{optionName ?? "Option"}</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <label key={variant.id} className="relative">
                <input
                  type="radio"
                  name="variantId"
                  value={variant.id}
                  defaultChecked={variant.id === firstAvailable?.id}
                  disabled={!variant.availableForSale}
                  className="peer sr-only"
                />
                <span className="flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-outline px-4 font-label text-label-md text-on-surface transition-colors peer-checked:border-2 peer-checked:border-primary peer-checked:bg-primary-fixed peer-focus-visible:outline-2 peer-focus-visible:outline-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-40 peer-disabled:line-through">
                  {variant.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        firstAvailable && <input type="hidden" name="variantId" value={firstAvailable.id} />
      )}

      <div className="flex items-end gap-4">
        <label className="flex flex-col gap-2 font-label text-label-md text-on-surface">
          Quantity
          <input
            type="number"
            name="quantity"
            min={1}
            max={10}
            defaultValue={1}
            className="h-11 w-24 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body text-body-md transition-[border-color,box-shadow] duration-200 ease-emphasized focus:border-2 focus:border-primary focus:outline-none focus:ring-4 focus:ring-tertiary-fixed/50"
          />
        </label>
        <Button type="submit" size="lg" disabled={soldOut || pending} className="flex-1">
          {soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"}
        </Button>
      </div>

      {state.error && (
        <p role="alert" className="font-body text-body-md text-error motion-safe:animate-fade-in">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="font-body text-body-md text-on-surface-variant motion-safe:animate-fade-in">
          Added to your bag.
        </p>
      )}
    </form>
  );
}
