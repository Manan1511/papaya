import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiaryCard } from "../../../../components/store/diary-card";
import { Chip } from "../../../../components/ui/chip";
import { Container } from "../../../../components/ui/container";
import { Grid } from "../../../../components/ui/grid";
import { diaryPosts, getDiaryPost } from "../../../../lib/content/diary";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getDiaryPost(slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function DiaryPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getDiaryPost(slug);
  if (!post) notFound();

  // Same-category posts first, then the rest.
  const related = diaryPosts
    .filter((item) => item.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 2);

  return (
    <>
      <Container className="py-lg">
        <article className="mx-auto max-w-3xl space-y-8">
          <Link href="/diary" className="link-underline font-label text-label-md text-secondary">
            Back to the diary
          </Link>
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Chip tone="secondary">{post.category}</Chip>
              <span className="font-label text-label-sm text-on-surface-variant">{post.readMinutes} min read</span>
            </div>
            <h1 className="font-headline text-headline-xl text-on-surface">{post.title}</h1>
            <p className="font-body text-body-lg text-on-surface-variant">{post.excerpt}</p>
          </header>
          <div className="space-y-5">
            {post.body.map((paragraph) => (
              <p key={paragraph} className="font-body text-body-lg text-on-surface">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </Container>

      {related.length > 0 && (
        <Container className="space-y-6 pb-section-gap">
          <h2 className="font-headline text-headline-md text-on-surface">More from the diary</h2>
          <Grid>
            {related.map((item) => (
              <div key={item.slug} className="col-span-4 md:col-span-4 lg:col-span-6">
                <DiaryCard post={item} />
              </div>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
