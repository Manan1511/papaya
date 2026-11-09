import "server-only";
import { homeDefaults } from "../content/landing";
import { createEntry, getDraftBySlug, getPublished, type StoredEntry } from "./entries";
import { HOME_SLUG, type HomeContent, homeKind } from "./model";
import { isPreviewing } from "./preview";

// What the storefront shows on the homepage: the draft while an admin previews it, otherwise the
// live copy, otherwise the copy that shipped in the code. `preview` tells the page to show the banner.
export async function getHomeContent(): Promise<{ content: HomeContent; preview: boolean }> {
  if (await isPreviewing()) {
    const draft = await getDraftBySlug(homeKind, HOME_SLUG);
    if (draft) return { content: draft.draft, preview: true };
  }

  const live = await getPublished(homeKind, HOME_SLUG);
  return { content: live?.content ?? homeDefaults, preview: false };
}

// The editor works on one entry. The first visit creates it from the shipped copy, so the site
// doesn't change until someone publishes.
export async function ensureHomeEntry(): Promise<StoredEntry<HomeContent>> {
  const existing = await getDraftBySlug(homeKind, HOME_SLUG);
  if (existing) return existing;

  await createEntry(homeKind, { slug: HOME_SLUG, content: homeDefaults });
  const created = await getDraftBySlug(homeKind, HOME_SLUG);
  if (!created) throw new Error("The homepage entry couldn't be created");
  return created;
}
