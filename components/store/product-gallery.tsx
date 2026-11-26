"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cx } from "../../lib/cx";
import type { GalleryImage, GalleryItem } from "../../lib/shopify/gallery";
import { CarouselArrow } from "../ui/carousel-arrow";

const thumbClass = "absolute inset-0 size-full object-contain mix-blend-multiply";

// A slide takes its picture's own shape, as wide as the gallery but never taller than most of the screen.
// The space is held before the file arrives. Videos have no size of their own until they load, so the
// poster's shape is used (portrait if there is none).
function shape(picture: GalleryImage | null) {
  const ratio = picture?.width && picture.height ? picture.width / picture.height : 4 / 5;
  return { aspectRatio: ratio, maxWidth: `calc(85vh * ${ratio})` };
}

// The product's photos and videos in one row the shopper swipes through, one at a time. The browser's own
// scroll snapping does the swiping, the arrows step one slide and the thumbnails jump to one.
export function ProductGallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [index, setIndex] = useState(0);
  const slides = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);

  // Only the video on screen plays. It starts muted and loops, like a short clip.
  useEffect(() => {
    slides.current?.querySelectorAll("video").forEach((video) => {
      if (Number(video.dataset.position) === index) video.play().catch(() => {}); // Browsers can refuse autoplay.
      else video.pause();
    });
    // Keeps the current thumbnail in view without moving the page.
    const strip = thumbs.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (strip && thumb) strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2 });
  }, [index]);

  if (items.length === 0) return <div className="aspect-[4/5] rounded-xl bg-surface-container" />;

  function show(position: number) {
    const row = slides.current;
    if (row) row.scrollTo({ left: position * row.clientWidth });
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="relative">
        <div
          ref={slides}
          role="region"
          aria-label="Product photos and videos"
          tabIndex={items.length > 1 ? 0 : undefined}
          onScroll={(event) => {
            const { scrollLeft, clientWidth } = event.currentTarget;
            if (clientWidth > 0) setIndex(Math.min(items.length - 1, Math.max(0, Math.round(scrollLeft / clientWidth))));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl bg-background [scrollbar-width:none] motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, position) => (
            <div
              key={item.kind === "image" ? item.url : item.src}
              aria-hidden={position !== index || undefined}
              className="flex w-full shrink-0 snap-center snap-always items-center justify-center"
            >
              {item.kind === "image" ? (
                <Image
                  src={item.url}
                  alt={item.altText ?? title}
                  width={item.width ?? 1000}
                  height={item.height ?? 1250}
                  priority={position === 0}
                  // The neighbours load ahead, so a swipe doesn't land on a blank slide.
                  loading={position === 0 ? undefined : Math.abs(position - index) <= 1 ? "eager" : "lazy"}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  style={shape(item)}
                  className="h-auto w-full mix-blend-multiply"
                />
              ) : (
                // The controls turn sound on.
                <video
                  data-position={position}
                  src={item.src}
                  poster={item.poster?.url}
                  aria-label={`${title}, video`}
                  tabIndex={position === index ? 0 : -1}
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  style={shape(item.poster)}
                  className="w-full bg-surface-container object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <CarouselArrow direction="previous" label="Previous photo or video" off={index === 0} onClick={() => show(index - 1)} />
            <CarouselArrow direction="next" label="Next photo or video" off={index === items.length - 1} onClick={() => show(index + 1)} />
          </>
        )}
      </div>

      {items.length > 1 && (
        <div ref={thumbs} className="relative flex gap-3 overflow-x-auto pb-2">
          {items.map((item, position) => (
            <button
              key={item.kind === "image" ? item.url : item.src}
              type="button"
              aria-label={item.kind === "video" ? `Show video ${position + 1}` : `Show image ${position + 1}`}
              aria-pressed={position === index}
              onClick={() => show(position)}
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
