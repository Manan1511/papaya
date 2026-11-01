import Link from "next/link";
import { type PostContent, readingMinutes } from "../../lib/cms/model";
import { Chip } from "../ui/chip";
import { Icon } from "../ui/icon";

export type DiaryCardPost = {
  slug: string;
  title: string;
  category: PostContent["category"];
  excerpt: string;
  readMinutes: number;
};

// A card needs only the parts of a post that show in a grid.
export function diaryCardPost(slug: string, content: PostContent): DiaryCardPost {
  return {
    slug,
    title: content.title,
    category: content.category,
    excerpt: content.excerpt,
    readMinutes: readingMinutes(content.body),
  };
}

export function DiaryCard({ post, large = false }: { post: DiaryCardPost; large?: boolean }) {
  return (
    <Link
      href={`/diary/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest transition-[transform,box-shadow] duration-300 ease-emphasized motion-safe:hover:-translate-y-1 hover:shadow-ambient-primary"
    >
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary-container via-tertiary-fixed to-secondary-fixed ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}
      >
        <Icon
          name="wb_sunny"
          className="text-[48px] text-on-primary-container opacity-70 transition-transform duration-500 ease-emphasized motion-safe:group-hover:rotate-45"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Chip tone="secondary">{post.category}</Chip>
          <span className="font-label text-label-sm text-on-surface-variant">{post.readMinutes} min read</span>
        </div>
        <h3
          className={`font-headline text-on-surface transition-colors duration-200 group-hover:text-primary ${large ? "text-headline-lg" : "text-headline-md"}`}
        >
          {post.title}
        </h3>
        <p className="font-body text-body-md text-on-surface-variant">{post.excerpt}</p>
      </div>
    </Link>
  );
}
