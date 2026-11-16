"use client";

import { useEffect, useRef } from "react";

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
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 translate-x-0.5 fill-tertiary">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        </svg>
      </span>
      <span className="font-label text-label-md text-on-surface">Reel coming soon</span>
    </li>
  );
}

// A reel plays only while it is on screen, and only if the shopper hasn't asked for less motion.
function Reel({ src, preload }: { src: string; preload: "metadata" | "none" }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.muted = true;
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) video.play().catch(() => {}); // Browsers can refuse autoplay.
      else video.pause();
    });
    watcher.observe(video);
    return () => watcher.disconnect();
  }, []);

  return (
    <li className={`${frameClass} bg-surface-container-lowest`}>
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload={preload}
        aria-hidden="true"
        tabIndex={-1}
        className="size-full object-cover"
      />
    </li>
  );
}

// The homepage reels: a row of phone videos that drifts sideways and stops while the shopper points
// at it. The list is repeated to fill the screen, then the whole row is doubled so the loop has no
// seam. Shoppers who ask for less motion get a still row they can scroll.
export function ReelsStrip({ reels }: { reels: string[] }) {
  const placeholder = reels.length === 0;
  const repeats = Math.max(1, Math.ceil(CARDS_TO_FILL_A_ROW / Math.max(1, reels.length)));
  const row = placeholder ? Array.from({ length: CARDS_TO_FILL_A_ROW }, () => "") : Array.from({ length: repeats }, () => reels).flat();
  const item = (src: string, index: number, preload: "metadata" | "none") =>
    placeholder ? <PlaceholderFrame key={index} index={index} /> : <Reel key={`${src}-${index}`} src={src} preload={preload} />;

  return (
    <div className="reels-viewport py-2" aria-label="Reels" role="group" aria-hidden={placeholder || undefined}>
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
    </div>
  );
}
