"use client";

import { useRef, useState } from "react";
import { checkVideo, registerVideo, startVideoUpload } from "../../app/admin/content/actions";
import { VIDEO_TYPES, validateVideoUpload } from "../../lib/cms/video";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const POLL_MS = 2000;
// About three minutes. Longer videos can be checked again from the editor.
const MAX_POLLS = 90;
const HINT = "MP4, WebM or MOV, up to 50 MB. Keep it short so the page loads quickly.";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isSecureLink(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Sets the hero video. The address goes into the form, so the video only changes the live homepage
// once the entry is saved and published.
export function VideoField({ initial }: { initial: string }) {
  const [url, setUrl] = useState(initial);
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const problem = validateVideoUpload({ mimeType: file.type, size: file.size });
    if (problem) return setMessage(problem);

    setBusy(true);
    setMessage("Uploading the video…");
    try {
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
          setUrl(status.url);
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
    setUrl(value);
    setLink("");
    setMessage("Video link set. Save the draft or publish to keep it.");
  }

  return (
    <div className="space-y-3">
      <p className="font-label text-label-md text-on-surface">Hero video</p>
      {url ? (
        <video
          src={url}
          controls
          muted
          playsInline
          preload="metadata"
          className="aspect-video w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest"
        />
      ) : (
        <p className="font-body text-label-md text-on-surface-variant">
          No video. The hero shows the stripes and the wave only.
        </p>
      )}
      <input type="hidden" name="heroVideo" value={url} />

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
        <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
          {url ? "Replace video" : "Upload video"}
        </Button>
        {url && (
          <Button
            variant="outlined"
            disabled={busy}
            onClick={() => {
              setUrl("");
              setMessage("Video removed. Save to apply it.");
            }}
          >
            Remove video
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-2 font-label text-label-md text-on-surface">
          Or paste a link to a video
          <Input
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://"
            disabled={busy}
          />
        </label>
        <Button variant="secondary" disabled={busy || link.trim() === ""} onClick={useLink}>
          Use link
        </Button>
      </div>

      <p role="status" className="font-body text-label-md text-on-surface-variant">
        {message || HINT}
      </p>
    </div>
  );
}
