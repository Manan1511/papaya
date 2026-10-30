import { type Money, formatPrice } from "../../lib/format";
import { freeShippingProgress } from "../../lib/shipping";
import { ProgressBar } from "../ui/progress-bar";

// Shows nothing until a threshold is set in lib/content/site.ts.
export function FreeShippingBar({ subtotal, threshold }: { subtotal: Money; threshold: number | null }) {
  const progress = freeShippingProgress(Number(subtotal.amount), threshold);
  if (!progress) return null;

  const message =
    progress.remaining > 0
      ? `${formatPrice({ amount: String(progress.remaining), currencyCode: subtotal.currencyCode })} more for free shipping`
      : "You've unlocked free shipping";

  return (
    <div className="space-y-2">
      <p className="font-body text-body-md text-on-surface">{message}</p>
      <ProgressBar label="Free shipping progress" value={progress.percent} tone="primary" />
    </div>
  );
}
