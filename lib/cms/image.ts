// Picture rules shared by the admin uploader in the browser and its server actions. This file imports
// nothing server-only.

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// Shopify's own limit for a picture.
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

// The reason a file can't be used, or null when it can.
export function validateImageUpload(file: { mimeType: string; size: number }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.mimeType)) return "Choose a JPEG, PNG or WebP picture.";
  if (!(file.size > 0)) return "That file is empty.";
  if (file.size > MAX_IMAGE_BYTES) return "Pictures can be up to 20 MB. Choose a smaller one.";
  return null;
}
