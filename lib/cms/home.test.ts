import { beforeEach, describe, expect, it, vi } from "vitest";
import { homeDefaults } from "../content/landing";
import { getDraftBySlug, getPublished, type StoredEntry } from "./entries";
import { getHomeContent } from "./home";
import { HOME_SLUG, type HomeContent, homeContentSchema } from "./model";
import { isPreviewing } from "./preview";

vi.mock("server-only", () => ({}));

vi.mock("./entries", () => ({
  createEntry: vi.fn(),
  getDraftBySlug: vi.fn(),
  getPublished: vi.fn(),
}));

vi.mock("./preview", () => ({
  isPreviewing: vi.fn(async () => false),
}));

function stored(content: HomeContent): StoredEntry<HomeContent> {
  return {
    id: "gid://shopify/Metaobject/1",
    slug: HOME_SLUG,
    status: "draft",
    updatedAt: "2026-01-01T00:00:00Z",
    draft: content,
    published: null,
  };
}

beforeEach(() => {
  vi.mocked(getPublished).mockReset();
  vi.mocked(getDraftBySlug).mockReset();
  vi.mocked(isPreviewing).mockReset().mockResolvedValue(false);
});

describe("what the homepage shows", () => {
  it("shows the shipped copy until something is published", async () => {
    vi.mocked(getPublished).mockResolvedValue(undefined);

    expect(await getHomeContent()).toEqual({ content: homeDefaults, preview: false });
  });

  it("shows the live copy once it is published", async () => {
    const edited = { ...homeDefaults, heroTitle: "Live headline" };
    vi.mocked(getPublished).mockResolvedValue({ slug: HOME_SLUG, content: edited });

    expect(await getHomeContent()).toEqual({ content: edited, preview: false });
  });

  it("shows the draft to an admin previewing it, even when a live copy exists", async () => {
    const unpublished = { ...homeDefaults, heroTitle: "Draft headline" };
    vi.mocked(isPreviewing).mockResolvedValue(true);
    vi.mocked(getDraftBySlug).mockResolvedValue(stored(unpublished));
    vi.mocked(getPublished).mockResolvedValue({ slug: HOME_SLUG, content: homeDefaults });

    expect(await getHomeContent()).toEqual({ content: unpublished, preview: true });
  });
});

describe("homepage fields", () => {
  it("accepts the shipped copy, which has no video", () => {
    expect(homeContentSchema.safeParse(homeDefaults).success).toBe(true);
  });

  it("accepts a secure video address", () => {
    const result = homeContentSchema.safeParse({ ...homeDefaults, heroVideo: "https://cdn.example.com/hero.mp4" });
    expect(result.success).toBe(true);
  });

  it("refuses a video address that isn't https", () => {
    const result = homeContentSchema.safeParse({ ...homeDefaults, heroVideo: "http://cdn.example.com/hero.mp4" });
    expect(result.success).toBe(false);
  });

  it("needs a hero headline", () => {
    expect(homeContentSchema.safeParse({ ...homeDefaults, heroTitle: "   " }).success).toBe(false);
  });
});
