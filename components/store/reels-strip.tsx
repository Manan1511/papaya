"use client";

import { useEffect, useRef, useState } from "react";
import { ReelViewer } from "./reel-viewer";

// A reel is 9:16 and about 14rem wide, so this many fill even a wide desktop screen.
const CARDS_TO_FILL_A_ROW = 8;
// Seconds each reel takes to cross the screen. Slow enough to watch.
const SECONDS_PER_REEL = 7;

// Frames shown until there are real reels. The tints rotate through the palette.
const FRAME_TINTS = ["bg-primary-fixed", "bg-secondary-fixed", "bg-tertiary-fixed"];

const frameClass =
  "aspect-[9/16] w-44 shrink-0 overflow-hidden rounded-lg border-[1.5px] border-tertiary shadow-hard-secondary md:w-56";

function PlaceholderFrame({ index }: { index: number }) {
  return (
    <li className={`${frameClass} flex flex-col items-center justify-center gap-3 ${FRAME_TINTS[index % FRAME_TINTS.length]}`}>
      <span className="flex size-14 items-center justify-center rounded-full border-[1.5px] border-tertiary bg-surface-container-lowest">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6 fill-tertiary stroke-tertiary"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          {/* Drawn so the triangle's weight, not its bounding box, sits on the centre. */}
          <polygon points="8.5,6 17.5,12 8.5,18" />
        </svg>
      </span>
      <span className="font-label text-label-md text-on-surface">Watch the Reels</span>
    </li>
  );
}

// A reel plays only while it is on screen, and only if the shopper hasn't asked for less motion. Tapping
// it opens the full-screen viewer. While the viewer is open the row's videos rest, so they don't compete
// with the one being watched.
function Reel({
  src,
  preload,
  suspended,
  focusable,
  label,
  onOpen,
}: {
  src: string;
  preload: "metadata" | "none";
  suspended: boolean;
  focusable: boolean;
  label: string;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const onScreen = useRef(false);
  const rest = useRef(suspended);
  rest.current = suspended;

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.muted = true;
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen.current = entry?.isIntersecting ?? false;
      if (onScreen.current && !rest.current) video.play().catch(() => {}); // Browsers can refuse autoplay.
      else video.pause();
    });
    watcher.observe(video);
    return () => watcher.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (suspended) video.pause();
    else if (onScreen.current) video.play().catch(() => {});
  }, [suspended]);

  return (
    <li className={`${frameClass} reel-card bg-surface-container-lowest`}>
      <button
        type="button"
        aria-label={label}
        tabIndex={focusable ? 0 : -1}
        onClick={onOpen}
        className="block size-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-secondary"
      >
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          preload={preload}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none size-full object-cover"
        />
      </button>
    </li>
  );
}

// The homepage reels: a row of phone videos that drifts sideways and stops while the shopper points
// at it. The list is repeated to fill the screen, then the whole row is doubled so the loop has no
// seam. Shoppers who ask for less motion get a still row they can scroll.
export function ReelsStrip({ reels }: { reels: string[] }) {
  const placeholder = reels.length === 0;
  // The reel being watched full screen, as a position in `reels`.
  const [open, setOpen] = useState<number | null>(null);
  const repeats = Math.max(1, Math.ceil(CARDS_TO_FILL_A_ROW / Math.max(1, reels.length)));
  const row = placeholder ? Array.from({ length: CARDS_TO_FILL_A_ROW }, () => "") : Array.from({ length: repeats }, () => reels).flat();
  const item = (src: string, index: number, preload: "metadata" | "none") => {
    if (placeholder) return <PlaceholderFrame key={index} index={index} />;
    // The row repeats the list, so a card's place in the row maps back to its reel.
    const reel = index % reels.length;
    return (
      <Reel
        key={`${src}-${index}`}
        src={src}
        preload={preload}
        suspended={open !== null}
        focusable={preload === "metadata"}
        label={`Watch reel ${reel + 1} of ${reels.length}`}
        onOpen={() => setOpen(reel)}
      />
    );
  };

  return (
    <div className="reels-viewport py-2" aria-label="Reels" role="group" aria-hidden={placeholder || undefined} data-open={open !== null || undefined}>
      <div className="reels-track" style={{ "--reels-seconds": `${row.length * SECONDS_PER_REEL}s` } as React.CSSProperties}>
        <ul className="flex shrink-0 gap-4 pr-4">
          {row.map((src, index) => item(src, index, "metadata"))}
        </ul>
        {/* The copy that makes the loop seamless. Hidden from assistive technology and from people who
            asked for less motion. */}
        <ul aria-hidden="true" className="reels-copy flex shrink-0 gap-4 pr-4">
          {row.map((src, index) => item(src, index, "none"))}
        </ul>
      </div>
      {open !== null && <ReelViewer reels={reels} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
