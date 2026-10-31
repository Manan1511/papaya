"use client";

import { Button } from "../ui/button";

// Buttons for a draft. Each one sets the "intent" field the save action reads.
export function EntryActions({
  live,
  isNew,
  pending,
  previewHref,
}: {
  live: boolean;
  isNew: boolean;
  pending: boolean;
  previewHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" name="intent" value="save" variant="secondary" disabled={pending}>
        Save draft
      </Button>
      <Button type="submit" name="intent" value="publish" disabled={pending}>
        {live ? "Publish changes" : "Publish"}
      </Button>
      {live && (
        <Button type="submit" name="intent" value="unpublish" variant="outlined" disabled={pending}>
          Unpublish
        </Button>
      )}
      {previewHref && (
        <a
          href={previewHref}
          target="_blank"
          rel="noopener"
          className="link-underline font-label text-label-md text-secondary"
        >
          Preview draft
        </a>
      )}
      {!isNew && (
        <Button
          type="submit"
          name="intent"
          value="delete"
          variant="outlined"
          disabled={pending}
          onClick={(event) => {
            if (!window.confirm("Delete this entry? This can't be undone.")) event.preventDefault();
          }}
          className="ml-auto"
        >
          Delete
        </Button>
      )}
    </div>
  );
}

export function EntryMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-error-container p-4 font-body text-body-md text-on-error-container">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className="rounded-lg bg-secondary-fixed p-4 font-body text-body-md text-on-secondary-fixed">
        {message}
      </p>
    );
  }
  return null;
}
