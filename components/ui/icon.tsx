import { cx } from "../../lib/cx";

type Props = { name: string; filled?: boolean; className?: string };

// Decorative: the surrounding control or adjacent text supplies the accessible name.
export function Icon({ name, filled = false, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cx("material-symbols-outlined", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
