# Citrus + Azure tokens

Source: shared `tailwind.config` in the Stitch screens `product`, `story`, `diary`, `reviews`, `admin`.
The `landing` screen uses the retro set (marine, piscine, melon, chili, sunny, Bricolage Grotesque). It is superseded by the Q5 decision: Citrus + Azure everywhere.

Stitch uses Material 3 role names. Brand board hexes: orange `#FF8C00`, azure `#007BFF`, yellow `#FFD700`, neutral `#1A1C1E`.
Orange is too light for text, so text uses the darker `primary` role.

## Colors

| Role | Hex | Use |
|---|---|---|
| `primary` | `#904d00` | Primary button fill, orange text/links on light, active icons |
| `primary-hover` (`surface-tint`) | `#904d00` | Button hover (Product CTA hover) |
| `primary-container` | `#ff8c00` | Accent fills: badges, Diary category pills, glow |
| `on-primary` | `#ffffff` | Text on `primary` |
| `on-primary-container` | `#623200` | Text on `primary-container` |
| `primary-fixed` / `primary-fixed-dim` | `#ffdcc3` / `#ffb77d` | Soft orange surfaces |
| `secondary` | `#0059bb` | Azure: links, outlined buttons, active nav underline, focus |
| `secondary-container` | `#0070ea` | Azure fill |
| `on-secondary` | `#ffffff` | Text on `secondary` |
| `secondary-fixed` / `secondary-fixed-dim` | `#d8e2ff` / `#adc7ff` | Azure tints: chips, avatars, glows |
| `on-secondary-fixed` | `#001a41` | Text on `secondary-fixed` |
| `tertiary` | `#705d00` | Yellow-dark text and icons |
| `tertiary-container` | `#c7a800` | Yellow fill (low-stock tint base) |
| `tertiary-fixed` / `tertiary-fixed-dim` | `#ffe16d` / `#e9c400` | Sunny yellow: Est. badge, metadata chips, timeline |
| `on-tertiary-fixed` / `on-tertiary-fixed-variant` | `#221b00` / `#544600` | Text on yellow surfaces |
| `surface` / `background` / `surface-bright` | `#f9f9fc` | Page background |
| `surface-container-lowest` | `#ffffff` | Cards, inputs |
| `surface-container-low` | `#f3f3f6` | Section bands, glass base |
| `surface-container` | `#eeeef0` | Image placeholders |
| `surface-container-high` | `#e8e8ea` | Hover fills |
| `surface-container-highest` / `surface-variant` | `#e2e2e5` | Borders, admin sidebar edge |
| `surface-dim` | `#dadadc` | Dim header fallback |
| `on-surface` / `on-background` | `#1a1c1e` | Body text |
| `on-surface-variant` | `#564334` | Secondary text |
| `outline` | `#897362` | Icon and placeholder text |
| `outline-variant` | `#ddc1ae` | Hairline borders (30% opacity in use) |
| `inverse-surface` / `inverse-on-surface` | `#2f3133` / `#f0f0f3` | Dark UI, toasts |
| `error` / `error-container` / `on-error-container` | `#ba1a1a` / `#ffdad6` / `#93000a` | Errors, out-of-stock |
| Success (admin only, inline) | `#008a00` | In-stock status |

## Typography

- Headings: **Plus Jakarta Sans** 700 / 800. Tight tracking (`-0.02em` on xl, `-0.01em` on lg).
- Body and labels: **Be Vietnam Pro** 400 / 600 / 700. Not Inter. Not Bricolage Grotesque (not loaded in Stitch, so drop it).

| Token | Size / line | Weight | Notes |
|---|---|---|---|
| `headline-xl` | 48 / 56 | 800 | Hero titles (desktop) |
| `headline-lg` | 32 / 40 | 700 | Section titles |
| `headline-lg-mobile` | 28 / 36 | 700 | Mobile titles |
| `headline-md` | 24 / 32 | 700 | Card titles, product name on mobile |
| `body-lg` | 18 / 28 | 400 | Lead paragraphs |
| `body-md` | 16 / 24 | 400 | Body |
| `label-md` | 14 / 20 | 600 | Buttons, nav, tags (`+0.02em`) |
| `label-sm` | 12 / 16 | 600–700 | Badges, eyebrow labels (`+0.05em`) |

Product and Diary used arbitrary px sizes. Normalize them to this scale.

## Shape

- `rounded` (DEFAULT) `0.5rem` (8px): inputs, small buttons
- `rounded-lg` `1rem` (16px): large cards and containers
- `rounded-xl` `1.5rem` (24px): modals, featured overlays
- `rounded-full`: pills, chips, avatars, icon FABs

Diary and Admin use a smaller scale (4 / 8 / 12px). Use the table above.

## Spacing and layout

- Base unit 4px. Tokens: xs 4, sm 8, md 16, lg 24, xl 32, xxl 48.
- Container max-width `1280px`.
- Gutter `20px`. The root `DESIGN.md` says 24px, but the screens use 20px.
- Side margins: mobile `16px`, tablet `32px`, desktop `40px`. The Stitch `DESIGN.md` says 64px for desktop. Use 40px.
- Breakpoints: Tailwind defaults. Mobile 4 columns, tablet 8, desktop 12.
- Section spacing: 48px (xxl) between sections on inner pages, and 80px (`section-gap`) on the landing.

## Effects

- **Glass card** (default): `background rgba(255,255,255,0.7)`, `backdrop-filter blur(16px)`, `border 1px rgba(255,255,255,0.4)`.
- **Glass card, azure** (Reviews): `background rgba(216,226,255,0.4)`, `blur(12px)`, `border rgba(255,255,255,0.6)`.
- **Ambient shadow, orange**: `0 10px 25px -5px rgba(255,140,0,0.15), 0 8px 10px -6px rgba(255,140,0,0.1)`. Use on hover.
- **Ambient shadow, azure**: same values with `rgba(0,89,187,…)`.
- **CTA shadow** (Product primary): `0 8px 20px -4px rgba(144,77,0,0.4)`, hover `0 12px 24px -4px rgba(144,77,0,0.5)`.
- Timeline rail: gradient `primary → secondary → tertiary`.
- Hover: `scale-105` on icon buttons, `-translate-y-1` on cards, `active:scale-95` on press.

## Buttons (from the board)

- Primary: `primary` fill, `on-primary` text.
- Secondary: light fill, `on-surface` text.
- Inverted: `inverse-surface` fill, light text.
- Outlined: transparent, `secondary` or `primary` border.

## Icons

Material Symbols Outlined. `FILL 0` for default, `FILL 1` for emphasis (timeline icons, stars, active nav).

## Contrast rule

Orange text on white: use `primary` `#904d00` only. Use `primary-container` `#ff8c00` for fills, not text.
