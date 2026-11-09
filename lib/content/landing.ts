import type { HomeContent } from "../cms/model";

// The homepage copy as it shipped. It is what the storefront shows until the homepage is published
// in the admin, and the starting point the editor creates from.
export const homeDefaults: HomeContent = {
  heroVideo: "",
  heroTitle: "Endless Summer State of Mind",
  // The non-breaking hyphen keeps "sun-seekers" on one line when the pill wraps.
  heroBody: "Curated essentials for the sun‑seekers. Crafted for golden hours.",
  latestTitle: "Latest additions",
  latestBody: "Fresh from the studio, designed to catch the coastal light.",
  amalfiTitle: "The Amalfi Edit",
  amalfiBody: "Bold pieces designed for long lunches and late nights on the coast.",
  makingTitle: "How we make",
  makingBody: "Read how each piece is designed, finished and packed.",
};
