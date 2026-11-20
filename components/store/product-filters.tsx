import Link from "next/link";
import { cx } from "../../lib/cx";
import { formatPrice } from "../../lib/format";
import type { ListingFacets } from "../../lib/shopify/catalog";
import type { ListingParams } from "../../lib/shopify/listing";
import { listingHref } from "../../lib/shopify/listing";
import { Button } from "../ui/button";
import { SortSelect } from "./sort-select";

const chip =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-label text-label-md transition-colors duration-200 ease-emphasized focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";
const chipIdle = "border-outline bg-surface-container-lowest text-on-surface hover:bg-primary-fixed";
const chipActive = "border-primary bg-primary text-on-primary";

const priceInput =
  "h-11 w-full rounded border border-outline-variant bg-surface-container-lowest pl-8 pr-3 font-body text-body-md text-on-surface transition-[border-color,box-shadow] duration-200 ease-emphasized focus:border-2 focus:border-primary focus:outline-none focus:ring-4 focus:ring-tertiary-fixed/50";

const rupees = (amount: number) => formatPrice({ amount: String(amount), currencyCode: "INR" });

function priceLabel({ min, max }: Pick<ListingParams, "min" | "max">): string | null {
  if (min !== undefined && max !== undefined) return `${rupees(min)} – ${rupees(max)}`;
  if (min !== undefined) return `From ${rupees(min)}`;
  if (max !== undefined) return `Up to ${rupees(max)}`;
  return null;
}

// Pill-shaped choice for a radio or checkbox. The input sits behind its label, so the whole pill is
// the target and the keyboard still works.
function Choice({ children, ...input }: React.InputHTMLAttributes<HTMLInputElement> & { children: React.ReactNode }) {
  return (
    <label className="relative">
      <input {...input} className="peer sr-only" />
      <span
        className={cx(
          chip,
          chipIdle,
          "cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary",
        )}
      >
        {children}
      </span>
    </label>
  );
}

// The shop's filter bar. One row of product types, then a Filters button and the sort menu, then a
// chip for each filter in use that removes itself when tapped. It is a plain GET form, so filters work
// without JavaScript and every filtered view has its own address.
export function ProductFilters({
  params,
  facets,
  showType,
  basePath,
}: {
  params: ListingParams;
  facets: ListingFacets;
  showType: boolean;
  basePath: string;
}) {
  const price = priceLabel(params);
  const active = [
    params.size && { label: `Size ${params.size}`, href: listingHref(basePath, params, { size: undefined }) },
    price && { label: price, href: listingHref(basePath, params, { min: undefined, max: undefined }) },
    params.available && { label: "In stock", href: listingHref(basePath, params, { available: undefined }) },
  ].filter((entry): entry is { label: string; href: string } => Boolean(entry));

  return (
    <section aria-label="Filter and sort" className="space-y-3">
      {showType && (
        <nav aria-label="Product type" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          <Link
            href={listingHref(basePath, params, { type: undefined })}
            aria-current={params.type ? undefined : "true"}
            className={cx(chip, params.type ? chipIdle : chipActive)}
          >
            All
          </Link>
          {facets.types.map((type) => (
            <Link
              key={type}
              href={listingHref(basePath, params, { type })}
              aria-current={params.type === type ? "true" : undefined}
              className={cx(chip, params.type === type ? chipActive : chipIdle)}
            >
              {type}
            </Link>
          ))}
        </nav>
      )}

      {/* Keyed by the current filters, so the fields start again from the address after every change. The
          inputs only read their starting values, and would otherwise keep what was typed on an earlier view. */}
      <form
        key={listingHref(basePath, params)}
        method="get"
        action={basePath}
        className="relative flex items-center justify-between gap-3"
      >
        {params.type && <input type="hidden" name="type" value={params.type} />}

        <details className="group">
          <summary
            className={cx(
              chip,
              active.length > 0 ? "border-primary bg-primary-fixed text-primary" : chipIdle,
              "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            Filters
            {active.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.75rem] font-bold text-on-primary">
                {active.length}
              </span>
            )}
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              className="size-3 transition-transform duration-200 group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4.5 6 8.5l4-4" />
            </svg>
          </summary>

          <div className="absolute inset-x-0 top-full z-20 mt-2 space-y-5 md:inset-x-auto md:left-0 md:w-[26rem] rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest p-5 shadow-hard-secondary">
            {showType && facets.sizes.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="font-label text-label-md font-bold text-on-surface">Size</legend>
                <div className="flex flex-wrap gap-2">
                  <Choice type="radio" name="size" value="" defaultChecked={!params.size}>
                    Any
                  </Choice>
                  {facets.sizes.map((size) => (
                    <Choice key={size} type="radio" name="size" value={size} defaultChecked={params.size === size}>
                      {size}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="space-y-2">
              <legend className="font-label text-label-md font-bold text-on-surface">Price</legend>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["min", "Min", params.min],
                    ["max", "Max", params.max],
                  ] as const
                ).map(([name, label, value]) => (
                  <label key={name} className="relative block">
                    <span className="sr-only">{label} price in rupees</span>
                    <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-body-md text-on-surface-variant">
                      ₹
                    </span>
                    <input
                      type="number"
                      name={name}
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder={label}
                      defaultValue={value}
                      className={priceInput}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <Choice type="checkbox" name="available" value="1" defaultChecked={params.available}>
              In stock only
            </Choice>

            <div className="flex items-center gap-4">
              <Button type="submit" className="flex-1">
                Show results
              </Button>
              <Link href={listingHref(basePath, params, { size: undefined, min: undefined, max: undefined, available: undefined })} className="link-underline font-label text-label-md text-secondary">
                Clear
              </Link>
            </div>
          </div>
        </details>

        <SortSelect value={params.sort} />
      </form>

      {active.length > 0 && (
        <ul aria-label="Filters in use" className="flex flex-wrap items-center gap-2">
          {active.map((entry) => (
            <li key={entry.label}>
              <Link href={entry.href} aria-label={`Remove filter: ${entry.label}`} className={cx(chip, "h-9 border-primary bg-primary-fixed pr-3 text-primary hover:bg-primary-fixed-dim")}>
                {entry.label}
                <span aria-hidden="true" className="text-[1.1rem] leading-none">
                  ×
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={listingHref(basePath, params, { size: undefined, min: undefined, max: undefined, available: undefined })} className="link-underline px-1 font-label text-label-md text-secondary">
              Clear all
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}
