import type { z } from "zod";
import { type RichText, richTextSchema } from "../../lib/cms/rich-text";

// Missing fields read as empty. The schemas decide whether empty is allowed.
export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// The editor posts its document as JSON. Parse it, then check it against the schema.
export function readBody(formData: FormData): { ok: true; body: RichText } | { ok: false; error: string } {
  try {
    const parsed = richTextSchema.safeParse(JSON.parse(readText(formData, "body")));
    if (parsed.success) return { ok: true, body: parsed.data };
    return { ok: false, error: parsed.error.issues[0]?.message ?? "The text couldn't be read." };
  } catch {
    return { ok: false, error: "The text couldn't be read. Try saving again." };
  }
}

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
