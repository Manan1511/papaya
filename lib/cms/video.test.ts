import { describe, expect, it } from "vitest";
import { MAX_VIDEO_BYTES, pickMp4Url, validateVideoUpload } from "./video";

describe("video uploads", () => {
  it("accepts an MP4 under the size limit", () => {
    expect(validateVideoUpload({ mimeType: "video/mp4", size: 10 * 1024 * 1024 })).toBeNull();
  });

  it("refuses files that aren't video", () => {
    expect(validateVideoUpload({ mimeType: "image/png", size: 1000 })).toMatch(/MP4, WebM or MOV/);
  });

  it("refuses empty and oversized files", () => {
    expect(validateVideoUpload({ mimeType: "video/mp4", size: 0 })).toMatch(/empty/);
    expect(validateVideoUpload({ mimeType: "video/mp4", size: MAX_VIDEO_BYTES + 1 })).toMatch(/50 MB/);
  });
});

describe("choosing the MP4 to play", () => {
  const mp4 = (height: number) => ({ url: `https://cdn.example/${height}.mp4`, mimeType: "video/mp4", height });

  it("uses the largest MP4 up to 1080 lines", () => {
    expect(pickMp4Url([mp4(360), mp4(1080), mp4(2160), mp4(720)])).toBe("https://cdn.example/1080.mp4");
  });

  it("falls back to the smallest MP4 when every size is larger", () => {
    expect(pickMp4Url([mp4(2160), mp4(1440)])).toBe("https://cdn.example/1440.mp4");
  });

  it("ignores streams that aren't MP4, and reports when there is none", () => {
    const stream = { url: "https://cdn.example/a.m3u8", mimeType: "application/x-mpegURL", height: 720 };
    expect(pickMp4Url([stream])).toBeUndefined();
  });
});
