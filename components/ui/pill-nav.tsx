import type { ReactNode } from "react";
import { IconButton } from "./icon-button";

export type PillLink = { label: string; icon: string; href?: string; current?: boolean; badge?: number };
export type PillCustom = { label: string; node: ReactNode };
export type PillItem = PillLink | PillCustom;

// A rounded track of controls. The current item is a solid primary circle, as on the board.
// A badge is decorative: the count is already part of the item's label. A `node` item renders
// its own control, such as the bag drawer.
export function PillNav({ items, label }: { items: PillItem[]; label: string }) {
  return (
    <nav aria-label={label} className="inline-flex items-center gap-1 rounded-full bg-surface-container-high p-1">
      {items.map((item) => (
        <div key={item.label} className="relative">
          {"node" in item ? (
            item.node
          ) : (
            <>
              <IconButton
                icon={item.icon}
                label={item.label}
                href={item.href}
                current={item.current}
                tone={item.current ? "primary" : "ghost"}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary"
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
