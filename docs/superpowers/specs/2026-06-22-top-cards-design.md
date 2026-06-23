# Spec — Página Top Cards (Arcana)

**Data:** 2026-06-22
**Status:** Aprovado (design) — aguardando revisão do spec
**Escopo:** Primeira de três telas planejadas. As outras (Deck Builder, Top Archetypes) terão specs próprios e não fazem parte deste documento.

## 1. Objetivo

Adicionar uma página `/top` que destaca cartas em alta usando os dados de popularidade do YGOPRODeck. A página tem **4 lentes** em abas:

| Lente | Métrica | Fonte |
|-------|---------|-------|
| **Em alta** (`week`) | `viewsweek` (desc) | fetch pesado + precompute |
| **Mais vistas** (`views`) | `views` total (desc) | fetch pesado + precompute |
| **Curtidas** (`likes`) | `upvotes` (desc) | fetch pesado + precompute |
| **Staples** (`staples`) | `views` (desc), ~64 cartas curadas | fetch leve dedicado |

Cada lente é apresentada como **pódio (top 3) + grade** (ranks 4..N), reaproveitando os componentes existentes de carta.

## 2. Contexto e restrições

- A API pública do YGOPRODeck é essencialmente o `cardinfo.php`. **Não há endpoint de decks/torneios** (por isso "Top Decks" não entra; ver telas futuras).
- A API **não ordena por views/upvotes** (`sort=views` é ignorado). Para rankear é preciso baixar o conjunto inteiro e ordenar na memória.
- Tamanho do conjunto completo com `misc=yes`: **~23 MB / ~14.418 cartas** (medido em 2026-06-22). Grande demais para o data-cache de fetch do Next — exige cache próprio do resultado **derivado** (pequeno).
- `staple=yes` retorna ~64 cartas curadas; com `&misc=yes` cada uma traz `misc_info` (views, viewsweek, upvotes, etc.).
- Restrições do projeto (CLAUDE.md): rate limit ~20 req/s → cachear server-side; não hotlinkar imagens (já tratado pelos componentes atuais); Neon e download de imagens estão **adiados** — esta tela não introduz nenhum dos dois.
- Acessibilidade obrigatória (PRODUCT.md): **AA + color-blind-safe**.

## 3. Arquitetura de dados — `src/lib/top-cards.ts`

### Tipos

```ts
export type TopLens = 'week' | 'views' | 'likes' | 'staples';

export interface RankedCard {
  rank: number;    // 1-based, na ordem da lente
  metric: number;  // valor da métrica daquela lente (viewsweek | views | upvotes)
  card: Card;      // enxuto (ver trimCard); o suficiente p/ HoloCard + CardDetailSheet
}

export interface TopRankings {
  week: RankedCard[];
  views: RankedCard[];
  likes: RankedCard[];
}
```

### Funções

- **`getTopRankings(): Promise<TopRankings>`**
  - Envolta em `unstable_cache(fn, ['ygo-top-rankings'], { revalidate: 86400, tags: ['ygo-top'] })`.
  - Dentro: `fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes', { cache: 'no-store' })` (não deixa o Next tentar cachear os 23 MB crus).
  - Para cada métrica, chama `rankBy(cards, metric, TOP_N)`.
  - Em erro (fetch/parse), captura e retorna `{ week: [], views: [], likes: [] }` (degradação graciosa; Staples segue funcionando).
  - `TOP_N = 60`.

- **`getStaples(): Promise<RankedCard[]>`**
  - `fetch('…/cardinfo.php?staple=yes&misc=yes', { next: { revalidate: 86400, tags: ['ygo-top'] } })` (resposta pequena, cache de fetch normal).
  - Ordena por `views` desc, mapeia para `RankedCard` (metric = `views`). Sem corte (mostra todas ~64).

### Helpers puros (testáveis isolados)

- **`rankBy(cards: Card[], metric: MetricKey, n: number): RankedCard[]`** — extrai a métrica de `misc_info[0]`, ordena desc, fatia `n`, atribui `rank` 1-based e aplica `trimCard`.
- **`trimCard(card: Card): Card`** — mantém só os campos consumidos por `HoloCard`/`CardDetailSheet`/`CardInspector`: `id, name, type, humanReadableCardType, frameType, desc, race, archetype, typeline, ygoprodeck_url, atk, def, level, attribute, linkval, linkmarkers, scale` e **apenas `card_images[0]`**. Remove `card_sets`, `card_prices` e imagens extras (encolhe o payload enviado ao cliente).
- **`formatCount(n: number): string`** — compacto: `128420 → "128.4k"`, `1500000 → "1.5M"`, `< 1000 → "842"`. O valor cheio vai no `title`/sr.
- **`metricLabel(lens: TopLens): string`** — rótulo curto exibido (ex.: "views", "views/sem", "likes").

### Extração da métrica

`misc_info` é um array; usar `card.misc_info?.[0]`. Adicionar `misc_info?` ao tipo `Card` em `src/lib/ygoprodeck.ts` (campos: `views`, `viewsweek`, `upvotes`, `downvotes`). Cartas sem `misc_info` recebem métrica `0` (ficam no fim).

## 4. Rota e página — `src/app/top/page.tsx`

- Server Component. Lê `searchParams.lens` (validado contra `TopLens`; default `'week'`).
- Busca em paralelo `getTopRankings()` e `getStaples()` (`Promise.all`).
- Monta `lenses: Record<TopLens, RankedCard[]>` e passa para `<TopCards initialLens={lens} lenses={lenses} />`.
- Cabeçalho no padrão da home (faixa `tech` + `font-display` + termo japonês decorativo), reaproveitando o `SiteHeader` e o `footer`.
- `src/app/top/loading.tsx`: esqueleto leve (pódio + grade de `HoloCardSkeleton`).

