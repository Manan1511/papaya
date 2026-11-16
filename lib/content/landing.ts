import type { HomeContent } from "../cms/model";

// The homepage copy as it shipped. It is what the storefront shows until the homepage is published
// in the admin, and the starting point the editor creates from.
export const homeDefaults: HomeContent = {
  heroVideo: "",
  heroTitle: "Endless Summer State of Mind",
  // The non-breaking hyphen keeps "sun-seekers" on one line when the pill wraps.
  heroBody: "Curated essentials for the sun‑seekers. Crafted for golden hours.",
  collectionsTitle: "Shop by collection",
  collectionsBody: "Pick a collection and find your next favourite piece.",
  reelsTitle: "Summer on reel",
  reelsBody: "Short clips from the shop and the shore.",
  reelsPlaceholders: true,
  reels: [],
  amalfiTitle: "The Amalfi Edit",
  amalfiBody: "Bold pieces designed for long lunches and late nights on the coast.",
  makingTitle: "How we make",
  makingBody: "Read how each piece is designed, finished and packed.",
};
