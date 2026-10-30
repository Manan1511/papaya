---
name: Vibrant Citrus Narrative
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5b4137'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8f7065'
  outline-variant: '#e4bfb1'
  surface-tint: '#a63b00'
  primary: '#a63b00'
  on-primary: '#ffffff'
  primary-container: '#ff5f00'
  on-primary-container: '#531a00'
  inverse-primary: '#ffb599'
  secondary: '#745c00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd03d'
  on-secondary-container: '#705900'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#959393'
  on-tertiary-container: '#2c2c2c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#ffe089'
  secondary-fixed-dim: '#edc22e'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is built on a foundation of energetic optimism and high-impact visual communication. It targets a dynamic audience that values clarity, speed, and a cheerful user experience. The aesthetic merges **Modern Corporate** structure with **High-Contrast Bold** accents, utilizing whitespace to allow the updated, punchy color palette to breathe. The emotional response is one of confidence and warmth, moving away from sterile environments toward an interface that feels alive and inviting.

## Colors
The palette is centered around an intensified "Citrus Pop" orange as the primary driver for actions and highlights. This orange is highly saturated to ensure maximum visibility and energy. The secondary "Sunny Yellow" provides a bright, optimistic accompaniment; it is intentionally calibrated to be slightly less saturated than the orange to prevent visual competition and maintain a clear functional hierarchy. 

Neutrals are kept crisp and cool to provide a stable stage for the vibrant accents. Use the primary orange for high-priority CTAs and the secondary yellow for supporting information, warnings, or secondary decorative elements.

## Typography
The typography strategy pairs the friendly, rounded terminals of **Plus Jakarta Sans** for headings with the systematic precision of **Inter** for long-form text and UI labels. 

Headlines utilize heavy weights and tight letter-spacing to mirror the boldness of the color palette. Body text remains neutral and highly legible to balance the interface's high energy. Ensure that mobile headlines scale down to prevent awkward line breaks while maintaining their characteristic "punchy" weight.

## Layout & Spacing
The design system employs a **Fluid Grid** logic based on an 8px base unit. On desktop, use a 12-column layout with 24px gutters to allow for complex content density while maintaining airiness. 

- **Mobile:** 4-column grid, 16px side margins.
- **Tablet:** 8-column grid, 32px side margins.
- **Desktop:** 12-column grid, 64px side margins, max-width of 1440px.

Spacing between major sections should lean towards the `lg` and `xl` tokens to emphasize the minimalist influence and prevent the vibrant colors from feeling overwhelming.

## Elevation & Depth
This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to maintain a modern, flat-plus aesthetic. 

- **Level 0:** Base background (`#F8F9FA`).
- **Level 1:** Surface containers using pure white with a 1px border (`#E9ECEF`) to define boundaries.
- **Level 2:** Active states or floating elements use a very soft, highly diffused ambient shadow (10% opacity of the primary color) to suggest a subtle "lift" without breaking the clean profile of the UI.

Depth is primarily communicated through color intensity—more vibrant elements are perceived as "closer" to the user.

## Shapes
The shape language is **Rounded**, strike a balance between professional structure and approachable friendliness. 

- Standard components (inputs, small buttons) use 0.5rem (8px).
- Large cards and containers use 1rem (16px).
- Overlays and featured modals use 1.5rem (24px).

This consistency in radius helps soften the impact of the high-saturation colors, making the overall interface feel more ergonomic and less aggressive.

## Components
### Buttons
Primary buttons use the vivid citrus orange with white text for maximum contrast. Secondary buttons use a transparent background with an orange outline. Tertiary buttons use the sunny yellow for a softer "low-priority" action.

### Cards
Cards are white with a subtle 1px neutral border. Use a primary orange accent bar (4px) at the top or side of "Featured" cards to draw immediate attention.

### Input Fields
Inputs use the 0.5rem roundedness. The focus state replaces the neutral border with a 2px primary orange stroke and a soft yellow outer glow to provide clear interactive feedback.

### Chips & Tags
Chips use the sunny yellow with a darker amber-toned text to ensure readability. This distinguishes metadata from primary actions (orange).

### Lists
List items are separated by subtle 1px dividers. Interactive list items should utilize a soft yellow background hover state to guide the eye.