import { pickMp4Url, type VideoSource } from "../cms/video";

export type GalleryImage = { url: string; altText: string | null; width: number | null; height: number | null };

// One slot in the product gallery: a photo, or a video with the picture shown before it plays.
export type GalleryItem =
  | ({ kind: "image" } & GalleryImage)
  | { kind: "video"; src: string; poster: GalleryImage | null };

type MediaNode = {
  image?: GalleryImage | null;
  previewImage?: GalleryImage | null;
  sources?: VideoSource[];
};

// The gallery for a product, in the order set in Shopify. A video with no MP4 version is left out, and
// a product with no media falls back to its featured image.
export function galleryItems(media: MediaNode[], featuredImage: GalleryImage | null): GalleryItem[] {
  const items = media.flatMap((node): GalleryItem[] => {
    if (node.image) return [{ kind: "image", ...node.image }];
    const src = node.sources ? pickMp4Url(node.sources) : undefined;
    return src ? [{ kind: "video", src, poster: node.previewImage ?? null }] : [];
  });
  if (items.length > 0) return items;
  return featuredImage ? [{ kind: "image", ...featuredImage }] : [];
}
