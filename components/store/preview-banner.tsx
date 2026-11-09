import { exitPreview } from "./preview-actions";

// Shown only to an admin who is previewing, so draft copy never passes for the live page.
export function PreviewBanner({ path }: { path: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary-fixed px-4 py-3 md:px-8">
      <p className="font-label text-label-md text-on-tertiary-fixed-variant">
        You are previewing a draft. Visitors still see the live version.
      </p>
      <form action={exitPreview}>
        <input type="hidden" name="path" value={path} />
        <button type="submit" className="link-underline font-label text-label-md text-on-tertiary-fixed-variant">
          Exit preview
        </button>
      </form>
    </div>
  );
}
