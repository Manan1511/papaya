"use client";

import { useEffect, useRef } from "react";

// A reel is 9:16 and about 14rem wide, so this many fill even a wide desktop screen.
const CARDS_TO_FILL_A_ROW = 8;
// Seconds each reel takes to cross the screen. Slow enough to watch.
const SECONDS_PER_REEL = 7;

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
    <li className="aspect-[9/16] w-44 shrink-0 overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest shadow-hard-secondary md:w-56">
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
  if (reels.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(CARDS_TO_FILL_A_ROW / reels.length));
  const row = Array.from({ length: repeats }, () => reels).flat();

  return (
    <div className="reels-viewport py-2" aria-label="Reels" role="group">
      <div className="reels-track" style={{ "--reels-seconds": `${row.length * SECONDS_PER_REEL}s` } as React.CSSProperties}>
        <ul className="flex shrink-0 gap-4 pr-4">
          {row.map((src, index) => (
            <Reel key={`${src}-${index}`} src={src} preload="metadata" />
          ))}
        </ul>
        {/* The copy that makes the loop seamless. Hidden from assistive technology and from people who
            asked for less motion. */}
        <ul aria-hidden="true" className="reels-copy flex shrink-0 gap-4 pr-4">
          {row.map((src, index) => (
            <Reel key={`${src}-${index}`} src={src} preload="none" />
          ))}
        </ul>
      </div>
    </div>
  );
}
