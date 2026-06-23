<!-- SEED: tokens below are decided design targets composed pre-implementation (globals.css still holds create-next-app scaffold defaults). Implement these tokens as you build, then re-run /impeccable document in scan mode to capture the real, shipped values and components. -->
---
name: Yu-Gi-Oh! Deck Builder & Collection
description: A dark, gallery-grade browser where the card art is the star.
colors:
  void: "#0b0b0c"
  surface: "#161618"
  surface-raised: "#232325"
  border: "#333336"
  ink: "#f6f6f6"
  ink-muted: "#a6a6a6"
  ink-faint: "#868688"
  primary: "#3f5cd6"
  primary-bright: "#5b78ef"
  primary-deep: "#344aa6"
  primary-soft: "#26314f"
  starlight: "#a6d6f2"
  success: "#3cc08a"
  warning: "#e0ad3e"
  danger: "#db4a3e"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.625rem"
  chip-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  card-tile:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0"
---

# Design System: Yu-Gi-Oh! Deck Builder & Collection

## 1. Overview

**Creative North Star: "The Midnight Observatory"**

A dark, quiet room where each card is lit like an exhibit. The interface is the gallery wall and the track lighting — never the painting. Surfaces are a true, untinted near-black so the warm, saturated card art is the only real color in the room; the cobalt-indigo brand color glows in like a calibration light on an instrument panel, used sparingly to mark what's live, selected, or actionable. The mood borrows from museum/gallery sites and premium dark product UI (Linear, Vercel, MUBI): confident, precise, unhurried. A collector should feel they've walked into a well-lit exhibit, not opened a productivity tool.

This system explicitly rejects the **generic SaaS dashboard**: no cream/navy template, no hero-metric stat cards, no walls of identical icon+heading+text cards, no tracked-uppercase eyebrows over every section. It also refuses the database-dump fan-site look — density is earned, not default — and the obvious category reflexes (all-gold card-trim chrome, mystical-purple everything).

**Key Characteristics:**
- True untinted near-black surfaces (`oklch(0.11 0 0)`); the art carries color.
- A single cobalt-indigo brand voice, used on ≤10% of any screen.
- Depth from tonal layering + a faint colored glow, not heavy drop shadows.
- One refined sans (Geist) across the whole UI; mono reserved for game data.
- Responsive, state-conveying motion (150–250ms); no page-load choreography.
- Information is never carried by color alone (critical for YGO attribute/type coding).

## 2. Colors

A monochrome near-black stage lit by one cobalt-indigo accent; semantic colors stay muted so they read as signal, not decoration. OKLCH is canonical; frontmatter hex values are sRGB approximations.

### Primary
- **Calibration Cobalt** (`#3f5cd6` / `oklch(0.52 0.17 262)`): the single brand accent. Primary actions, current selection, focus, and live-state indicators only — never decoration. **Brighter Cobalt** (`#5b78ef` / `oklch(0.62 0.17 262)`) is the hover/active and link state; **Deep Cobalt** (`#344aa6` / `oklch(0.44 0.15 262)`) is the pressed state; **Cobalt Wash** (`#26314f` / `oklch(0.30 0.08 262)`) tints selected-row and selected-chip backgrounds on dark.

### Secondary
- **Starlight** (`#a6d6f2` / `oklch(0.82 0.10 230)`): a pale, cool highlight reserved for focus glow and the faintest sparkle on hovered showcase elements. Tiny doses only.

### Neutral
- **Void** (`#0b0b0c` / `oklch(0.11 0 0)`): the base gallery background. Untinted.
- **Surface** (`#161618` / `oklch(0.16 0 0)`): cards, panels, search field, toolbars.
- **Surface Raised** (`#232325` / `oklch(0.21 0 0)`): hovered/elevated surfaces, popovers, menus.
- **Border** (`#333336` / `oklch(0.28 0 0)`): hairline dividers and 1px borders.
- **Ink** (`#f6f6f6` / `oklch(0.97 0 0)`): primary text and icons.
- **Ink Muted** (`#a6a6a6` / `oklch(0.72 0 0)`): secondary text; verified ≥4.5:1 on Void for body use.
- **Ink Faint** (`#868688` / `oklch(0.60 0 0)`): tertiary text — **large/bold text only** (≥18px or bold ≥14px), never body.

### Tertiary (semantic state)
- **Success** (`#3cc08a` / `oklch(0.72 0.15 150)`), **Warning** (`#e0ad3e` / `oklch(0.80 0.14 85)`), **Danger** (`#db4a3e` / `oklch(0.62 0.20 25)`): validation, banlist legality, destructive actions. Always paired with an icon or label, never color alone.

### Named Rules
**The One Voice Rule.** Calibration Cobalt appears on ≤10% of any given screen. Its rarity is what makes "selected" and "primary" legible at a glance.

**The Untinted Void Rule.** The background is pure neutral (`chroma 0`). Warmth and color come from the card art, never from a tinted surface. A near-white or warm-tinted background is prohibited.

## 3. Typography

**Display / Body / Label Font:** Geist Sans (with `ui-sans-serif, system-ui, sans-serif`)
**Data Font:** Geist Mono (with `ui-monospace, monospace`)

**Character:** One precise, neutral grotesque carries the whole UI — headings, body, labels, controls. Mono appears only on game data (ATK/DEF, levels, passcodes, counts) where tabular alignment and an instrument feel earn it.

