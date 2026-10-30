"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Cart } from "../../lib/shopify/schemas";
import { Icon } from "../ui/icon";
import { iconButtonClass } from "../ui/icon-button";
import { CartContents } from "./cart-contents";

// The bag trigger and a side drawer with the full bag. A native <dialog> handles focus and Escape.
export function CartDrawer({ cart }: { cart: Cart | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = cart?.totalQuantity ?? 0;

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
      {count > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary"
        >
          {count}
        </span>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Your bag"
        onClick={(event) => {
          // Only the backdrop reports the dialog itself as the click target.
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="fixed bottom-0 left-auto right-0 top-0 m-0 h-screen max-h-none w-[min(26rem,100vw)] max-w-none bg-surface p-0 shadow-ambient-primary"
      >
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-margin-mobile">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-headline-md text-on-surface">Your bag</h2>
            <button
              type="button"
              aria-label="Close bag"
              onClick={() => dialogRef.current?.close()}
              className={iconButtonClass()}
            >
              <Icon name="close" />
            </button>
          </div>
          <CartContents cart={cart} />
          <Link
            href="/cart"
            onClick={() => dialogRef.current?.close()}
            className="font-label text-label-md text-secondary underline-offset-4 hover:underline"
          >
            Open full bag
          </Link>
        </div>
      </dialog>
    </>
  );
}
