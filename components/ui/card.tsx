import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

type Variant = "solid" | "glass";

const variants: Record<Variant, string> = {
  solid: "border border-outline-variant/40 bg-surface-container-lowest shadow-sm",
  glass: "border border-white/40 bg-white/70 shadow-sm backdrop-blur-lg",
};

// Padding is fixed at p-6. Callers can't override it, since there is no class merging.
export function Card({
  variant = "solid",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx("rounded-lg p-6", variants[variant], className)}>{children}</div>;
}
