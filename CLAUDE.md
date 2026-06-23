@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. The `@AGENTS.md` import above carries create-next-app's warning that this Next.js version has breaking changes — heed it and check `node_modules/next/dist/docs/` when unsure.

## Project

Yu-Gi-Oh! deck builder & collection app. Scaffolded with `create-next-app` (App Router, TypeScript, Tailwind, ESLint, `src/`, import alias `@/*`). Card data, deck/collection, auth, and DB layers are not built yet.

## Stack

- **Next.js (App Router) + TypeScript** — frontend and API/route handlers. App code lives under `src/`.
- **Tailwind CSS** — styling.
- **Neon** (serverless Postgres) — app data: user accounts, decks, collections. Reached via `DATABASE_URL`.
- **YGOPRODeck API** — source of truth for card data (names, stats, text, images). The database stores user data referencing card IDs (passcodes); it does not duplicate full card text/images except as a cache.

## Environment & secrets

- Secrets live in `.env.local` (gitignored via `.env*`) — never commit them.
- `DATABASE_URL` — Neon connection string. Use the **pooled** (`-pooler`) endpoint for request-scoped queries.

## Neon (serverless Postgres)

- Connections are short-lived. In serverless / edge contexts use the `@neondatabase/serverless` driver (HTTP/WebSocket) rather than a long-lived `pg` pool.

## YGOPRODeck API

Guide: https://ygoprodeck.com/api-guide/ — verify specifics there; the API evolves.

- Base: `https://db.ygoprodeck.com/api/v7/cardinfo.php`
- **Rate limit ~20 requests/sec per IP; exceeding it triggers a temporary ban.** Cache card data in Neon and serve from there — do not hit the API per request or per render.
- Card data is near-static; use `checkDBVer.php` to decide when to refresh the cache.
- **Do not hotlink card images** (`https://images.ygoprodeck.com/...`). Download and serve/cache them yourself.

## Testing

- **Vitest** (unit/component, jsdom + Testing Library): `npm test` (single run) or `npm run test:watch`. Tests live next to code as `src/**/*.{test,spec}.{ts,tsx}`.
- **Playwright** (E2E): `npm run test:e2e`. Specs in `e2e/`; the config auto-starts `npm run dev` on port 3000.

## Skills — use these instead of the defaults

- **Frontend / UI work → `/impeccable` only.** Use it for any design, layout, component, styling, animation, or UX task. Do not use other design skills in this repo.
- **Before building any feature → `brainstorming`** to settle intent and design first.
- **`caveman`** — token-saving compressed mode when brevity/efficiency is requested.
- **Security review → Trail of Bits plugins** (`trailofbits` marketplace configured; `static-analysis` installed). Add more on demand, e.g. `claude plugin install insecure-defaults@trailofbits` (also `differential-review`, `supply-chain-risk-auditor`).

## Design context

- `PRODUCT.md` — strategic design brief: register (product), users (casual collectors), purpose (card discovery/browse), brand personality (premium & dramatic, card-art-led), anti-references (no generic SaaS dashboard), and AA + color-blind-safe accessibility. Impeccable and any UI work read this first.
- `DESIGN.md` — visual system (palette, typography, components). Not generated yet; run `/impeccable document` to seed it.

## Settings

- `.claude/skills/` — committed, team-shared (the four skills above).
- `.claude/settings.local.json` — personal, gitignored: local permissions plus the Impeccable design hook, which Impeccable auto-manages per machine. Teammates register the hook locally by running `npx impeccable install`.
