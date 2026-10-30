import type { ReactNode } from "react";

// Templates re-mount on every navigation, so each store page eases in as the shopper arrives.
export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <div className="motion-safe:animate-fade-up">{children}</div>;
}
