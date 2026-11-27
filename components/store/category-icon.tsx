import type { ReactNode } from "react";

// Papaya's own category drawings: navy line art, like the papaya in the logo, with touches of fruit
// orange and chili.
const orange = "fill-primary-container";
const chili = "fill-primary";
const white = "fill-white";

// Beads threaded along a chain, alternating in colour.
function beads(points: [number, number][]) {
  return points.map(([x, y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" className={index % 2 ? chili : white} />);
}

const drawings = {
  papaya: (
    <>
      <path d="M30 9c6 1 9 7 8 14-1 5-2 11-7 15-4 3-9 5-13 3-5-2-8-7-6-12 2-6 4-7 6-12 3-6 6-9 12-8Z" className={orange} />
      <path d="m34 10 3-5M28 15c-3 6-9 11-10 19M35 18c-1 8-5 15-11 19" />
    </>
  ),
  necklace: (
    <>
      <path d="M10 7c0 17 6 27 14 27s14-10 14-27" />
      {beads([[11.5, 18], [14.5, 26], [19, 32], [29, 32], [33.5, 26], [36.5, 18]])}
      <path d="M24 34c-3 3-5 5-5 7a5 5 0 0 0 10 0c0-2-2-4-5-7Z" className={orange} />
    </>
  ),
  earrings: (
    <>
      <circle cx="14" cy="14" r="6" />
      <circle cx="34" cy="14" r="6" />
      <path d="M14 20c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12Z" className={orange} />
      <path d="M34 20c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12Z" className={orange} />
    </>
  ),
  bracelet: (
    <>
      <ellipse cx="24" cy="23" rx="16" ry="12" />
      {beads([[8, 23], [11, 16], [18, 12], [30, 12], [37, 16], [40, 23], [37, 30], [30, 34], [18, 34], [11, 30]])}
      <path d="M24 35v4" />
      <circle cx="24" cy="41" r="3" className={orange} />
    </>
  ),
  ring: (
    <>
      <circle cx="24" cy="30" r="12" />
      <circle cx="24" cy="30" r="8" />
      <path d="m18 12 3-5h6l3 5-6 7-6-7Z" className={orange} />
      <path d="M18 12h12" />
    </>
  ),
  anklet: (
    <>
      <path d="M6 15c6 10 30 10 36 0" />
      {beads([[12, 20.5], [24, 23], [36, 20.5]])}
      <path d="M17 22v6M31 22v6" />
      <circle cx="17" cy="31" r="3" className={orange} />
      <circle cx="31" cy="31" r="3" className={orange} />
    </>
  ),
  long: (
    <>
      <path d="M13 4c0 16 6 24 11 32 5-8 11-16 11-32" />
      {beads([[14.5, 15], [18.5, 25], [29.5, 25], [33.5, 15]])}
      <circle cx="24" cy="40" r="5" className={orange} />
    </>
  ),
  minimal: (
    <>
      <path d="M11 6c0 13 6 21 13 21s13-8 13-21" />
      <path d="M24 28v2M24 42v3M16.5 36h-3M34.5 36h-3M18.5 30.5l-2-2M29.5 30.5l2-2M18.5 41.5l-2 2M29.5 41.5l2 2" />
      <circle cx="24" cy="36" r="5" className={orange} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type CategoryDrawing = keyof typeof drawings;

// Which drawing suits a collection, judged by its name. "Earrings" is tried before "rings", and a
// style ("long", "minimal") before the kind of piece. Null when nothing fits.
const matches: [RegExp, CategoryDrawing][] = [
  [/earring/, "earrings"],
  [/bracelet|bangle/, "bracelet"],
  [/anklet/, "anklet"],
  [/\brings?\b/, "ring"],
  [/\blong\b/, "long"],
  [/minimal|everyday/, "minimal"],
  [/necklace|chain|choker/, "necklace"],
];

export function drawingFor(title: string): CategoryDrawing | null {
  const name = title.toLowerCase();
  return matches.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}

export function CategoryIcon({ drawing }: { drawing: CategoryDrawing }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="size-11 stroke-tertiary md:size-14"
      fill="none"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawings[drawing]}
    </svg>
  );
}
