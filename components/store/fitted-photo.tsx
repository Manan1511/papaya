import Image from "next/image";
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

type Photo = { url: string; width: number | null; height: number | null };

// A card's picture, whole and in its own shape. Cards in a row share one height, so where this picture
// is shorter than its neighbour's, a blurred copy of it fills the space above and below and the words
// under every picture stay level. `children` are laid over the picture, for badges.
export function FittedPhoto({
  photo,
  alt,
  sizes,
  className,
  children,
}: {
  photo: Photo;
  alt: string;
  sizes: string;
  className?: string;
  children?: ReactNode;
}) {
  const shared = { src: photo.url, width: photo.width ?? 800, height: photo.height ?? 1000, sizes };

  return (
    <div className="relative flex flex-1 flex-col justify-center overflow-hidden">
      <Image {...shared} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-125 object-cover opacity-70 blur-xl" />
      <Image {...shared} alt={alt} className={cx("relative h-auto w-full", className)} />
      {children}
    </div>
  );
}
