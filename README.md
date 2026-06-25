# Yu-Gi-Oh! Deck Builder & Collection

> 🇧🇷 [Português](#português) · 🇺🇸 [English](#english)

---

## Português

Um app de **descoberta, montagem de decks e coleção de cartas de Yu-Gi-Oh!**, pensado para colecionadores casuais — gente que gosta de explorar, admirar a arte das cartas e montar decks no próprio ritmo, sem a pressão de torneio.

A experiência é premium e cinematográfica: um palco escuro, tipo galeria, onde **a arte da carta é a protagonista**. A navegação é o produto — rápida, fluida e feita para você "só dar uma olhada" e acabar perdendo o tempo (no bom sentido) explorando.

### O que dá pra fazer

- **Navegar e buscar cartas** — galeria com busca, filtros (tipo, atributo, ordenação) e paginação fluida.
- **Top cartas** (`/top`) — destaque das cartas mais relevantes, com preço de mercado e ficha de detalhe.
- **Arquétipos** (`/archetypes` e `/archetypes/[name]`) — explore os principais arquétipos e suas cartas.
- **Deck builder** (`/builder`) — monte decks com pré-visualização da carta ao passar o mouse.

### Como funciona

- **Next.js (App Router) + TypeScript + React 19** no frontend e nas rotas de API.
- **Tailwind CSS v4** para o estilo.
- **Dados das cartas: API do YGOPRODeck.** A API não tem CORS e tem limite de ~20 req/s, então **toda chamada acontece no servidor** e passa pelo cache de dados do Next (revalidação diária, pois os dados das cartas são quase estáticos). O navegador pagina pela rota própria `/api/cards`, nunca direto na API externa.
- **Neon (Postgres serverless)** guarda os dados do usuário — contas, decks e coleções — referenciando os IDs das cartas (passcodes), sem duplicar o texto/imagem completos. *(camada de auth/DB ainda em construção.)*

> ⚠️ Esta versão do Next.js tem **breaking changes** em relação ao que você talvez conheça. Antes de escrever código, consulte os guias em `node_modules/next/dist/docs/`. Veja também `AGENTS.md`.

### Começando

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente em .env.local (nunca faça commit!)
#    DATABASE_URL — string de conexão do Neon (use o endpoint -pooler)

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários/componentes (Vitest, execução única) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Testes end-to-end (Playwright) |

### Testes

- **Vitest** (unit/componentes, jsdom + Testing Library): testes ficam ao lado do código, como `src/**/*.{test,spec}.{ts,tsx}`.
- **Playwright** (E2E): specs em `e2e/`; a config sobe o `npm run dev` na porta 3000 automaticamente.

### Estrutura

```
src/
├── app/              # Rotas (App Router)
│   ├── page.tsx      # Home — galeria + busca + filtros
│   ├── top/          # Top cartas
│   ├── archetypes/   # Arquétipos (lista + detalhe)
│   ├── builder/      # Deck builder
│   └── api/cards/    # Rota de paginação (proxy server-side do YGOPRODeck)
├── components/       # UI (gallery, holo-card, filter-bar, deck-builder, ...)
└── lib/              # Acesso a dados e regras (ygoprodeck, top-cards, deck, card-price)
```

### Documentos de design

- `PRODUCT.md` — brief estratégico: público, propósito, personalidade da marca, anti-referências e acessibilidade (WCAG 2.1 AA, color-blind safe).
- `DESIGN.md` — sistema visual (paleta, tipografia, componentes).

---

## English

A **Yu-Gi-Oh! card discovery, deck-building and collection app**, made for casual collectors — people who enjoy exploring, admiring card art and assembling decks at their own pace, with no tournament pressure.

The experience is premium and cinematic: a dark, gallery-like stage where **the card art is the hero**. Browsing *is* the product — fast, fluid, and built so you can "just look something up" and happily lose track of time exploring.

### What you can do

- **Browse & search cards** — gallery with search, filters (type, attribute, sort) and fluid pagination.
- **Top cards** (`/top`) — spotlight of the most relevant cards, with market price and a detail sheet.
- **Archetypes** (`/archetypes` and `/archetypes/[name]`) — explore top archetypes and their cards.
- **Deck builder** (`/builder`) — assemble decks with a card hover preview.

### How it works

- **Next.js (App Router) + TypeScript + React 19** for the frontend and API routes.
- **Tailwind CSS v4** for styling.
- **Card data: YGOPRODeck API.** The API has no CORS and a ~20 req/s rate limit, so **every call is made server-side** and goes through Next's data cache (revalidated daily, since card data is near-static). The browser paginates through the app's own `/api/cards` route, never the upstream API directly.
- **Neon (serverless Postgres)** stores user data — accounts, decks and collections — referencing card IDs (passcodes) rather than duplicating full text/images. *(auth/DB layer still in progress.)*

> ⚠️ This Next.js version has **breaking changes** compared to what you may know. Before writing code, read the guides in `node_modules/next/dist/docs/`. See also `AGENTS.md`.

### Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables in .env.local (never commit these!)
#    DATABASE_URL — Neon connection string (use the -pooler endpoint)

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit/component tests (Vitest, single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | End-to-end tests (Playwright) |

### Testing

- **Vitest** (unit/component, jsdom + Testing Library): tests live next to the code as `src/**/*.{test,spec}.{ts,tsx}`.
- **Playwright** (E2E): specs in `e2e/`; the config auto-starts `npm run dev` on port 3000.

### Structure

```
src/
├── app/              # Routes (App Router)
│   ├── page.tsx      # Home — gallery + search + filters
│   ├── top/          # Top cards
│   ├── archetypes/   # Archetypes (list + detail)
│   ├── builder/      # Deck builder
│   └── api/cards/    # Pagination route (server-side YGOPRODeck proxy)
├── components/       # UI (gallery, holo-card, filter-bar, deck-builder, ...)
└── lib/              # Data access & logic (ygoprodeck, top-cards, deck, card-price)
```

### Design docs

- `PRODUCT.md` — strategic brief: audience, purpose, brand personality, anti-references and accessibility (WCAG 2.1 AA, color-blind safe).
- `DESIGN.md` — visual system (palette, typography, components).

---

<sub>Card data from the [YGOPRODeck API](https://ygoprodeck.com/api-guide/). This is a fan project and is not affiliated with or endorsed by Konami.</sub>
