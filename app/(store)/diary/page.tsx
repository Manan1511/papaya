import Link from "next/link";
import { DiaryCard, diaryCardPost } from "../../../components/store/diary-card";
import { Container } from "../../../components/ui/container";
import { Grid } from "../../../components/ui/grid";
import { listPublished } from "../../../lib/cms/entries";
import { diaryCategories, postKind } from "../../../lib/cms/model";
import { firstParam } from "../../../lib/params";

export const metadata = { title: "Diary" };

function filterLink(label: string, href: string, current: boolean) {
  return (
    <Link
      key={label}
      href={href}
      aria-current={current ? "page" : undefined}
      className={`rounded-full px-4 py-2 font-label text-label-md transition-colors ${
        current
          ? "bg-primary text-on-primary"
          : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requested = firstParam((await searchParams).category);
  const active = diaryCategories.find((category) => category === requested);

  // Featured posts lead, then the newest.
  const posts = (await listPublished(postKind))
    .filter((post) => !active || post.content.category === active)
    .sort(
      (a, b) =>
        Number(b.content.featured) - Number(a.content.featured) ||
        b.content.publishedOn.localeCompare(a.content.publishedOn),
    )
    .map((post) => diaryCardPost(post.slug, post.content));
  const [featured, ...rest] = posts;

  return (
    <Container className="space-y-lg py-lg">
      <header className="space-y-4 text-center">
        <h1 className="font-headline text-headline-xl text-primary">The Beach Club Diary</h1>
        <p className="mx-auto max-w-2xl font-body text-body-lg text-on-surface-variant">
          Sun-drenched styling tips, travel guides, and the vibrant life.
        </p>
      </header>

      <nav aria-label="Diary categories" className="flex flex-wrap justify-center gap-2">
        {filterLink("All", "/diary", !active)}
        {diaryCategories.map((category) => filterLink(category, `/diary?category=${category}`, active === category))}
      </nav>

      {posts.length === 0 ? (
        <p className="text-center font-body text-body-lg text-on-surface-variant">No posts in this category yet.</p>
      ) : (
        <Grid>
          {featured && (
            <div className="col-span-4 md:col-span-8 lg:col-span-6">
              <DiaryCard post={featured} large />
            </div>
          )}
          {rest.map((post) => (
            <div key={post.slug} className="col-span-4 md:col-span-4 lg:col-span-3">
              <DiaryCard post={post} />
            </div>
          ))}
        </Grid>
      )}
    </Container>
  );
}
