import { z } from "zod";

// Tiptap's JSON, limited to what the editor offers. Anything else fails validation before it can
// be saved, and the renderer draws only these node types, so unexpected content never reaches a page.

export const MAX_RICH_TEXT_CHARACTERS = 200_000;

// Links must be https, http, mailto, or a path on this site. Anything else (javascript:, data:)
// is rejected, both when saving and when rendering.
export function isSafeHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

type Mark = { type: "bold" } | { type: "italic" } | { type: "link"; attrs: { href: string; target?: "_blank" | null } };

type Inline = { type: "text"; text: string; marks?: Mark[] } | { type: "hardBreak" };

type ListItem = { type: "listItem"; content: Block[] };

type TableCell = {
  type: "tableCell" | "tableHeader";
  attrs?: { colspan?: number; rowspan?: number };
  content: Block[];
};

type TableRow = { type: "tableRow"; content: TableCell[] };

export type Block =
  | { type: "paragraph"; content?: Inline[] }
  | { type: "heading"; attrs: { level: 2 | 3 }; content?: Inline[] }
  | { type: "bulletList"; content: ListItem[] }
  | { type: "orderedList"; attrs?: { start?: number }; content: ListItem[] }
  | { type: "blockquote"; content: Block[] }
  | { type: "table"; content: TableRow[] };

const safeHref = z.string().max(2048).refine(isSafeHref, "Use an https link, a mailto link or a path on this site");

const mark: z.ZodType<Mark> = z.union([
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({ href: safeHref, target: z.enum(["_blank"]).nullish() }),
  }),
]);

const inline: z.ZodType<Inline> = z.union([
  z.object({ type: z.literal("text"), text: z.string().min(1).max(5000), marks: z.array(mark).max(4).optional() }),
  z.object({ type: z.literal("hardBreak") }),
]);

const block: z.ZodType<Block> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal("paragraph"), content: z.array(inline).max(500).optional() }),
    z.object({
      type: z.literal("heading"),
      attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }),
      content: z.array(inline).max(500).optional(),
    }),
    z.object({ type: z.literal("bulletList"), content: z.array(listItem).max(200) }),
    z.object({
      type: z.literal("orderedList"),
      attrs: z.object({ start: z.number().int().min(1).max(9999).optional() }).optional(),
      content: z.array(listItem).max(200),
    }),
    z.object({ type: z.literal("blockquote"), content: z.array(block).max(200) }),
    z.object({ type: z.literal("table"), content: z.array(tableRow).max(100) }),
  ]),
);

const listItem: z.ZodType<ListItem> = z.lazy(() =>
  z.object({ type: z.literal("listItem"), content: z.array(block).max(200) }),
);

const tableCell: z.ZodType<TableCell> = z.lazy(() =>
  z.object({
    type: z.enum(["tableCell", "tableHeader"]),
    attrs: z
      .object({
        colspan: z.number().int().min(1).max(20).optional(),
        rowspan: z.number().int().min(1).max(20).optional(),
      })
      .optional(),
    content: z.array(block).max(50),
  }),
);

const tableRow: z.ZodType<TableRow> = z.lazy(() =>
  z.object({ type: z.literal("tableRow"), content: z.array(tableCell).max(50) }),
);

export const richTextSchema = z
  .object({ type: z.literal("doc"), content: z.array(block).max(500) })
  .refine((doc) => JSON.stringify(doc).length <= MAX_RICH_TEXT_CHARACTERS, "This text is too long to save");

export type RichText = z.infer<typeof richTextSchema>;

export const emptyRichText: RichText = { type: "doc", content: [{ type: "paragraph" }] };
