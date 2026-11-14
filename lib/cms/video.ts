// Video rules shared by the admin uploader in the browser and its server actions, so both refuse the
// same files. This file imports nothing server-only.

export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

// A hero loop should stay small. The limit is ours; Shopify accepts larger files.
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

// The reason a file can't be used, or null when it can.
export function validateVideoUpload(file: { mimeType: string; size: number }): string | null {
  if (!(VIDEO_TYPES as readonly string[]).includes(file.mimeType)) return "Choose an MP4, WebM or MOV video.";
  if (!(file.size > 0)) return "That file is empty.";
  if (file.size > MAX_VIDEO_BYTES) return "Videos can be up to 50 MB. Shorten or compress the video and try again.";
  return null;
}

export type VideoSource = { url: string; mimeType: string; height: number | null };

// The hero card is about 500 pixels tall, so 720 lines is sharp enough, and the 1080 size is roughly
// three times the weight on a phone's data. Shopify makes several MP4 sizes. Use the largest one up
// to 720 lines, or the smallest one when every size is bigger. (For a phone video, "height" is the
// long side, so 720 lines means 404 pixels wide.)
const HERO_MAX_LINES = 720;

export function pickMp4Url(sources: readonly VideoSource[]): string | undefined {
  const mp4s = sources
    .filter((source) => source.mimeType === "video/mp4")
    .sort((a, b) => (a.height ?? 0) - (b.height ?? 0));
  if (mp4s.length === 0) return undefined;

  const fitting = mp4s.filter((source) => (source.height ?? 0) <= HERO_MAX_LINES);
  return (fitting.length > 0 ? fitting[fitting.length - 1] : mp4s[0]).url;
}
