"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "../../lib/format";
import { suggestProducts } from "../../lib/search/actions";
import type { ProductSummary } from "../../lib/shopify/schemas";
import { Icon } from "../ui/icon";
import { iconButtonClass } from "../ui/icon-button";
import { SearchField } from "../ui/search-field";

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

// Predictive search in a top sheet. Each keystroke waits briefly, and stale responses are dropped.
export function SearchOverlay() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const latestRequest = useRef(0);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_LENGTH) {
      latestRequest.current += 1;
      setProducts([]);
      setStatus("idle");
      return;
    }

    const request = ++latestRequest.current;
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const result = await suggestProducts(term);
        if (request !== latestRequest.current) return;
        setProducts(result.products);
        setStatus("idle");
      } catch {
        if (request !== latestRequest.current) return;
        setProducts([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const close = () => dialogRef.current?.close();
  const term = query.trim();

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={iconButtonClass()}
      >
        <Icon name="search" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-x-0 top-0 m-0 max-h-[85vh] w-full max-w-none overflow-y-auto bg-surface p-0 shadow-ambient-primary"
      >
        <div className="mx-auto flex max-w-container-max flex-col gap-6 px-margin-mobile py-6 md:px-margin-tablet lg:px-margin-desktop">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchField
                label="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
              />
            </div>
            <button type="button" aria-label="Close search" onClick={close} className={iconButtonClass()}>
              <Icon name="close" />
            </button>
          </div>

          <p aria-live="polite" className="font-body text-body-md text-on-surface-variant">
            {status === "loading" && "Searching…"}
            {status === "error" && "Search is unavailable right now."}
            {status === "idle" && term.length >= MIN_LENGTH && products.length === 0 && "No matches yet."}
          </p>

          {products.length > 0 && (
            <ul className="grid gap-2 md:grid-cols-2">
              {products.map((product, index) => (
                <li
                  key={product.id}
                  className="motion-safe:animate-fade-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <Link
                    href={`/products/${product.handle}`}
                    onClick={close}
                    className="flex items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-surface-container-low"
                  >
                    <span className="font-headline text-body-lg text-on-surface">{product.title}</span>
                    <span className="font-body text-body-md text-on-surface-variant">
                      {formatPrice(product.priceRange.minVariantPrice)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {term.length >= MIN_LENGTH && (
            <Link
              href={`/search?q=${encodeURIComponent(term)}`}
              onClick={close}
              className="link-underline self-start font-label text-label-md text-secondary"
            >
              See all results
            </Link>
          )}
        </div>
      </dialog>
    </>
  );
}
