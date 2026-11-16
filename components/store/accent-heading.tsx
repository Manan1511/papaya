import { cx } from "../../lib/cx";

// A section heading whose last word is underlined with a hand-drawn stroke and a few sparks.
// The words are plain text, so the heading reads normally to a screen reader and wraps like any other.
export function AccentHeading({ children, className }: { children: string; className?: string }) {
  const words = children.trim().split(/\s+/);
  const last = words.pop();

  return (
    <h2 className={className}>
      {words.length > 0 && `${words.join(" ")} `}
      <span className="relative inline-block whitespace-nowrap">
        {last}
        <svg
          aria-hidden="true"
          viewBox="0 0 160 12"
          preserveAspectRatio="none"
          className={cx("absolute -bottom-2 left-0 h-2.5 w-full fill-none stroke-primary")}
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M3 8C30 2 60 3 90 6s45 3 67-1" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="absolute -right-6 -top-4 size-6 fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M4 20 8 12M11 22l3-9M17 9l6-3" />
        </svg>
      </span>
    </h2>
  );
}
