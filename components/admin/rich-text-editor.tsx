"use client";

import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import type { RichText } from "../../lib/cms/rich-text";
import { Button } from "../ui/button";

// Only the formatting the storefront can draw: no underline, code or rules. The server checks the
// saved JSON against the same limits, so this editor can't store anything else.
const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    link: { openOnClick: false, autolink: false, protocols: ["http", "https", "mailto"] },
  }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

function askForLink(editor: Editor): void {
  const current = editor.getAttributes("link").href;
  const href = window.prompt("Web address for this link: https://, mailto: or a path such as /shop", typeof current === "string" ? current : "https://");
  if (href === null) return;
  if (href.trim() === "") editor.chain().focus().unsetLink().run();
  else editor.chain().focus().setLink({ href: href.trim() }).run();
}

export function RichTextEditor({ name, label, initial }: { name: string; label: string; initial: RichText }) {
  // The form posts this JSON. The server validates it again before anything is saved.
  const [json, setJson] = useState(() => JSON.stringify(initial));

  const editor = useEditor({
    extensions,
    content: initial,
    immediatelyRender: false,
    editorProps: { attributes: { "aria-label": label, "aria-multiline": "true", role: "textbox" } },
    onUpdate: ({ editor: updated }) => setJson(JSON.stringify(updated.getJSON())),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      heading2: current?.isActive("heading", { level: 2 }) ?? false,
      heading3: current?.isActive("heading", { level: 3 }) ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      blockquote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
    }),
  });

  return (
    <div className="space-y-3">
      <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-2">
        <ToolButton label="Bold" pressed={active?.bold} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolButton label="Italic" pressed={active?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolButton label="Heading" pressed={active?.heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="Subheading" pressed={active?.heading3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolButton label="Bullets" pressed={active?.bulletList} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolButton label="Numbers" pressed={active?.orderedList} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolButton label="Quote" pressed={active?.blockquote} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <ToolButton label="Link" pressed={active?.link} onClick={() => editor && askForLink(editor)} />
        <ToolButton label="Table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()} />
        <ToolButton label="Undo" onClick={() => editor?.chain().focus().undo().run()} />
        <ToolButton label="Redo" onClick={() => editor?.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={editor} className="rich-text-editor" />
      <input type="hidden" name={name} value={json} />
    </div>
  );
}

function ToolButton({ label, pressed, onClick }: { label: string; pressed?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label text-label-md text-on-surface transition-colors hover:bg-surface-container-high aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
    >
      {label}
    </button>
  );
}
