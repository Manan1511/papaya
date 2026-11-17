// Shrinks a video in the browser before it is uploaded: 720 lines on the short side, H.264 in an MP4,
// no sound (the storefront plays every video muted). It uses the browser's own video encoder, so the
// file never leaves the editor's machine and no server does the work. Browser-only.

const MAX_SHORT_SIDE = 720;
// A file this small and this sharp is already light, so it goes up as it is.
const LIGHT_ENOUGH_BYTES = 6 * 1024 * 1024;

export type Optimized = { file: File; changed: boolean };

// Returns the original file when it is already light, or when this browser can't re-encode (the caller
// then applies the plain size limit). Throws only if a started conversion fails.
export async function optimizeVideo(file: File, onProgress: (fraction: number) => void): Promise<Optimized> {
  if (typeof VideoEncoder === "undefined") return { file, changed: false };

  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, QUALITY_MEDIUM, canEncodeVideo } =
    await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await canEncodeVideo("avc"))) return { file, changed: false };

    const shortSide = Math.min(track.displayWidth, track.displayHeight);
    const isMp4 = file.type === "video/mp4";
    if (isMp4 && shortSide <= MAX_SHORT_SIDE && file.size <= LIGHT_ENOUGH_BYTES) return { file, changed: false };

    // Set only the short side; the other follows the aspect ratio. Sizes must be even for H.264.
    const scale = Math.min(1, MAX_SHORT_SIDE / shortSide);
    const even = (value: number) => Math.max(2, Math.round((value * scale) / 2) * 2);
    const size =
      track.displayWidth <= track.displayHeight
        ? { width: even(track.displayWidth) }
        : { height: even(track.displayHeight) };

    const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
    const conversion = await Conversion.init({
      input,
      output,
      video: { ...size, codec: "avc", quality: QUALITY_MEDIUM, frameRate: 30 },
      audio: { discard: true },
    });
    if (!conversion.isValid) return { file, changed: false };

    conversion.onProgress = onProgress;
    await conversion.execute();

    const buffer = (output.target as InstanceType<typeof BufferTarget>).buffer;
    if (!buffer || buffer.byteLength >= file.size) return { file, changed: false };
    const name = file.name.replace(/\.[^.]+$/, "") || "video";
    return { file: new File([buffer], `${name}.mp4`, { type: "video/mp4" }), changed: true };
  } finally {
    input.dispose?.();
  }
}

// What a source file may weigh before optimizing. The result still has to fit MAX_VIDEO_BYTES.
export const MAX_SOURCE_BYTES = 1024 * 1024 * 1024;