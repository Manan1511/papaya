"use client";

import { useState } from "react";
import { MAX_REELS } from "../../lib/cms/model";
import { Button } from "../ui/button";
import { VideoUploader } from "./video-uploader";

// The reels on the homepage, in the order they play. Each address goes into the form, so the list only
// changes the live homepage once the entry is saved and published.
export function ReelsField({ initial }: { initial: string[] }) {
  const [reels, setReels] = useState(initial);
  const full = reels.length >= MAX_REELS;

  function add(url: string) {
    setReels((current) => (current.length >= MAX_REELS || current.includes(url) ? current : [...current, url]));
  }

  return (
    <div className="space-y-3">
      <p className="font-label text-label-md text-on-surface">
        Reels ({reels.length} of {MAX_REELS})
      </p>
      {reels.length === 0 ? (
        <p className="font-body text-label-md text-on-surface-variant">No reels. The section stays hidden until you add one.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {reels.map((url, index) => (
            <li key={url} className="space-y-2">
              <input type="hidden" name="reels" value={url} />
              <video
                src={url}
                muted
                playsInline
                controls
                preload="metadata"
                className="aspect-[9/16] w-full rounded-lg border border-outline-variant bg-surface-container-lowest object-cover"
              />
              <Button
                variant="outlined"
                className="w-full"
                aria-label={`Remove reel ${index + 1}`}
                onClick={() => setReels((current) => current.filter((_, at) => at !== index))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <VideoUploader uploadLabel="Add a reel" disabled={full} onReady={add} />
      {full && <p className="font-body text-label-md text-on-surface-variant">That's the most the section holds.</p>}
    </div>
  );
}
