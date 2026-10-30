"use client";

import Image from "next/image";
import { useActionState } from "react";
import { applyDiscount, type CartState, updateCartLine } from "../../lib/cart/actions";
import { formatPrice } from "../../lib/format";
import type { Cart } from "../../lib/shopify/schemas";
import { FREE_SHIPPING_THRESHOLD_INR } from "../../lib/content/site";
import { Button, buttonClass } from "../ui/button";
import { FreeShippingBar } from "./free-shipping-bar";

const stepperButton =
  "flex size-9 items-center justify-center rounded-full border border-outline font-label text-label-md text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40";

// The bag. Quantity buttons and Remove all submit to updateCartLine; a quantity of zero removes the line.
export function CartContents({ cart }: { cart: Cart | null }) {
  const [lineState, lineAction] = useActionState(updateCartLine, {} as CartState);
  const [discountState, discountAction] = useActionState(applyDiscount, {} as CartState);

  if (!cart || cart.lines.nodes.length === 0) {
    return <p className="font-body text-body-md text-on-surface-variant">Your bag is empty.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y divide-outline-variant/40">
        {cart.lines.nodes.map((line) => {
          const variant = line.merchandise;
          return (
            <li key={line.id} className="flex gap-4 py-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                {variant.image && (
                  <Image
                    src={variant.image.url}
                    alt={variant.image.altText ?? variant.product.title}
                    width={variant.image.width ?? 200}
                    height={variant.image.height ?? 200}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <p className="font-headline text-body-lg text-on-surface">{variant.product.title}</p>
                  <p className="font-body text-body-md text-on-surface">{formatPrice(line.cost.totalAmount)}</p>
                </div>
                {variant.title !== "Default Title" && (
                  <p className="font-body text-body-md text-on-surface-variant">{variant.title}</p>
                )}

                <form action={lineAction} className="flex items-center gap-2">
                  <input type="hidden" name="lineId" value={line.id} />
                  <button
                    type="submit"
                    name="quantity"
                    value={line.quantity - 1}
                    aria-label={`Decrease quantity of ${variant.product.title}`}
                    className={stepperButton}
                  >
                    −
                  </button>
                  <span aria-live="polite" className="w-8 text-center font-label text-label-md text-on-surface">
                    {line.quantity}
                  </span>
                  <button
                    type="submit"
                    name="quantity"
                    value={line.quantity + 1}
                    aria-label={`Increase quantity of ${variant.product.title}`}
                    disabled={line.quantity >= 10}
                    className={stepperButton}
                  >
                    +
                  </button>
                  <button
                    type="submit"
                    name="quantity"
                    value={0}
                    className="ml-auto font-label text-label-md text-error underline-offset-4 hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>

      {lineState.error && (
        <p role="alert" className="font-body text-body-md text-error">
          {lineState.error}
        </p>
      )}

      <form action={discountAction} className="flex gap-2">
        <input
          name="code"
          required
          maxLength={40}
          placeholder="Discount code"
          aria-label="Discount code"
          className="h-11 flex-1 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body text-body-md text-on-surface"
        />
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>
      {discountState.error && (
        <p role="alert" className="font-body text-body-md text-error">
          {discountState.error}
        </p>
      )}
      {discountState.ok && (
        <p role="status" className="font-body text-body-md text-on-surface-variant">
          Code applied.
        </p>
      )}

      <FreeShippingBar subtotal={cart.cost.subtotalAmount} threshold={FREE_SHIPPING_THRESHOLD_INR} />
      <dl className="flex flex-col gap-2 font-body text-body-md text-on-surface">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.cost.subtotalAmount)}</dd>
        </div>
        <div className="flex justify-between font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(cart.cost.totalAmount)}</dd>
        </div>
      </dl>
      <p className="font-body text-label-md text-on-surface-variant">Shipping and taxes are calculated at checkout.</p>

      {/* Checkout runs on Shopify's domain, so this is a plain link rather than a Next.js Link. */}
      <a href={cart.checkoutUrl} className={buttonClass({ size: "lg" })}>
        Checkout
      </a>
    </div>
  );
}
