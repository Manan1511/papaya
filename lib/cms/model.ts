import { z } from "zod";
import { type RichText, richTextSchema } from "./rich-text";

export const diaryCategories = ["Travel", "Style", "Lifestyle"] as const;

// Lowercase words joined by single hyphens. It becomes the page address, so it's kept strict.
export const slugSchema = z
  .string()
  .trim()
  .min(1, "Add a web address")
  .max(100, "Keep the web address under 100 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

export const pageContentSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(120),
  intro: z.string().trim().max(400),
  body: richTextSchema,
});

export const postContentSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(120),
  category: z.enum(diaryCategories),
  excerpt: z.string().trim().max(300),
  featured: z.boolean(),
  publishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date"),
  body: richTextSchema,
});

export type PageContent = z.infer<typeof pageContentSchema>;
export type PostContent = z.infer<typeof postContentSchema>;
export type DiaryCategory = (typeof diaryCategories)[number];

// One CMS content type: its metaobject name, its Shopify type (the "$app:" prefix resolves to this
// app's own namespace), and the schema every stored draft and live copy must pass.
export type Kind<T> = { name: string; type: string; schema: z.ZodType<T> };

export const pageKind: Kind<PageContent> = {
  name: "cms_page",
  type: "$app:cms_page",
  schema: pageContentSchema,
};

export const postKind: Kind<PostContent> = {
  name: "diary_post",
  type: "$app:diary_post",
  schema: postContentSchema,
};

// Roughly 200 words a minute, counted from the text in the body.
export function readingMinutes(body: RichText): number {
  const words = collectText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function collectText(node: unknown): string {
  if (typeof node !== "object" || node === null) return "";
  const record = node as { text?: unknown; content?: unknown };
  const own = typeof record.text === "string" ? record.text : "";
  const children = Array.isArray(record.content) ? record.content.map(collectText).join(" ") : "";
  return `${own} ${children}`;
}
