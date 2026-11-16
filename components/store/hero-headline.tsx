import { cx } from "../../lib/cx";

// The hero headline. Each sentence sits on its own line, and the last word is written in a red script
// with a swoosh under it. The words stay plain text, so the headline reads as one sentence to a screen
// reader and still works if the copy is edited to anything else.
export function HeroHeadline({ children, className }: { children: string; className?: string }) {
  const lines = children.trim().split(/(?<=[.!?])\s+/);
  const lastLine = lines.pop() ?? "";
  const words = lastLine.split(/\s+/);
  const accent = words.pop() ?? "";

  return (
    <h1 className={cx("font-headline", className)}>
      {lines.map((line) => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
      <span className="block whitespace-nowrap">
        {words.length > 0 && `${words.join(" ")} `}
        <span className="relative inline-block -my-2 font-script text-[1.3em] font-normal leading-none text-primary max-md:[-webkit-text-stroke:0.25rem_#fff]">
          {accent}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 20"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-[8%] h-3 w-[92%] fill-none stroke-tertiary"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M3 17C30 8 72 9 117 2" />
          </svg>
        </span>
      </span>
    </h1>
  );
}
