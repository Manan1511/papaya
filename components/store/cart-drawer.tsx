"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Cart } from "../../lib/shopify/schemas";
import { Icon } from "../ui/icon";
import { iconButtonClass } from "../ui/icon-button";
import { CartContents, CartSummary } from "./cart-contents";

// The bag trigger and a side drawer with the full bag. A native <dialog> handles focus and Escape.
export function CartDrawer({ cart }: { cart: Cart | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const count = cart?.totalQuantity ?? 0;
  const close = () => dialogRef.current?.close();

  // Following a link in the drawer changes the page underneath, so the drawer closes with it.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={count > 0 ? `Bag, ${count} items` : "Bag"}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={iconButtonClass()}
      >
        <Icon name="shopping_bag" />
      </button>
      {/* The key restarts the pop animation each time the count changes. */}
      {count > 0 && (
        <span
          key={count}
          aria-hidden="true"
          className="pointer-events-none absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary motion-safe:animate-pop"
        >
          {count}
        </span>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Your bag"
        onClick={(event) => {
          // Only the backdrop reports the dialog itself as the click target.
          if (event.target === event.currentTarget) close();
        }}
        className="drawer fixed bottom-0 left-auto right-0 top-0 m-0 h-dvh max-h-none w-[min(26rem,100vw)] max-w-none bg-surface p-0 shadow-ambient-primary"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-start justify-between gap-4 p-margin-mobile">
            <div className="space-y-1">
              <h2 className="font-headline text-headline-md text-on-surface">Your bag</h2>
              {count > 0 && (
                <p className="font-label text-label-md text-on-surface-variant">
                  {count} {count === 1 ? "item" : "items"}
                </p>
              )}
            </div>
            <button type="button" aria-label="Close bag" onClick={close} className={iconButtonClass()}>
              <Icon name="close" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-margin-mobile pb-margin-mobile">
            <CartContents cart={cart} />
          </div>

          {cart && count > 0 && (
            <div className="flex shrink-0 flex-col gap-4 border-t border-outline-variant/40 bg-surface-container-low p-margin-mobile">
              <CartSummary cart={cart} />
              <Link href="/cart" onClick={close} className="link-underline self-center font-label text-label-md text-secondary">
                View full bag
              </Link>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
