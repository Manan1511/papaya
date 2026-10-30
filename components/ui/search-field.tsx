import type { InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { Icon } from "./icon";
import { Input } from "./input";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "aria-label"> & { label: string };

// Search field with a leading magnifier. The label becomes the accessible name, since the placeholder isn't one.
export function SearchField({ label, className, ...props }: Props) {
  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
      <Input
        type="search"
        aria-label={label}
        placeholder="Search"
        className={cx("pl-12", className)}
        {...props}
      />
    </div>
  );
}
