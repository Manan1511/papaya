import { describe, expect, it } from "vitest";
import { galleryItems } from "./gallery";

const photo = (url: string) => ({ url, altText: null, width: 800, height: 1000 });

describe("galleryItems", () => {
  it("keeps photos and videos in Shopify's order", () => {
    const items = galleryItems(
      [
        { image: photo("a.jpg") },
        { previewImage: photo("poster.jpg"), sources: [{ url: "v.mp4", mimeType: "video/mp4", height: 720 }] },
        { image: photo("b.jpg") },
      ],
      null,
    );
    expect(items.map((item) => (item.kind === "image" ? item.url : item.src))).toEqual(["a.jpg", "v.mp4", "b.jpg"]);
    expect(items[1]).toMatchObject({ kind: "video", poster: { url: "poster.jpg" } });
  });

  it("leaves out a video with no MP4 and media of other kinds", () => {
    const items = galleryItems(
      [{}, { sources: [{ url: "v.m3u8", mimeType: "application/x-mpegURL", height: 720 }] }, { image: photo("a.jpg") }],
      null,
    );
    expect(items).toHaveLength(1);
  });

  it("falls back to the featured image when there is no media", () => {
    expect(galleryItems([], photo("f.jpg"))).toEqual([{ kind: "image", ...photo("f.jpg") }]);
    expect(galleryItems([], null)).toEqual([]);
  });
});
