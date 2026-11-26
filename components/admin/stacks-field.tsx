"use client";

import Image from "next/image";
import { useState } from "react";
import { MAX_STACK_PIECES, MAX_STACKS, type Stack } from "../../lib/cms/model";
import { cx } from "../../lib/cx";
import type { ProductChoice } from "../../lib/shopify/schemas";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ImageUploader } from "./image-uploader";

// The pieces of one stack: those chosen, then a searchable list of the shop's products. Buttons rather
// than checkboxes, because React clears checkboxes it controls when a form is submitted.
function PiecePicker({
  chosen,
  products,
  onChange,
}: {
  chosen: string[];
  products: ProductChoice[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const byId = new Map(products.map((product) => [product.id, product]));
  const wanted = search.trim().toLowerCase();
  const shown = products.filter((product) => product.title.toLowerCase().includes(wanted));
  const full = chosen.length >= MAX_STACK_PIECES;
  const toggle = (id: string) => onChange(chosen.includes(id) ? chosen.filter((other) => other !== id) : [...chosen, id]);

  return (
    <div className="space-y-2">
      <p className="font-label text-label-md text-on-surface">
        Pieces in this stack ({chosen.length} of {MAX_STACK_PIECES})
      </p>
      {chosen.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {chosen.map((id) => {
            const title = byId.get(id)?.title ?? "Product no longer in the shop";
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-label={`Remove ${title}`}
                  onClick={() => toggle(id)}
                  className="rounded-full border-2 border-primary bg-primary-fixed px-3 py-1 font-label text-label-md text-on-surface"
                >
                  {title} <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        // Enter here is a search, not a save.
        onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
        placeholder="Search products"
        aria-label="Search products to add"
      />
      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-2">
        {shown.map((product) => {
          const picked = chosen.includes(product.id);
          return (
            <li key={product.id}>
              <button
                type="button"
                aria-pressed={picked}
                disabled={!picked && full}
                onClick={() => toggle(product.id)}
                className={cx(
                  "flex w-full items-center gap-3 rounded p-1 text-left font-body text-body-md text-on-surface disabled:opacity-50",
                  picked ? "bg-primary-fixed" : "hover:bg-surface-container",
                )}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded bg-surface-container">
                  {product.featuredImage && (
                    <Image src={product.featuredImage.url} alt="" fill sizes="40px" className="object-contain" />
                  )}
                </span>
                <span className="flex-1">{product.title}</span>
                <span className="font-label text-label-md text-primary">{picked ? "Added" : "Add"}</span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="p-1 font-body text-label-md text-on-surface-variant">No products found.</li>}
      </ul>
    </div>
  );
}

// The homepage stacks, in the order they show. They travel with the form as JSON, so nothing changes on
// the live homepage until the entry is saved and published.
export function StacksField({ initial, products }: { initial: Stack[]; products: ProductChoice[] }) {
  const [stacks, setStacks] = useState(initial);

  const change = (id: string, next: Partial<Stack>) =>
    setStacks((current) => current.map((stack) => (stack.id === id ? { ...stack, ...next } : stack)));

  function move(from: number, to: number) {
    setStacks((current) => {
      const next = [...current];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="stacks" value={JSON.stringify(stacks)} />
      <p className="font-label text-label-md text-on-surface">
        Stacks ({stacks.length} of {MAX_STACKS})
      </p>
      {stacks.length === 0 && (
        <p className="font-body text-label-md text-on-surface-variant">No stacks. The section stays hidden until you add one.</p>
      )}
      <ol className="space-y-4">
        {stacks.map((stack, index) => (
          <li key={stack.id} className="grid gap-4 rounded-lg border border-outline-variant p-4 md:grid-cols-[12rem_1fr]">
            <Image
              src={stack.image.url}
              alt=""
              width={stack.image.width}
              height={stack.image.height}
              sizes="12rem"
              className="h-auto w-full max-w-48 rounded-lg"
            />
            <div className="min-w-0 space-y-4">
              <label className="flex flex-col gap-2 font-label text-label-md text-on-surface">
                Name of stack {index + 1}
                <Input
                  value={stack.title}
                  maxLength={120}
                  onChange={(event) => change(stack.id, { title: event.target.value })}
                  onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
                  placeholder="Shells and pink beads"
                />
              </label>
              <PiecePicker chosen={stack.productIds} products={products} onChange={(productIds) => change(stack.id, { productIds })} />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  Move up
                </Button>
                <Button variant="secondary" disabled={index === stacks.length - 1} onClick={() => move(index, index + 1)}>
                  Move down
                </Button>
                <Button variant="outlined" onClick={() => setStacks((current) => current.filter((other) => other.id !== stack.id))}>
                  Remove stack {index + 1}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <ImageUploader
        uploadLabel="Add a stack picture"
        disabled={stacks.length >= MAX_STACKS}
        onReady={(image) =>
          setStacks((current) =>
            current.length >= MAX_STACKS
              ? current
              : [...current, { id: crypto.randomUUID().slice(0, 8), title: "", image, productIds: [] }],
          )
        }
      />
    </div>
  );
}
