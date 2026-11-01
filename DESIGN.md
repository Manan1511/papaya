---
name: Papaya Retro Beach Club
description: A striped, sunny beach-club storefront: cream sand ground, chili maroon and sky stripes, navy lines and text.
colors:
  primary: "#7a111d"
  primary-container: "#f08a1a"
  on-primary: "#ffffff"
  on-primary-container: "#3d1f00"
  primary-fixed: "#fbd9ae"
  primary-fixed-dim: "#f5b76a"
  on-primary-fixed: "#2b1400"
  on-primary-fixed-variant: "#5a0b15"
  surface-tint: "#7a111d"
  secondary: "#04204a"
  secondary-container: "#9bc8e7"
  on-secondary: "#ffffff"
  on-secondary-container: "#04204a"
  secondary-fixed: "#d6e9f7"
  secondary-fixed-dim: "#9bc8e7"
  on-secondary-fixed: "#04204a"
  on-secondary-fixed-variant: "#1d3c66"
  tertiary: "#04204a"
  tertiary-container: "#1d3c66"
  on-tertiary: "#ffffff"
  on-tertiary-container: "#f1e6d7"
  tertiary-fixed: "#f1e6d7"
  tertiary-fixed-dim: "#e4d2b8"
  on-tertiary-fixed: "#04204a"
  on-tertiary-fixed-variant: "#1d3c66"
  surface: "#fdf1e0"
  surface-bright: "#fdf1e0"
  background: "#fdf1e0"
  surface-dim: "#eadbc3"
  surface-container-lowest: "#fffbf4"
  surface-container-low: "#fcebcf"
  surface-container: "#f6e1c4"
  surface-container-high: "#f1d9b8"
  surface-container-highest: "#ead0aa"
  surface-variant: "#ead0aa"
  on-surface: "#04204a"
  on-background: "#04204a"
  on-surface-variant: "#3e4a66"
  outline: "#5d6b86"
  outline-variant: "#e0cdb0"
  inverse-surface: "#04204a"
  inverse-on-surface: "#fdf1e0"
  error: "#b3261e"
  error-container: "#f9dedc"
  on-error: "#ffffff"
  on-error-container: "#410e0b"
typography:
  headline-xl:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 48px
    fontWeight: 800
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  body-lg:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  label-md:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 16px
    letterSpacing: 0.05em
  icon:
    fontFamily: "Material Symbols Outlined"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section-gap: 80px
  gutter: 20px
  margin-mobile: 16px
  margin-tablet: 32px
  margin-desktop: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.DEFAULT}"
    height: 56px
    padding: 0 32px
  button-primary-hover:
    backgroundColor: "{colors.on-primary-fixed-variant}"
    textColor: "{colors.on-primary}"
  button-outlined:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.DEFAULT}"
    height: 44px
    padding: 0 24px
  card:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
---

# Design System: Papaya Retro Beach Club

## Overview

**Creative North Star: "The Beach Club Cabana"**

The storefront reads like a striped beach cabana: a warm cream sand ground, chili maroon and sky blue stripes, and navy for text and lines. The jewellery is the bright accent, so the page keeps its colour in fields and bands rather than in decoration on top of the product.

The system is flat by default. Depth comes from tonal surfaces and a single soft maroon shadow on the primary action. Stripes frame a page edge or a hero field; they never sit behind body text. Motion is limited to one slow drift of the hero stripes, which reduced-motion settings stop.

This system replaces the Citrus + Azure guide. The orange gradient hero, the checker band, and the cool grey surfaces are retired.

**Key Characteristics:**
- Cream ground, not white or cool grey.
- Chili maroon for actions and headings; navy for text and every line.
- Stripes as fields and bands at page edges.
- Uppercase, heavy primary buttons; sentence-case secondary text.
- Pill-shaped header tools on a sand pill.

## Colors

A committed palette: cream carries most of the page, maroon carries actions, sky and navy carry the stripes and lines, and sun orange is used sparingly.

