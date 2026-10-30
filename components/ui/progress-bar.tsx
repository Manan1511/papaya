import { cx } from "../../lib/cx";

type Tone = "primary" | "secondary" | "tertiary";

const fills: Record<Tone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};

// Track and fill from the board. The label is the accessible name; the bar is announced with its value.
export function ProgressBar({
  value,
  label,
  tone = "primary",
  className,
}: {
  value: number;
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cx("h-2 w-full overflow-hidden rounded-full bg-surface-container-highest", className)}
    >
      <div
        className={cx("h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-emphasized", fills[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
