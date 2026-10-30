import type { ListingParams } from "../../lib/shopify/listing";
import { PRODUCT_TYPES, RING_SIZES, SORT_OPTIONS } from "../../lib/shopify/listing";
import { Button } from "../ui/button";

const sortLabels: Record<(typeof SORT_OPTIONS)[number], string> = {
  best: "Best selling",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

const fieldClass =
  "h-11 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body text-body-md text-on-surface transition-[border-color,box-shadow] duration-200 ease-emphasized focus:border-2 focus:border-primary focus:outline-none focus:ring-4 focus:ring-tertiary-fixed/50";

// A plain GET form, so filters work without JavaScript and every filtered view has its own URL.
export function ProductFilters({ params, showType }: { params: ListingParams; showType: boolean }) {
  return (
    <form
      method="get"
      aria-label="Filter and sort"
      className="flex flex-wrap items-end gap-4 rounded-lg bg-surface-container-low p-4"
    >
      <label className="flex flex-col gap-1 font-label text-label-md text-on-surface">
        Sort
        <select name="sort" defaultValue={params.sort} className={fieldClass}>
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {sortLabels[option]}
            </option>
          ))}
        </select>
      </label>

      {showType && (
        <label className="flex flex-col gap-1 font-label text-label-md text-on-surface">
          Type
          <select name="type" defaultValue={params.type ?? ""} className={fieldClass}>
            <option value="">All types</option>
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 font-label text-label-md text-on-surface">
        Size
        <select name="size" defaultValue={params.size ?? ""} className={fieldClass}>
          <option value="">Any size</option>
          {RING_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 font-label text-label-md text-on-surface">
        Min price (₹)
        <input type="number" name="min" min={0} step={1} defaultValue={params.min} className={`${fieldClass} w-32`} />
      </label>

      <label className="flex flex-col gap-1 font-label text-label-md text-on-surface">
        Max price (₹)
        <input type="number" name="max" min={0} step={1} defaultValue={params.max} className={`${fieldClass} w-32`} />
      </label>

      <label className="flex h-11 items-center gap-2 font-label text-label-md text-on-surface">
        <input type="checkbox" name="available" value="1" defaultChecked={params.available} className="size-4 accent-primary" />
        In stock
      </label>

      <Button type="submit" variant="secondary">
        Apply
      </Button>
    </form>
  );
}
