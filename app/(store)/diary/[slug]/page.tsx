import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiaryCard, diaryCardPost } from "../../../../components/store/diary-card";
import { PreviewBanner } from "../../../../components/store/preview-banner";
import { RichTextView } from "../../../../components/store/rich-text";
import { Chip } from "../../../../components/ui/chip";
import { Container } from "../../../../components/ui/container";
import { Grid } from "../../../../components/ui/grid";
import { getDraftBySlug, getPublished, listPublished } from "../../../../lib/cms/entries";
import { type PostContent, postKind, readingMinutes } from "../../../../lib/cms/model";
import { isPreviewing } from "../../../../lib/cms/preview";

// A signed-in admin previewing sees the draft. Everyone else gets the live copy.
async function loadPost(slug: string): Promise<{ preview: boolean; content: PostContent } | undefined> {
  if (await isPreviewing()) {
    const draft = await getDraftBySlug(postKind, slug);
    if (draft) return { preview: true, content: draft.draft };
  }
  const live = await getPublished(postKind, slug);
  return live ? { preview: false, content: live.content } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  return post ? { title: post.content.title, description: post.content.excerpt } : {};
}

export default async function DiaryPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  const { content } = post;

  // Same-category posts first, then the rest, newest first.
  const related = (await listPublished(postKind))
    .filter((item) => item.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.content.category === content.category) - Number(a.content.category === content.category) ||
        b.content.publishedOn.localeCompare(a.content.publishedOn),
    )
    .slice(0, 2);

  return (
    <>
      {post.preview && <PreviewBanner path={`/diary/${slug}`} />}
      <Container className="py-lg">
        <article className="mx-auto max-w-3xl space-y-8">
          <Link href="/diary" className="link-underline font-label text-label-md text-secondary">
            Back to the diary
          </Link>
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Chip tone="secondary">{content.category}</Chip>
              <span className="font-label text-label-sm text-on-surface-variant">
                {readingMinutes(content.body)} min read
              </span>
            </div>
            <h1 className="font-headline text-headline-xl text-on-surface">{content.title}</h1>
            <p className="font-body text-body-lg text-on-surface-variant">{content.excerpt}</p>
          </header>
          <div className="space-y-5">
            <RichTextView doc={content.body} />
          </div>
        </article>
      </Container>

      {related.length > 0 && (
        <Container className="space-y-6 pb-section-gap">
          <h2 className="font-headline text-headline-md text-on-surface">More from the diary</h2>
          <Grid>
            {related.map((item) => (
              <div key={item.slug} className="col-span-4 md:col-span-4 lg:col-span-6">
                <DiaryCard post={diaryCardPost(item.slug, item.content)} />
              </div>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
