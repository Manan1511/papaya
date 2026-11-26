import { cx } from "../../lib/cx";

// The < and > that step a carousel, laid over its left and right edges. At the end it faces, an arrow
// fades out but keeps focus, so a keyboard user isn't dropped.
export function CarouselArrow({
  direction,
  label,
  off,
  onClick,
}: {
  direction: "previous" | "next";
  label: string;
  off: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={off}
      onClick={() => !off && onClick()}
      className={cx(
        "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-tertiary bg-surface-container-lowest/90 text-primary transition-opacity duration-200 ease-emphasized aria-disabled:pointer-events-none aria-disabled:opacity-0",
        direction === "previous" ? "left-2" : "right-2",
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={direction === "previous" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}
