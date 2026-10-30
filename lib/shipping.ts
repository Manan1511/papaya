// How far a subtotal is from free shipping. Null when no threshold is set.
export function freeShippingProgress(subtotal: number, threshold: number | null) {
  if (threshold === null || threshold <= 0) return null;
  return {
    remaining: Math.max(0, threshold - subtotal),
    percent: Math.min(100, Math.round((subtotal / threshold) * 100)),
  };
}
