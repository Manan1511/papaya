import type { RichText } from "../../lib/cms/rich-text";
import { RichTextView } from "./rich-text";

// Layout for CMS pages: a heading, an optional introduction, then the body.
export function RichArticle({ title, intro, body }: { title: string; intro: string; body: RichText }) {
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-lg">
      <header className="space-y-4">
        <h1 className="font-headline text-headline-xl text-on-surface">{title}</h1>
        {intro && <p className="font-body text-body-lg text-on-surface-variant">{intro}</p>}
      </header>
      <div className="space-y-5">
        <RichTextView doc={body} />
      </div>
    </article>
  );
}