### Hierarchy
- **Display** (600, 2.25rem/36px, lh 1.1, -0.02em): card-name spotlight and page-title moments. Fixed rem, not fluid — this is product UI.
- **Headline** (600, 1.5rem/24px, lh 1.2, -0.01em): section and panel headers.
- **Title** (600, 1.125rem/18px, lh 1.3): card titles in tiles, dialog titles.
- **Body** (400, 1rem/16px, lh 1.55): descriptions and prose; cap reading prose at 65–75ch.
- **Label** (500, 0.8125rem/13px, lh 1.4, +0.01em): UI labels, chips, metadata. Sentence case.
- **Data** (Geist Mono, 500, 0.875rem/14px, `tabular-nums`): stats and identifiers.

### Named Rules
**The No-Eyebrow Rule.** No tiny uppercase tracked kicker above sections. Labels are sentence case. Hierarchy comes from size and weight, not all-caps tracking.

**The Mono-Is-For-Machines Rule.** Geist Mono is reserved for game data and identifiers. It never sets prose, headings, or button labels.

## 4. Elevation

Flat by default with tonal layering: depth is read from the Void → Surface → Surface Raised steps, not from shadows. Heavy black drop shadows look dated on near-black, so they're avoided; the one expressive depth cue is a faint colored glow on focus and on hovered showcase cards.

### Shadow Vocabulary
- **Focus Glow** (`box-shadow: 0 0 0 2px oklch(0.11 0 0), 0 0 0 4px oklch(0.62 0.17 262)`): the standard focus ring — an inner void gap, then a cobalt ring. Pair with `:focus-visible`.
- **Lift Hover** (`box-shadow: 0 8px 30px oklch(0 0 0 / 0.5)`): a soft, diffuse lift under a card tile on hover, paired with a 1px Starlight-tinted top edge.

### Named Rules
**The Glow-Not-Drop Rule.** Convey depth with tonal layering and a faint colored glow. Drop shadows darker than `oklch(0 0 0 / 0.5)` or used for resting elevation are prohibited.

## 5. Components

### Buttons
- **Shape:** gently rounded (`6px`, `{rounded.sm}`).
- **Primary:** Calibration Cobalt background, Ink text, `0.625rem 1rem` padding, Label type.
- **Hover / Focus:** background lifts to Brighter Cobalt; `:focus-visible` shows the Focus Glow ring. Pressed → Deep Cobalt. Transition 180ms ease-out.
- **Secondary:** Surface background, Ink text, 1px Border. **Ghost:** transparent, Ink Muted text, Surface background on hover.
- **States:** every button ships default / hover / focus-visible / active / disabled (50% opacity, no pointer) / loading (inline spinner replacing the label, width preserved).

### Chips (attribute / type / set filters)
- **Style:** Surface background, Ink Muted text, fully rounded (`{rounded.full}`), `0.25rem 0.625rem`.
- **State:** selected → Cobalt Wash background, Ink text, with a leading icon or text token. **Color is never the only selected cue** — selection also shows a check or filled icon, so attribute/type filters stay legible for color-blind users.

### Cards / Containers (the Card Tile — signature component)
- **Corner Style:** `10px` (`{rounded.md}`), with the card image filling the tile edge-to-edge.
- **Background:** Surface; the image is the content, chrome is minimal.
- **Hover:** Lift Hover shadow + a 1px Starlight top edge + 1.02 scale; 180ms ease-out. Reduced-motion → opacity/edge only, no transform.
- **Metadata:** name in Title type; ATK/DEF and level in Data (mono); attribute/type shown as icon **plus** label.
- **Border:** none at rest; the tonal step from Void to Surface defines the edge.

### Inputs / Fields (search-forward)
- **Style:** Surface background, 1px Border, `6px` radius, Ink text, Ink Muted placeholder (placeholder still meets 4.5:1).
- **Focus:** Border shifts to Calibration Cobalt + Focus Glow; no layout shift.
- **Search:** leading magnifier icon in Ink Muted; clearable.

### Navigation
- **Style:** a quiet top bar on Void with a Surface-raised on scroll; Label-type links in Ink Muted, current route in Ink with a 2px Cobalt underline.
- **States:** hover → Ink; active/current → Ink + cobalt marker. Mobile → collapses to a bottom tab bar or sheet, not a hamburger-hidden primary nav.

## 6. Do's and Don'ts

### Do:
- **Do** keep the background a true untinted near-black (`oklch(0.11 0 0)`); let the card art be the color.
- **Do** keep Calibration Cobalt to ≤10% of any screen (the One Voice Rule).
- **Do** convey depth with tonal layering + a faint glow (the Glow-Not-Drop Rule).
- **Do** pair every attribute/type/state color with an icon, label, or text — color is never the only signal.
- **Do** use Geist Mono only for game data (ATK/DEF, levels, passcodes), Geist Sans for everything else.
- **Do** give every interactive component default / hover / focus-visible / active / disabled / loading states, with a `prefers-reduced-motion` fallback for every animation.
- **Do** use skeletons for loading card grids and teaching empty states ("Search 13,000+ cards…"), not mid-content spinners.

### Don't:
- **Don't** build the **generic SaaS dashboard**: no cream/navy template, no hero-metric stat cards, no walls of identical icon+heading+text cards.
- **Don't** add tracked-uppercase eyebrows or `01 / 02 / 03` numbered markers above sections.
- **Don't** use gradient text (`background-clip: text`), side-stripe `border-left/right` accents, or decorative glassmorphism.
- **Don't** tint the background warm or cool "for mood"; warmth lives in the art and accents.
- **Don't** use drop shadows for resting elevation or anything darker than `oklch(0 0 0 / 0.5)`.
- **Don't** set prose, headings, or button labels in mono; don't set UI labels in a display face.
- **Don't** rely on attribute/type color alone to convey meaning anywhere.
