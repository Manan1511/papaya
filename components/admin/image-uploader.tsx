"use client";

import { useRef, useState } from "react";
import { checkImage, registerImage, startImageUpload } from "../../app/admin/content/actions";
import { IMAGE_TYPES, validateImageUpload } from "../../lib/cms/image";
import type { Stack } from "../../lib/cms/model";
import { Button } from "../ui/button";
import { POLL_MS, sendToShopify, UploadProgress, wait } from "./upload";

// About a minute. Shopify usually has a picture ready in a few seconds.
const MAX_POLLS = 30;
const HINT = "JPEG, PNG or WebP, up to 20 MB. The picture is shown in its own shape, uncropped.";

// Gets a picture into Shopify and hands its address and size to `onReady`. The file goes straight from
// the browser to Shopify, so it never passes through this server.
export function ImageUploader({
  uploadLabel,
  disabled = false,
  onReady,
}: {
  uploadLabel: string;
  disabled?: boolean;
  onReady: (image: Stack["image"]) => void;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(0);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const problem = validateImageUpload({ mimeType: file.type, size: file.size });
    if (problem) return setMessage(problem);

    setBusy(true);
    try {
      setProgress(0);
      setMessage("Uploading the picture…");
      const started = await startImageUpload({ filename: file.name, mimeType: file.type, size: file.size });
      if (!started.ok) return setMessage(started.error);
      if (!(await sendToShopify(started.target, file, setProgress))) {
        return setMessage("The upload didn't go through. Try again.");
      }

      const registered = await registerImage({ resourceUrl: started.target.resourceUrl, filename: file.name });
      if (!registered.ok) return setMessage(registered.error);

      setProgress(null);
      setMessage("Shopify is processing the picture.");
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await wait(POLL_MS);
        const status = await checkImage(registered.fileId);
        if (status.state === "ready") {
          onReady(status.image);
          return setMessage("Picture added. Name it, choose its pieces, then save the draft or publish.");
        }
        if (status.state === "failed") return setMessage(status.message);
      }
      setMessage("Still processing. Try uploading it again in a few minutes.");
    } catch {
      setMessage("The picture couldn't be uploaded. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        aria-label="Choose a picture file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = ""; // Lets the same file be chosen again after an error.
          if (file) void upload(file);
        }}
      />
      <Button variant="secondary" disabled={busy || disabled} onClick={() => input.current?.click()}>
        {uploadLabel}
      </Button>
      {busy && <UploadProgress label="Picture upload progress" progress={progress} />}
      <p role="status" className="font-body text-label-md text-on-surface-variant">
        {message || HINT}
      </p>
    </div>
  );
}
