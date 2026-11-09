"use client";

import { useEffect, useRef, useState } from "react";

// The hero's looping video. It is muted, plays unless the shopper asks for less motion, and leaves
// its frame out if the file can't load, so a bad address never shows an empty box.
export function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A file can fail before the page finishes loading, which is before the error handler is attached.
    if (video.error) {
      setFailedSrc(src);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.muted = true;
    video.play().catch(() => {}); // Browsers can refuse autoplay. The first frame still shows.
  }, [src]);

  if (failedSrc === src) return null;

  return (
    <div className="overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest shadow-hard-secondary">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={() => setFailedSrc(src)}
        className="aspect-[4/3] h-auto w-full object-cover"
      />
    </div>
  );
}
