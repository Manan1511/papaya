export type Money = { amount: string; currencyCode: string };

const formatters = new Map<string, Intl.NumberFormat>();

// Indian grouping and whole rupees when there are no paise, e.g. ₹2,499.
export function formatPrice({ amount, currencyCode }: Money): string {
  let formatter = formatters.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatters.set(currencyCode, formatter);
  }
  return formatter.format(Number(amount));
}