### Primary
- **Chili Maroon** (#7a111d): primary buttons, section headings, active outlines. The only colour for primary action.
- **Deep Maroon** (#5a0b15): the hover state of primary buttons.
- **Sun Orange** (#f08a1a): badges and the best-seller tile. Dark brown text sits on it (#3d1f00).

### Secondary
- **Marine Navy** (#04204a): body and headline text, borders, the navy stripe band, and the card's hard edge.
- **Sky Blue** (#9bc8e7): the stripe field and the light panel fills. Text on sky uses navy.
- **Sky Tint** (#d6e9f7): the light sky tile behind editorial blocks.

### Neutral
- **Cream Ground** (#fdf1e0): the page background and surfaces that sit on it.
- **Card White** (#fffbf4): cards, inputs, and the lightest surfaces.
- **Sand** (#f1e6d7 and #f6e1c4): the header pill, the footer, and hairlines (#e0cdb0).
- **Muted Navy** (#3e4a66): secondary text on cream; it keeps body text above 4.5:1.

### Named Rules
**The Stripe Edge Rule.** Stripes frame a page edge or fill a hero field. They never sit behind text or form fields.

**The Navy Line Rule.** Borders and text use navy. Maroon is for fills and primary actions, never for borders.

## Typography

**Display Font:** Plus Jakarta Sans (with sans-serif fallback)
**Body Font:** Be Vietnam Pro (with sans-serif fallback)
**Icon Font:** Material Symbols Outlined, a self-hosted subset built by `npm run icons`. It draws icons only and never sets text. Icons are outlined by default; pass `filled` to `Icon` for emphasis.

**Character:** Heavy geometric headlines in navy that carry the sunny voice, set against a clean, regular body face.

### Hierarchy
- **Display** (800, 48px / 56px, tracking -0.02em): hero headline only.
- **Headline** (700, 32px / 40px): section titles such as "Latest additions".
- **Title** (700, 24px / 32px): card and tile titles.
- **Body** (400, 18px / 28px for lead text, 16px / 24px for body): paragraphs, capped near 70ch.
- **Label** (600, 14px, tracking +0.02em; primary buttons 700 uppercase): buttons, navigation, tags.

### Named Rules
**The Heavy Headline Rule.** Headlines carry the weight, not colour. Emphasis within a headline comes from size, not a second colour.

## Layout

Mobile uses a 4-column grid with 16px margins. Tablet uses 8 columns with 32px margins. Desktop uses 12 columns with 40px margins, capped at 1280px. Sections are separated by 80px. The hero fills at least 34rem and keeps its headline column at most 36rem wide, so the headline stays on the cream wave.

## Elevation & Depth

Surfaces are flat. Depth comes from tonal change between cream, card white, and sand. The primary button carries one soft maroon shadow; nothing else casts a shadow at rest.

### Shadow Vocabulary
- **CTA** (`box-shadow: 0 8px 20px -4px rgba(122, 17, 29, 0.35)`): the primary button only.
- **Hard Tertiary** (`box-shadow: 4px 4px 0px 0px #7a111d`): hover on outlined actions. Use sparingly.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow appears only as a response to a primary action or hover.

## Shapes

Buttons and inputs use an 8px radius. Cards and panels use 16px. Pills are fully rounded. The hero's cream wave is a single authored path, not a clip-path polygon.

## Components

### Buttons
- **Shape:** 8px radius (`rounded.DEFAULT`).
- **Primary:** chili maroon fill, white text, 56px high, 32px side padding. The large size is uppercase with a bold 16px label.
- **Hover / Focus:** primary hover deepens to #5a0b15 and lifts 2px. Focus shows a 2px navy outline offset 2px.
- **Outlined:** card-white fill, 2px maroon border, maroon text, 44px high. Hover fills with the primary-fixed tint.

### Cards / Containers
- **Corner Style:** 16px radius for tiles and panels.
- **Background:** card white on cream; sky tint or sun orange for editorial tiles.
- **Shadow Strategy:** flat. See Elevation & Depth.
- **Border:** 1.5px navy on editorial tiles.
- **Internal Padding:** 24px.

### Inputs / Fields
- **Style:** card white fill, 1px navy stroke, 8px radius.
- **Focus:** 2px navy outline.
- **Disabled:** 50% opacity, pointer events off.

### Navigation
- **Style:** a sticky cream bar with a navy wordmark row and a sand pill for search, account, and bag. The menu icon is maroon.
- **Links:** navy text; hover changes to maroon; the underline draws from the left.
- **Mobile:** the same pill with the menu icon opening a drawer.

### Stripe Field and Bands
- **Hero field:** chili and sky vertical stripes, 40px each, drifting slowly over 24s. Reduced motion holds still.
- **Band:** navy and cream stripes, 14px each, closing the hero and opening the footer.

## Do's and Don'ts

### Do:
- **Do** keep primary actions in chili maroon with white uppercase text.
- **Do** set body text in navy or muted navy on cream and card white.
- **Do** use the stripe field only at a hero or section edge.

### Don't:
- **Don't** put stripes, dots, or checkers behind body text or form fields.
- **Don't** use the Citrus orange gradient hero or the checker band; both are retired.
- **Don't** use blur or glass as decoration.
- **Don't** introduce cool grey surfaces; the ground is cream.
