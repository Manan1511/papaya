import { describe, expect, it } from "vitest";
import pages from "../../docs/seed/cms-pages.json";
import posts from "../../docs/seed/cms-diary.json";
import { pageContentSchema, postContentSchema, slugSchema } from "./model";

// The seed files go straight into the CMS, so each one must pass the same schemas the editor uses.
describe("CMS seed content", () => {
  it("has valid pages, each with a unique web address", () => {
    const slugs = pages.map((page) => page.slug);
    for (const page of pages) {
      expect(slugSchema.safeParse(page.slug).success).toBe(true);
      expect(pageContentSchema.safeParse({ title: page.title, intro: page.intro, body: page.body }).success).toBe(true);
    }
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has valid diary posts, each with a unique web address", () => {
    const slugs = posts.map((post) => post.slug);
    for (const post of posts) {
      expect(slugSchema.safeParse(post.slug).success).toBe(true);
      expect(postContentSchema.safeParse(post).success).toBe(true);
    }
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
