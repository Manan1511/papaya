// Next.js hands repeated query parameters over as arrays. Pages use the first value.
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
