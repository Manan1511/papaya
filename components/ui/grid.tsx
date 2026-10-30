import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

// Column grid from the plan: 4 columns on mobile, 8 on tablet, 12 on desktop, with the 20px gutter.
// Children set their own spans with responsive col-span classes.
export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("grid grid-cols-4 gap-gutter md:grid-cols-8 lg:grid-cols-12", className)}>
      {children}
    </div>
  );
}
