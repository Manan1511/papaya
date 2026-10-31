import { describe, expect, it } from "vitest";
import { emptyRichText, isSafeHref, richTextSchema } from "./rich-text";

describe("isSafeHref", () => {
  it("allows https, http, mailto and paths on this site", () => {
    expect(isSafeHref("https://papaya.example/shop")).toBe(true);
    expect(isSafeHref("http://papaya.example")).toBe(true);
    expect(isSafeHref("mailto:hello@papaya.example")).toBe(true);
    expect(isSafeHref("/collections/rings")).toBe(true);
  });

  it("rejects script and data links, and protocol-relative links", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<script>")).toBe(false);
    expect(isSafeHref("//evil.example")).toBe(false);
    expect(isSafeHref("not a url")).toBe(false);
  });
});

describe("richTextSchema", () => {
  it("accepts the empty document the editor starts from", () => {
    expect(richTextSchema.parse(emptyRichText)).toEqual(emptyRichText);
  });

  it("accepts headings, lists, quotes, marks and a table", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Care" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Keep it", marks: [{ type: "bold" }] },
            { type: "hardBreak" },
            {
              type: "text",
              text: "dry",
              marks: [{ type: "link", attrs: { href: "https://papaya.example", target: "_blank" } }],
            },
          ],
        },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph" }] }] },
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Quote" }] }] },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [{ type: "tableHeader", content: [{ type: "paragraph" }] }],
            },
          ],
        },
      ],
    };
    expect(richTextSchema.safeParse(doc).success).toBe(true);
  });

  it("rejects unknown node types", () => {
    expect(richTextSchema.safeParse({ type: "doc", content: [{ type: "iframe", src: "x" }] }).success).toBe(false);
  });

  it("rejects links with unsafe protocols", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Bad", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }],
        },
      ],
    };
    expect(richTextSchema.safeParse(doc).success).toBe(false);
  });

  it("drops attributes it does not use, so stored JSON stays small and predictable", () => {
    const parsed = richTextSchema.parse({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Link",
              marks: [{ type: "link", attrs: { href: "/shop", rel: "nofollow", class: "x" } }],
            },
          ],
        },
      ],
    });
    expect(parsed.content?.[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "Link", marks: [{ type: "link", attrs: { href: "/shop" } }] }],
    });
  });
});
