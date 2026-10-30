"use client";

import Link from "next/link";
import { useRef } from "react";
import { cx } from "../../lib/cx";
import { Icon } from "../ui/icon";
import { iconButtonClass } from "../ui/icon-button";

type NavLink = { href: string; label: string };

// A native <dialog> handles focus trapping, Escape to close, and returning focus to the trigger.
export function MobileNav({ links }: { links: NavLink[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={cx(iconButtonClass(), "md:hidden")}
      >
        <Icon name="menu" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClick={(event) => {
          // Only the backdrop reports the dialog itself as the click target.
          if (event.target === event.currentTarget) close();
        }}
        className="fixed bottom-0 left-auto right-0 top-0 m-0 h-screen max-h-none w-[min(20rem,85vw)] max-w-none bg-surface p-0 shadow-ambient-primary"
      >
        <div className="flex h-full flex-col gap-1 p-margin-mobile">
          <div className="flex justify-end">
            <button type="button" aria-label="Close menu" onClick={close} className={iconButtonClass()}>
              <Icon name="close" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded py-3 font-label text-body-lg text-on-surface transition-colors hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  );
}
