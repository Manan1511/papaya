// What the video and picture uploaders share. Browser-only.

export const POLL_MS = 2000;

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Posts the file to Shopify's upload address. fetch can't report how much has gone up, so this uses a
// request that can. Resolves true when Shopify accepted the file.
export function sendToShopify(
  target: { url: string; parameters: { name: string; value: string }[] },
  file: File,
  onProgress: (fraction: number) => void,
): Promise<boolean> {
  const body = new FormData();
  for (const { name, value } of target.parameters) body.append(name, value);
  body.append("file", file);

  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", target.url);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => resolve(request.status >= 200 && request.status < 300);
    request.onerror = () => resolve(false);
    request.send(body);
  });
}

// `progress` runs from 0 to 1, or is null when the step can't be measured (Shopify processing).
export function UploadProgress({ label, progress }: { label: string; progress: number | null }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress === null ? undefined : Math.round(progress * 100)}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
    >
      <div
        className={`h-full rounded-full bg-primary ${progress === null ? "w-full animate-pulse" : "transition-[width] duration-200"}`}
        style={progress === null ? undefined : { width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
