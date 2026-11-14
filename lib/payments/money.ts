// Shopify sends rupees as strings such as "1299.50". Razorpay wants whole paise. Splitting the string
// avoids the rounding drift that multiplying a float by 100 causes (1299.99 * 100 = 129998.99999999999).

export function toPaise(amount: string): number {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount.trim());
  if (!match) throw new Error(`Not a money amount: ${amount}`);

  const [, whole, fraction = ""] = match;
  const extra = fraction.slice(2);
  if (/[1-9]/.test(extra)) throw new Error(`More than two decimal places: ${amount}`);

  return Number(whole) * 100 + Number(fraction.slice(0, 2).padEnd(2, "0"));
}

// "1299.50", the form Shopify's Admin API takes for a money amount.
export function fromPaise(paise: number): string {
  if (!Number.isInteger(paise) || paise < 0) throw new Error(`Not a paise amount: ${paise}`);
  return `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, "0")}`;
}
