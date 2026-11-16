"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { VideoUploader } from "./video-uploader";

// Sets the hero video. The address goes into the form, so the video only changes the live homepage
// once the entry is saved and published.
export function VideoField({ initial }: { initial: string }) {
  const [url, setUrl] = useState(initial);

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

      <VideoUploader uploadLabel={url ? "Replace video" : "Upload video"} onReady={setUrl}>
        {url && (
          <Button variant="outlined" onClick={() => setUrl("")}>
            Remove video
          </Button>
        )}
      </VideoUploader>
    </div>
  );
}
