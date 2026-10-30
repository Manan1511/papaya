"use client";

import { useRef } from "react";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { iconButtonClass } from "../ui/icon-button";
import { Input } from "../ui/input";

const fieldLabel = "flex flex-col gap-2 font-label text-label-md text-on-surface";
const fieldClass =
  "rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body text-body-md text-on-surface disabled:opacity-50";

// Reviews aren't open yet (Phase 7). The form shows its layout, and nothing is submitted.
export function ReviewDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button onClick={() => dialogRef.current?.showModal()}>Leave a review</Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="review-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] max-w-none rounded-xl bg-surface p-0 shadow-ambient-primary"
      >
        <form method="dialog" className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <h2 id="review-dialog-title" className="font-headline text-headline-md text-on-surface">
              Leave a review
            </h2>
            <button type="button" aria-label="Close" onClick={() => dialogRef.current?.close()} className={iconButtonClass()}>
              <Icon name="close" />
            </button>
          </div>
          <p className="font-body text-body-md text-on-surface-variant">Reviews open in a later update.</p>
          <label className={fieldLabel}>
            Rating
            <select disabled className={fieldClass} defaultValue="5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <option key={stars} value={stars}>
                  {stars} stars
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabel}>
            Name
            <Input name="name" disabled />
          </label>
          <label className={fieldLabel}>
            Title
            <Input name="title" disabled />
          </label>
          <label className={fieldLabel}>
            Review
            <textarea name="body" rows={4} disabled className={fieldClass} />
          </label>
          <Button type="submit" disabled>
            Submit review
          </Button>
        </form>
      </dialog>
    </>
  );
}
