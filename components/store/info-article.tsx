import type { ContentPage } from "../../lib/content/pages";

// Layout for information and legal pages. The copy comes from lib/content/pages.ts.
export function InfoArticle({ page }: { page: ContentPage }) {
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-lg">
      <header className="space-y-4">
        <h1 className="font-headline text-headline-xl text-on-surface">{page.title}</h1>
        <p className="font-body text-body-lg text-on-surface-variant">{page.intro}</p>
      </header>

      {page.sections.map((section, index) => (
        <section key={section.heading} aria-labelledby={`section-${index}`} className="space-y-3">
          <h2 id={`section-${index}`} className="font-headline text-headline-md text-on-surface">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="font-body text-body-lg text-on-surface-variant">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      {page.table && (
        <table className="w-full text-left font-body text-body-md text-on-surface">
          <caption className="mb-3 text-left font-label text-label-md text-on-surface-variant">
            {page.table.caption}
          </caption>
          <thead>
            <tr>
              {page.table.columns.map((column) => (
                <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.table.rows.map((row) => (
              <tr key={row.join("-")} className="border-b border-outline-variant/40">
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cell} scope="row" className="py-3 text-left font-label text-label-md">
                      {cell}
                    </th>
                  ) : (
                    <td key={cell} className="py-3">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
