import type { ReactNode } from "react";

// Templates re-mount on every navigation, so each store page eases in as the shopper arrives.
// The page background sits on this wrapper: while it animates, it isolates its contents, and
// photos blend with the page colour through multiply only if that colour is inside the group.
export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <div className="bg-background motion-safe:animate-fade-up">{children}</div>;
}
