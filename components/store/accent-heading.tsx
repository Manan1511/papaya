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
          viewBox="0 0 160 14"
          preserveAspectRatio="none"
          className="absolute -bottom-3 -left-1 h-3 w-[calc(100%+0.5rem)] fill-none stroke-primary"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <path d="M3 4C45 13 110 13 157 2" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 28 28"
          className="absolute -right-5 -top-5 size-7 fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M8 13 11.5 3.5M13 16.5 21 10M16 22 25.5 20.5" />
        </svg>
      </span>
    </h2>
  );
}
