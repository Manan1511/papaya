import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Icon } from "./icon";

type Tone = "primary" | "secondary" | "tertiary";

const tones: Record<Tone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

// Tertiary (sunny yellow) is the default: chips carry metadata, while orange is reserved for actions.
export function Chip({
  tone = "tertiary",
  icon,
  className,
  children,
}: {
  tone?: Tone;
  icon?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label text-label-sm",
        tones[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} className="text-[16px]" />}
      {children}
    </span>
  );
}
