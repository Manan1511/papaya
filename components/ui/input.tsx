import type { InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

// Focus swaps the neutral border for a 2px orange stroke with a soft yellow glow (DESIGN.md).
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface placeholder:text-outline transition-[border-color,box-shadow] duration-200 ease-emphasized focus:border-2 focus:border-primary focus:outline-none focus:ring-4 focus:ring-tertiary-fixed/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
