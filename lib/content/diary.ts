export const diaryCategories = ["Travel", "Style", "Lifestyle"] as const;
export type DiaryCategory = (typeof diaryCategories)[number];

export type DiaryPost = {
  slug: string;
  title: string;
  category: DiaryCategory;
  excerpt: string;
  readMinutes: number;
  featured?: boolean;
  body: string[];
};

// Draft copy. Each post is a placeholder until the article is written in the CMS (Phase 5).
export const diaryPosts: DiaryPost[] = [
  {
    slug: "best-beach-clubs-amalfi",
    title: "The Best Beach Clubs in Amalfi",
    category: "Travel",
    excerpt: "Placeholder excerpt for the featured travel story.",
    readMinutes: 6,
    featured: true,
    body: [
      "Placeholder article: the Amalfi beach clubs story.",
      "Placeholder paragraph. Replace with the finished text.",
    ],
  },
  {
    slug: "style-your-riviera-chain",
    title: "5 Ways to Style Your Riviera Chain",
    category: "Style",
    excerpt: "Placeholder excerpt for the styling guide.",
    readMinutes: 4,
    body: [
      "Placeholder article: five ways to wear the Riviera Chain.",
      "Placeholder paragraph. Replace with the finished text.",
    ],
  },
  {
    slug: "perfect-summer-spritz",
    title: "The Perfect Summer Spritz Recipe",
    category: "Lifestyle",
    excerpt: "Placeholder excerpt for the recipe post.",
    readMinutes: 3,
    body: [
      "Placeholder article: a summer spritz recipe.",
      "Placeholder paragraph. Replace with the finished text.",
    ],
  },
  {
    slug: "color-theory-azure-citrus",
    title: "Color Theory: Azure & Citrus",
    category: "Style",
    excerpt: "Placeholder excerpt for the colour post.",
    readMinutes: 5,
    body: [
      "Placeholder article: how the azure and citrus palette works together.",
      "Placeholder paragraph. Replace with the finished text.",
    ],
  },
  {
    slug: "packing-light-weekend",
    title: "Packing Light for the Weekend",
    category: "Travel",
    excerpt: "Placeholder excerpt for the packing guide.",
    readMinutes: 4,
    body: [
      "Placeholder article: packing light for a short trip.",
      "Placeholder paragraph. Replace with the finished text.",
    ],
  },
];

export function getDiaryPost(slug: string): DiaryPost | undefined {
  return diaryPosts.find((post) => post.slug === slug);
}
