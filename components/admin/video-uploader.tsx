"use client";

import { useRef, useState } from "react";
import { checkVideo, registerVideo, startVideoUpload } from "../../app/admin/content/actions";
import { MAX_VIDEO_BYTES, VIDEO_TYPES, validateVideoUpload } from "../../lib/cms/video";
import { MAX_SOURCE_BYTES, optimizeVideo } from "../../lib/cms/video-optimize";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const POLL_MS = 2000;
// About three minutes. Longer videos can be checked again from the editor.
const MAX_POLLS = 90;
const HINT = "MP4, WebM or MOV. Large videos are shrunk automatically before they upload. Keep it short so the page loads quickly.";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isSecureLink(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Gets a video into Shopify, or takes a link to one, and hands the finished address to `onReady`.
// The file goes straight from the browser to Shopify, so it never passes through this server.
// `children` sit beside the upload button, for actions that belong to the field using it.
export function VideoUploader({
  uploadLabel,
  disabled = false,
  onReady,
  children,
}: {
  uploadLabel: string;
  disabled?: boolean;
  onReady: (url: string) => void;
  children?: React.ReactNode;
}) {
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const locked = busy || disabled;

  async function upload(original: File) {
    // Size is checked after optimizing, so a big phone video is fine as long as it shrinks under the limit.
    const problem = validateVideoUpload({ mimeType: original.type, size: Math.min(original.size, MAX_VIDEO_BYTES) });
    if (problem) return setMessage(problem);
    if (original.size > MAX_SOURCE_BYTES) return setMessage("That video is over 1 GB. Trim it and try again.");

    setBusy(true);
    try {
      setMessage("Optimizing the video… 0%");
      let file = original;
      try {
        file = (await optimizeVideo(original, (done) => setMessage(`Optimizing the video… ${Math.round(done * 100)}%`))).file;
      } catch {
        // Optimizing is a bonus. Fall through and send the original if it fits.
      }
      const tooBig = validateVideoUpload({ mimeType: file.type, size: file.size });
      if (tooBig) return setMessage(tooBig);

      setMessage("Uploading the video…");
      const started = await startVideoUpload({ filename: file.name, mimeType: file.type, size: file.size });
      if (!started.ok) return setMessage(started.error);

      const body = new FormData();
      for (const { name, value } of started.target.parameters) body.append(name, value);
      body.append("file", file);
      const sent = await fetch(started.target.url, { method: "POST", body });
      if (!sent.ok) return setMessage("The upload didn't go through. Try again.");

      const registered = await registerVideo({ resourceUrl: started.target.resourceUrl, filename: file.name });
      if (!registered.ok) return setMessage(registered.error);

      setMessage("Shopify is processing the video. This can take a minute.");
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await wait(POLL_MS);
        const status = await checkVideo(registered.fileId);
        if (status.state === "ready") {
          onReady(status.url);
          return setMessage("Video ready. Save the draft or publish to keep it.");
        }
        if (status.state === "failed") return setMessage(status.message);
      }
      setMessage("Still processing. Check back in a few minutes, then upload it again if it's still missing.");
    } catch {
      setMessage("The video couldn't be uploaded. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function useLink() {
    const value = link.trim();
    if (!isSecureLink(value)) return setMessage("Use a secure link that starts with https://");
    onReady(value);
    setLink("");
    setMessage("Video link set. Save the draft or publish to keep it.");
  }

  return (
    <div className="space-y-3">
      <input
        ref={input}
        type="file"
        accept={VIDEO_TYPES.join(",")}
        aria-label="Choose a video file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = ""; // Lets the same file be chosen again after an error.
          if (file) void upload(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" disabled={locked} onClick={() => input.current?.click()}>
          {uploadLabel}
        </Button>
        {children}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-2 font-label text-label-md text-on-surface">
          Or paste a link to a video
          <Input
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://"
            disabled={locked}
          />
        </label>
        <Button variant="secondary" disabled={locked || link.trim() === ""} onClick={useLink}>
          Use link
        </Button>
      </div>

      <p role="status" className="font-body text-label-md text-on-surface-variant">
        {message || HINT}
      </p>
    </div>
  );
}
