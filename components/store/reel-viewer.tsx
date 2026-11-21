"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SWIPE_PIXELS = 60;

const control =
  "flex size-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// One reel at a time, full screen, with sound. Tap the video to pause it, swipe up or down (or use the
// arrows) for the next reel, and close it to return to the page. It is a native dialog, so Escape,
// focus handling and the page behind being inert come from the browser.
export function ReelViewer({ reels, start, onClose }: { reels: string[]; start: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const [index, setIndex] = useState(start);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const count = reels.length;

  const go = useCallback((step: number) => setIndex((current) => (current + step + count) % count), [count]);

  // Opens as a modal and stops the page behind from scrolling. The dialog closes itself on Escape or from
  // the close button, and then the page is told through its own close event.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    element.addEventListener("close", onClose);
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      element.removeEventListener("close", onClose);
      root.style.overflow = "";
    };
    // `onClose` only sets state, so a new function each render makes no difference here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each reel starts from the beginning, with sound. A browser that refuses sound gets it muted instead.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    setProgress(0);
    element.play().catch(() => {
      element.muted = true;
      setMuted(true);
      element.play().catch(() => setPaused(true));
    });
    // Only a change of reel restarts playback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // The video element is new for every reel, so the sound setting is applied again with each one.
  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted, index]);

  function togglePlay() {
    const element = video.current;
    if (!element) return;
    if (element.paused) void element.play();
    else element.pause();
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Reel"
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") go(1);
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const from = touchStart.current;
        const to = event.changedTouches[0]?.clientY;
        touchStart.current = null;
        if (from === null || to === undefined || count < 2) return;
        if (from - to > SWIPE_PIXELS) go(1);
        else if (to - from > SWIPE_PIXELS) go(-1);
      }}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-black p-0 text-white backdrop:bg-black"
    >
      <div className="relative mx-auto flex h-full items-center justify-center md:py-6">
        <div className="relative aspect-[9/16] h-full max-w-full overflow-hidden bg-black md:rounded-lg">
          <video
            key={index}
            ref={video}
            src={reels[index]}
            muted={muted}
            loop
            playsInline
            preload="auto"
            onClick={togglePlay}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            onTimeUpdate={(event) => {
              const { currentTime, duration } = event.currentTarget;
              if (duration > 0) setProgress(currentTime / duration);
            }}
            className="size-full cursor-pointer object-contain"
          />

          {paused && (
            <button type="button" aria-label="Play" onClick={togglePlay} className={`${control} absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8 fill-white">
                <polygon points="8.5,6 18,12 8.5,18" />
              </svg>
            </button>
          )}

          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <button type="button" aria-label="Close reel" onClick={() => dialog.current?.close()} className={`${control} absolute right-4 top-4`}>
          <Icon>
            <path d="M6 6l12 12M18 6 6 18" />
          </Icon>
        </button>

        {count > 1 && (
          <p aria-live="polite" className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 font-label text-label-md text-white">
            {index + 1} / {count}
          </p>
        )}

        <button
          type="button"
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
          className={`${control} absolute bottom-6 right-4`}
        >
          <Icon>
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {muted ? <path d="m16 9 5 6m0-6-5 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
          </Icon>
        </button>

        {count > 1 && (
          <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            <button type="button" aria-label="Previous reel" onClick={() => go(-1)} className={control}>
              <Icon>
                <path d="m6 15 6-6 6 6" />
              </Icon>
            </button>
            <button type="button" aria-label="Next reel" onClick={() => go(1)} className={control}>
              <Icon>
                <path d="m6 9 6 6 6-6" />
              </Icon>
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
