import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

// Side margins: 16px on mobile, 32px on tablet, 40px on desktop. Max width 1280px.
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-tablet lg:px-margin-desktop",
        className,
      )}
    >
      {children}
    </div>
  );
}
