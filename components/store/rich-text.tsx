import { Fragment, type ReactNode } from "react";
import {
  type Block,
  type Inline,
  isSafeHref,
  type ListItem,
  type Mark,
  type RichText,
  type TableCell,
  type TableRow,
} from "../../lib/cms/rich-text";

// Draws validated CMS content as React elements. Nothing is set as raw HTML, so React escapes the
// text, and a link renders only if it passes the same check the schema applies.
export function RichTextView({ doc }: { doc: RichText }) {
  return <>{doc.content.map(renderBlock)}</>;
}

function renderBlock(block: Block, index: number): ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="font-body text-body-lg text-on-surface">
          {renderInlines(block.content)}
        </p>
      );
    case "heading":
      return block.attrs.level === 2 ? (
        <h2 key={index} className="font-headline text-headline-md text-on-surface">
          {renderInlines(block.content)}
        </h2>
      ) : (
        <h3 key={index} className="font-body text-body-lg font-bold text-on-surface">
          {renderInlines(block.content)}
        </h3>
      );
    case "bulletList":
      return (
        <ul key={index} className="list-disc space-y-2 pl-6 font-body text-body-lg text-on-surface">
          {block.content.map(renderListItem)}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          key={index}
          start={block.attrs?.start}
          className="list-decimal space-y-2 pl-6 font-body text-body-lg text-on-surface"
        >
          {block.content.map(renderListItem)}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={index}
          className="space-y-4 border-l-4 border-tertiary pl-6 font-body text-body-lg italic text-on-surface-variant"
        >
          {block.content.map(renderBlock)}
        </blockquote>
      );
    case "table":
      return (
        <div key={index} className="overflow-x-auto">
          <table className="w-full text-left font-body text-body-md text-on-surface">
            <tbody>{block.content.map(renderRow)}</tbody>
          </table>
        </div>
      );
  }
}

function renderListItem(item: ListItem, index: number): ReactNode {
  return <li key={index}>{item.content.map(renderBlock)}</li>;
}

function renderRow(row: TableRow, index: number): ReactNode {
  return (
    <tr key={index} className="border-b border-outline-variant/40">
      {row.content.map(renderCell)}
    </tr>
  );
}

function renderCell(cell: TableCell, index: number): ReactNode {
  const spans = { colSpan: cell.attrs?.colspan, rowSpan: cell.attrs?.rowspan };
  if (cell.type === "tableHeader") {
    return (
      <th key={index} scope="col" className="py-3 pr-4 font-label text-label-md" {...spans}>
        {cell.content.map(renderBlock)}
      </th>
    );
  }
  return (
    <td key={index} className="py-3 pr-4 align-top" {...spans}>
      {cell.content.map(renderBlock)}
    </td>
  );
}

function renderInlines(nodes: Inline[] | undefined): ReactNode[] {
  return (nodes ?? []).map((node, index) => (
    <Fragment key={index}>{node.type === "hardBreak" ? <br /> : applyMarks(node.text, node.marks ?? [])}</Fragment>
  ));
}

function applyMarks(text: string, marks: Mark[]): ReactNode {
  return marks.reduce<ReactNode>((content, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{content}</strong>;
      case "italic":
        return <em>{content}</em>;
      case "link": {
        const { href, target } = mark.attrs;
        if (!isSafeHref(href)) return content;
        return (
          <a
            href={href}
            target={target ?? undefined}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            className="link-underline text-primary"
          >
            {content}
          </a>
        );
      }
    }
  }, text);
}
