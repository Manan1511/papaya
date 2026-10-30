// Joins class names and skips falsy parts. Callers only add classes that don't
// conflict with the base classes, since there is no class-merging step.
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