## 5. Navegação — `src/components/site-header.tsx`

Hoje o header só tem logo + tag (sem menu). Mudanças:

- Adicionar nav com **Cards** (`/`) e **Top Cards** (`/top`).
- Item ativo via `usePathname()` + `aria-current="page"` (torna o header um client component, ou extrai um `<HeaderNav>` client e mantém o header server). **Decisão:** extrair `<HeaderNav>` client pequeno; header continua server.
- Estilo discreto, alinhado à marca; estruturado para crescer (Deck Builder etc.).

## 6. Componentes (client)

### `src/components/top-cards.tsx`
- Recebe `{ initialLens, lenses }`.
- `tablist` acessível: `role="tablist"`, cada aba `role="tab"` com `aria-selected`/`aria-controls`; painel `role="tabpanel"`. Navegação por setas do teclado entre abas.
- Estado `active: TopLens` (inicia em `initialLens`). Ao trocar, atualiza a URL com `?lens=` via `history.replaceState`/`router.replace` **sem** pular o scroll (`{ scroll: false }`).
- Hospeda um único `CardDetailSheet`; `onSelect` das cartas seta `selected`.
- Renderiza `<Podium>` (top 3 da lente ativa) + grade (resto).
- Estado vazio por lente: se a lente de ranking vier vazia (falha do fetch pesado), mostra um estado "rankings indisponíveis no momento" com sugestão de voltar mais tarde; Staples nunca cai nesse estado.

### `src/components/podium.tsx`
- Recebe os 3 primeiros `RankedCard` + `lens`.
- Layout: #1 maior e elevado ao centro, #2 à esquerda, #3 à direita. **DOM em ordem de rank** (1,2,3) para leitores de tela; a posição visual é via CSS (order/grid).
- Cada carta usa `HoloCard` com `rank` e `metric`.
- Selo de rank com destaque (âmbar) e `formatCount(metric)` visível + rótulo da métrica.

### `src/components/holo-card.tsx` (extensão)
- Adicionar props opcionais `rank?: number` e `metric?: string` (string já formatada).
- Quando presentes: selo `#N` no canto superior e a métrica no rodapé sempre visível (a legenda de nome/frame atual continua no hover/focus). Texto sr-only descrevendo "rank N, X views" para a11y.
- Uso atual na home (sem essas props) permanece idêntico.
- Grade reaproveita a constante `GRID` da `gallery.tsx` (extrair para um módulo compartilhado, ex.: `src/lib/ui.ts`, ou exportar de `gallery.tsx`). **Decisão:** extrair `GRID` para `src/components/holo-card.tsx` (junto do card) e a `gallery` passa a importar de lá.

## 7. Acessibilidade & marca

- AA + color-blind-safe: selos de rank não dependem só de cor (numeral + texto sr-only); contraste do âmbar sobre superfícies escuras verificado.
- Tabs totalmente operáveis por teclado; foco visível.
- Tom premium/dramático: holo-tilt nas cartas do pódio, tipografia e ornamentos no padrão existente.

## 8. Testes

- **Vitest (unit)** — `top-cards.test.ts`:
  - `rankBy`: ordena desc pela métrica, corta em `TOP_N`, atribui `rank` 1-based, cartas sem `misc_info` vão pro fim.
  - `trimCard`: mantém os campos esperados e só `card_images[0]`; remove `card_sets`/`card_prices`.
  - `formatCount`: faixas `< 1k`, `k`, `M`.
- **Vitest (componente + RTL)** — `top-cards.test.tsx`:
  - Troca de aba renderiza a lente correta (e atualiza `aria-selected`).
  - Pódio renderiza exatamente os 3 primeiros na ordem de rank.
- **Playwright (smoke)** — `e2e/top.spec.ts`:
  - Abrir `/top`, ver o pódio, trocar de aba, clicar numa carta e ver o detail sheet.

## 9. Arquivos afetados

**Novos**
- `src/lib/top-cards.ts`
- `src/app/top/page.tsx`
- `src/app/top/loading.tsx`
- `src/components/top-cards.tsx`
- `src/components/podium.tsx`
- `src/components/header-nav.tsx`
- `src/lib/top-cards.test.ts`
- `src/components/top-cards.test.tsx`
- `e2e/top.spec.ts`

**Modificados**
- `src/lib/ygoprodeck.ts` — adicionar `misc_info?` ao tipo `Card`.
- `src/components/holo-card.tsx` — props opcionais `rank`/`metric`; passar a exportar `GRID`.
- `src/components/gallery.tsx` — importar `GRID` de `holo-card`.
- `src/components/site-header.tsx` — incluir `<HeaderNav>`.

## 10. Decisões fixadas (defaults)

- Rota: `/top`.
- `TOP_N = 60` por lente de ranking; Staples mostra todas (~64).
- Aba default: **Em alta** (`week`); deep-link via `?lens=`.
- Estratégia de dados: **precompute em runtime** via `unstable_cache` (revalida 1×/dia). Sem Neon, sem cron, sem download de imagens.
- Reaproveitar `HoloCard`/`CardDetailSheet`/`CardInspector` (estender `HoloCard`, não criar card novo).

## 11. Fora de escopo

- Top Decks / Top Archetypes / Deck Builder (specs próprios).
- Persistência (Neon), favoritar/curtir, filtros dentro do Top.
- Cron de "aquecimento" do cache (o cold-miss diário é aceitável no MVP; pode ser adicionado depois).
