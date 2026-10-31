import { describe, expect, it } from "vitest";
import { type PostContent, pageContentSchema, postContentSchema, readingMinutes, slugSchema } from "./model";
import { emptyRichText, type RichText } from "./rich-text";

describe("slugSchema", () => {
  it("accepts lowercase words joined by single hyphens", () => {
    expect(slugSchema.parse("care-guide")).toBe("care-guide");
    expect(slugSchema.parse("size-guide-2")).toBe("size-guide-2");
  });

  it("rejects spaces, capitals, leading or doubled hyphens, and empty values", () => {
    expect(slugSchema.safeParse("Care Guide").success).toBe(false);
    expect(slugSchema.safeParse("-care").success).toBe(false);
    expect(slugSchema.safeParse("care--guide").success).toBe(false);
    expect(slugSchema.safeParse("   ").success).toBe(false);
  });
});

describe("content schemas", () => {
  it("requires a title on pages and posts", () => {
    expect(pageContentSchema.safeParse({ title: " ", intro: "", body: emptyRichText }).success).toBe(false);
  });

  it("only allows the diary categories", () => {
    const post: PostContent = {
      title: "Packing",
      category: "Travel",
      excerpt: "",
      featured: false,
      publishedOn: "2026-06-01",
      body: emptyRichText,
    };
    expect(postContentSchema.safeParse(post).success).toBe(true);
    expect(postContentSchema.safeParse({ ...post, category: "Food" }).success).toBe(false);
  });
});

describe("readingMinutes", () => {
  it("counts about 200 words a minute, and never returns less than one", () => {
    const words = Array.from({ length: 450 }, () => "sun").join(" ");
    const body: RichText = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: words }] }] };
    expect(readingMinutes(body)).toBe(2);
    expect(readingMinutes(emptyRichText)).toBe(1);
  });
});
