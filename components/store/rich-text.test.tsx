import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RichText } from "../../lib/cms/rich-text";
import { RichTextView } from "./rich-text";

function render(doc: RichText): string {
  return renderToStaticMarkup(<RichTextView doc={doc} />);
}

describe("RichTextView", () => {
  it("escapes text instead of rendering it as markup", () => {
    const html = render({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "<script>alert(1)</script>" }] }],
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("drops a link whose address is not safe, but keeps its text", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Click here",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    });

    expect(html).not.toContain("href");
    expect(html).toContain("Click here");
  });

  it("renders headings, marks, lists and tables", () => {
    const html = render({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Care" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Keep it", marks: [{ type: "bold" }] },
            { type: "text", text: " dry", marks: [{ type: "italic" }] },
          ],
        },
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Soap" }] }] }],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableHeader", attrs: { colspan: 1 }, content: [{ type: "paragraph", content: [{ type: "text", text: "Size" }] }] },
              ],
            },
          ],
        },
      ],
    });

    expect(html).toContain("<h2");
    expect(html).toContain("<strong>Keep it</strong>");
    expect(html).toContain("<em> dry</em>");
    expect(html).toContain("<ul");
    expect(html).toContain("<li><p");
    expect(html).toContain('<th scope="col"');
  });

  it("renders a safe link with its target", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Shop",
              marks: [{ type: "link", attrs: { href: "https://papaya.example", target: "_blank" } }],
            },
          ],
        },
      ],
    });

    expect(html).toContain('href="https://papaya.example"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
