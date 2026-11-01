import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewBanner } from "../../../../components/store/preview-banner";
import { RichArticle } from "../../../../components/store/rich-article";
import { Container } from "../../../../components/ui/container";
import { getDraftBySlug, getPublished } from "../../../../lib/cms/entries";
import { type PageContent, pageKind } from "../../../../lib/cms/model";
import { isPreviewing } from "../../../../lib/cms/preview";

// A signed-in admin previewing sees the draft. Everyone else gets the live copy.
async function loadPage(slug: string): Promise<{ preview: boolean; content: PageContent } | undefined> {
  if (await isPreviewing()) {
    const draft = await getDraftBySlug(pageKind, slug);
    if (draft) return { preview: true, content: draft.draft };
  }
  const live = await getPublished(pageKind, slug);
  return live ? { preview: false, content: live.content } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  return page ? { title: page.content.title, description: page.content.intro } : {};
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  return (
    <>
      {page.preview && <PreviewBanner path={`/pages/${slug}`} />}
      <Container>
        <RichArticle title={page.content.title} intro={page.content.intro} body={page.content.body} />
      </Container>
    </>
  );
}
