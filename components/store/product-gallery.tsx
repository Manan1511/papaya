"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "../../lib/cx";
import type { GalleryImage, GalleryItem } from "../../lib/shopify/gallery";

const thumbClass = "absolute inset-0 size-full object-contain mix-blend-multiply";

// Videos have no size of their own until they load, so the poster's shape is used (portrait if there is none).
function videoRatio(poster: GalleryImage | null) {
  return poster?.width && poster.height ? `${poster.width} / ${poster.height}` : "4 / 5";
}

export function ProductGallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  if (!current) return <div className="aspect-[4/5] rounded-xl bg-surface-container" />;

  return (
    <div className="flex flex-col gap-4">
      {/* Keyed by the item, so the main picture fades in whenever the shopper picks another one. */}
      <div
        key={current.kind === "image" ? current.url : current.src}
        className="relative overflow-hidden rounded-xl bg-background motion-safe:animate-fade-in"
        style={current.kind === "video" ? { aspectRatio: videoRatio(current.poster) } : undefined}
      >
        {current.kind === "image" ? (
          <Image
            src={current.url}
            alt={current.altText ?? title}
            width={current.width ?? 1000}
            height={current.height ?? 1250}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="mx-auto h-auto max-h-[85vh] w-auto max-w-full mix-blend-multiply"
          />
        ) : (
          // Starts on its own, silently and on a loop, like a short clip. The controls turn sound on.
          <video
            src={current.src}
            poster={current.poster?.url}
            aria-label={`${title}, video`}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="size-full bg-surface-container object-contain"
          />
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {items.map((item, position) => (
            <button
              key={item.kind === "image" ? item.url : item.src}
              type="button"
              aria-label={item.kind === "video" ? `Show video ${position + 1}` : `Show image ${position + 1}`}
              aria-pressed={position === index}
              onClick={() => setIndex(position)}
              className={cx(
                "relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-[opacity,border-color] duration-200 ease-emphasized",
                position === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {(() => {
                const picture = item.kind === "image" ? item : item.poster;
                return picture ? (
                  <Image src={picture.url} alt="" width={picture.width ?? 200} height={picture.height ?? 250} className={thumbClass} />
                ) : (
                  <span className="absolute inset-0 bg-surface-container" />
                );
              })()}
              {item.kind === "video" && (
                <span className="absolute bottom-1 left-1 flex size-6 items-center justify-center rounded-full bg-black/60">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 fill-white">
                    <polygon points="8.5,6 18,12 8.5,18" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
