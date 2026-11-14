"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "../../lib/cx";

// Until the file says how big it is, the frame assumes a phone video, the likeliest upload.
const PHONE_RATIO = 9 / 16;
// A video wider or taller than these is cropped to fit, so the hero never becomes a sliver or a banner.
const MIN_RATIO = 9 / 16;
const MAX_RATIO = 16 / 9;

// The hero's looping video. It is muted, plays unless the shopper asks for less motion, and leaves
// its frame out if the file can't load, so a bad address never shows an empty box. The frame takes
// the video's own shape: a tall card for a phone video, a wide one for a landscape clip.
export function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [ratio, setRatio] = useState(PHONE_RATIO);

  function measure(video: HTMLVideoElement) {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, video.videoWidth / video.videoHeight)));
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A file can fail or finish loading its size before the page hydrates, which is before the
    // handlers below are attached.
    if (video.error) {
      setFailedSrc(src);
      return;
    }
    if (video.readyState >= 1) measure(video);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.muted = true;
    video.play().catch(() => {}); // Browsers can refuse autoplay. The first frame still shows.
  }, [src]);

  if (failedSrc === src) return null;

  const tall = ratio < 1;

  return (
    <div className="flex justify-center md:justify-end">
      <div
        style={{ aspectRatio: ratio }}
        className={cx(
          "overflow-hidden rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest shadow-hard-secondary",
          // A tall card is sized by its height, so it fits a laptop screen. A wide one fills its column.
          tall ? "h-[min(32rem,75svh)]" : "w-full max-w-xl",
        )}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onLoadedMetadata={(event) => measure(event.currentTarget)}
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
