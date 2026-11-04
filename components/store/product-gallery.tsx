"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "../../lib/cx";

type GalleryImage = { url: string; altText: string | null; width: number | null; height: number | null };

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  if (!current) return <div className="aspect-[4/5] rounded-xl bg-surface-container" />;

  return (
    <div className="flex flex-col gap-4">
      {/* Keyed by image, so the main photo fades in whenever the shopper picks another one. */}
      <div
        key={current.url}
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-background motion-safe:animate-fade-in"
      >
        <Image
          src={current.url}
          alt={current.altText ?? title}
          width={current.width ?? 1000}
          height={current.height ?? 1250}
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="absolute -inset-[5%] h-[110%] w-[110%] max-w-none object-cover mix-blend-multiply"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, position) => (
            <button
              key={image.url}
              type="button"
              aria-label={`Show image ${position + 1}`}
              aria-pressed={position === index}
              onClick={() => setIndex(position)}
              className={cx(
                "relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-[opacity,border-color] duration-200 ease-emphasized",
                position === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                width={image.width ?? 200}
                height={image.height ?? 250}
                className="absolute -inset-[5%] h-[110%] w-[110%] max-w-none object-cover mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
