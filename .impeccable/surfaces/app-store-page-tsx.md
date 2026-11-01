---
version: 1
slug: "app-store-page-tsx"
primary_target: "app/(store)/page.tsx"
related_targets: ["components/store/site-header.tsx","components/store/site-footer.tsx"]
---

# Storefront restyle: retro beach-club system

Scope: the whole storefront (homepage, shop, collections, product pages, cart, account, info pages, policies). Shopify's hosted checkout keeps Shopify's own look. /admin inherits the tokens and gets no separate design.

Mode: Persuade for the homepage and listing pages; Operate for cart and account; Read for info pages and policies.

Audience and job: style-led shoppers in India (PRODUCT.md). They find a piece and buy it. The primary action is "Shop the collection" from the hero, then add to bag from product cards.

Proof and content: real copy from `lib/content/landing.ts` and the CMS. Products are placeholders. No invented claims.

Constraints: copy, content, and behaviour stay as they are. Text contrast meets WCAG AA on the cream ground. Motion respects reduced-motion. The direction was pinned by the user's two reference screenshots, so there was no concept roll.

Memorable moment: a sweeping cream wave over maroon and sky stripes, closed by a navy and cream stripe band.

Unresolved: the exact desktop hero scale; the palette values were sampled from the screenshots and may need a nudge.

## Direction contract

THESIS: A seaside beach-club storefront. Stripes and cream carry the brand, and the jewellery is the bright accent. It refuses the default catalogue grid under a gradient hero.

OWN-WORLD: cream ground #FDF1E0; chili maroon #7A111D for headings, buttons, and dots; sky #9BC8E7 for stripes and light panels; navy #04204A for text, lines, and hard shadows; sun orange #F08A1A for the sun and badges; sand #F1E6D7 for pills and hairlines. Components: maroon and sky stripe fields; navy and cream stripe bands; a sweeping cream wave panel in the hero; a sand pill header; uppercase maroon CTAs with a soft maroon shadow; navy hard-shadow cards.

STORY: The visitor sees a sunny, playful shop at a glance, believes the jewellery is for everyday self-expression, and clicks "Shop the collection".

FIRST VIEWPORT: on a 390px phone, the header has the logo at left and a sand pill of search, account, and bag icons with a maroon menu icon at right. Below it, a maroon and sky stripe field fills the hero. A cream wave crosses from the upper left to the lower right and holds the navy headline "Endless Summer State of Mind" in three lines, a light pill with the body copy, and the maroon uppercase "SHOP THE COLLECTION" button. A navy and cream stripe band closes the hero. Desktop keeps the same composition with the headline at left.

FORM: code-led, since image generation is unavailable. The form is the user's two pinned screenshots, with no ordered list. Signature motion: the stripe field drifts slowly; reduced motion holds it still. seed: none (pinned by brief).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
