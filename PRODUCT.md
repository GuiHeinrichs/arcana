# Product

## Register

product

## Users

Casual Yu-Gi-Oh! collectors — people who enjoy owning, browsing, and admiring cards more than competitive grinding. They show up for relaxed, exploratory sessions (couch, phone, or desktop): looking a card up, rediscovering favorites, checking what they own, and assembling fun or themed decks at their own pace. No tournament time pressure.

## Product Purpose

A Yu-Gi-Oh! deck builder & collection app whose primary job is **card discovery and browsing** — making it a pleasure to explore the card pool, surface interesting cards, and admire the art — with deck building and collection tracking built on top. Card data comes from the YGOPRODeck API; user decks and collections live in Neon Postgres. Success looks like a collector opening the app to "just look something up" and happily losing time browsing, then leaving with a deck idea or a clearer picture of their collection.

## Brand Personality

Premium and dramatic — **cinematic, curated, reverent**. A dark, gallery-like stage where the card art is the hero. The voice is confident and knowledgeable but warm: a great curator, not a hype machine. It should feel like opening a premium binder or walking a well-lit exhibit.

## Anti-references

- **Generic SaaS dashboards.** No cream/navy startup-template look, no hero-metric stat cards, no endless identical icon + heading + text grids, no tiny tracked-uppercase eyebrows over every section. This is a showcase, not a productivity tool.
- Corollary from the brand: don't bury the card art under chrome, and don't drift into a dense fan-site database wall.

## Design Principles

1. **The art leads.** Every screen earns its keep by showcasing card art; chrome recedes so the cards carry the experience.
2. **Browsing is the product.** Optimize for serendipity and flow — fast, forgiving exploration beats dense, all-at-once data.
3. **Curated, not cluttered.** Show less, better. Resist the database-dump reflex; guide attention deliberately.
4. **Calm confidence.** Premium restraint — drama comes from space, light, and motion, not noise.
5. **Inclusive by default.** Information is never carried by color alone, and everything works with reduced motion.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA**: body text ≥ 4.5:1, large text ≥ 3:1, placeholders included.
- A reduced-motion alternative for every animation (`prefers-reduced-motion`).
- **Never rely on color alone.** Yu-Gi-Oh!'s attribute coding (DARK / LIGHT / FIRE / WATER / EARTH / WIND / DIVINE) and card-type coding (Normal / Effect / Ritual / Fusion / Synchro / Xyz / Link / Spell / Trap) must always pair color with a label, icon, or text so color-blind users get the same information.
