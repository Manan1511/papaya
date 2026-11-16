"use client";

import { SORT_OPTIONS } from "../../lib/shopify/listing";

const sortLabels: Record<(typeof SORT_OPTIONS)[number], string> = {
  best: "Best selling",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

// Sorting applies as soon as an option is chosen. Inside the filter form, so it still works as a plain
// form without JavaScript: the Apply button in the panel sends it along with the filters.
export function SortSelect({ value }: { value: (typeof SORT_OPTIONS)[number] }) {
  return (
    <select
      name="sort"
      aria-label="Sort by"
      defaultValue={value}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className="h-10 min-w-0 rounded-full border border-outline bg-surface-container-lowest px-4 font-label text-label-md text-on-surface transition-[border-color,box-shadow] duration-200 ease-emphasized focus:border-primary focus:outline-none focus:ring-4 focus:ring-tertiary-fixed/50"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {sortLabels[option]}
        </option>
      ))}
    </select>
  );
}
