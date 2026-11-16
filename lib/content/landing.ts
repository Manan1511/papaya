import type { HomeContent } from "../cms/model";

// The homepage copy as it shipped. It is what the storefront shows until the homepage is published
// in the admin, and the starting point the editor creates from.
export const homeDefaults: HomeContent = {
  heroVideo: "",
  heroTitle: "A little different. A lot more you.",
  heroBody:
    "Jewellery with personality, crafted with love. Discover thoughtfully handcrafted pieces, playful details and unexpected combinations designed to make every look your own.",
  collectionsTitle: "Shop by collection",
  collectionsBody: "Pick a collection and find your next favourite piece.",
  reelsTitle: "Papaya in Motion",
  reelsBody: "Behind the pieces, styling ideas, new drops and more.",
  reelsPlaceholders: true,
  reels: [],
  amalfiTitle: "The Amalfi Edit",
  amalfiBody: "Bold pieces designed for long lunches and late nights on the coast.",
  makingTitle: "How we make",
  makingBody: "Read how each piece is designed, finished and packed.",
};
