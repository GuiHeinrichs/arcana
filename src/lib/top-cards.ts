import { unstable_cache } from 'next/cache';
import type { Card } from '@/lib/ygoprodeck';

export type TopLens = 'week' | 'views' | 'likes' | 'staples';
export type MetricKey = 'viewsweek' | 'views' | 'upvotes';

export interface RankedCard {
  rank: number;
  metric: number;
  card: Card;
}

export interface TopRankings {
  week: RankedCard[];
  views: RankedCard[];
  likes: RankedCard[];
}

export const TOP_N = 60;

/** Compact view/like counts: 842, 128.4k, 1.5M. Full value belongs in title/sr. */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/** Short label shown next to the metric value for each lens. */
export function metricLabel(lens: TopLens): string {
  return lens === 'week' ? 'views/sem' : lens === 'likes' ? 'likes' : 'views';
}

function metricOf(card: Card, metric: MetricKey): number {
  return card.misc_info?.[0]?.[metric] ?? 0;
}

/** Reduce a card to the fields HoloCard / CardDetailSheet / CardInspector read,
 *  keeping the primary image and market prices while dropping misc_info and the
 *  set/printing bulk. */
export function trimCard(card: Card): Card {
  return {
    id: card.id,
    name: card.name,
    type: card.type,
    humanReadableCardType: card.humanReadableCardType,
    frameType: card.frameType,
    desc: card.desc,
    race: card.race,
    archetype: card.archetype,
    typeline: card.typeline,
    ygoprodeck_url: card.ygoprodeck_url,
    atk: card.atk,
    def: card.def,
    level: card.level,
    attribute: card.attribute,
    linkval: card.linkval,
    linkmarkers: card.linkmarkers,
    scale: card.scale,
    card_images: card.card_images.length ? [card.card_images[0]] : [],
    card_prices: card.card_prices,
  };
}

/** Sort by a metric descending, take `limit`, attach 1-based ranks, trim cards. */
export function rankBy(cards: Card[], metric: MetricKey, limit: number): RankedCard[] {
  return [...cards]
    .map((card) => ({ card, value: metricOf(card, metric) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry, i) => ({ rank: i + 1, metric: entry.value, card: trimCard(entry.card) }));
}

export function buildRankings(cards: Card[]): TopRankings {
  return {
    week: rankBy(cards, 'viewsweek', TOP_N),
    views: rankBy(cards, 'views', TOP_N),
    likes: rankBy(cards, 'upvotes', TOP_N),
  };
}

export function buildStaples(cards: Card[]): RankedCard[] {
  return rankBy(cards, 'views', cards.length);
}

// ---- Archetypes ------------------------------------------------------------

export const ARCHETYPE_N = 48;

export interface TopArchetype {
  name: string;
  cardCount: number;
  views: number;
  /** Cropped art of the archetype's most-viewed card, used as the tile hero. */
  art: string | null;
}

/** Group cards by archetype, rank by summed views, keep the top `limit`. The
 *  most-viewed card in each group supplies the hero art. */
export function buildArchetypes(cards: Card[], limit = ARCHETYPE_N): TopArchetype[] {
  const groups = new Map<
    string,
    { views: number; count: number; topViews: number; art: string | null }
  >();

  for (const card of cards) {
    const name = card.archetype;
    if (!name) continue;
    const views = card.misc_info?.[0]?.views ?? 0;
    const group = groups.get(name) ?? { views: 0, count: 0, topViews: -1, art: null };
    group.views += views;
    group.count += 1;
    if (views > group.topViews) {
      group.topViews = views;
      group.art = card.card_images[0]?.image_url_cropped ?? null;
    }
    groups.set(name, group);
  }

  return [...groups.entries()]
    .map(([name, g]) => ({ name, cardCount: g.count, views: g.views, art: g.art }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

const RANKINGS_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes';
const STAPLES_URL =
  'https://db.ygoprodeck.com/api/v7/cardinfo.php?staple=yes&misc=yes';

const EMPTY_RANKINGS: TopRankings = { week: [], views: [], likes: [] };

interface TopData {
  rankings: TopRankings;
  archetypes: TopArchetype[];
}

const EMPTY_TOP_DATA: TopData = { rankings: EMPTY_RANKINGS, archetypes: [] };

/**
 * Top Cards and Top Archetypes both derive from the full card set (~23MB),
 * which is too large for Next's fetch cache — so the raw fetch is `no-store`
 * and we cache only the small derived result via unstable_cache (revalidated
 * daily). One fetch feeds both. On any failure we return empty results so the
 * pages degrade gracefully (Staples is fetched separately).
 */
const getTopData = unstable_cache(
  async (): Promise<TopData> => {
    try {
      const res = await fetch(RANKINGS_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`YGOPRODeck responded ${res.status}`);
      const json = (await res.json()) as { data?: Card[] };
      if (!json.data) return EMPTY_TOP_DATA;
      return {
        rankings: buildRankings(json.data),
        archetypes: buildArchetypes(json.data),
      };
    } catch {
      return EMPTY_TOP_DATA;
    }
  },
  ['ygo-top-data'],
  { revalidate: 60 * 60 * 24, tags: ['ygo-top'] },
);

export async function getTopRankings(): Promise<TopRankings> {
  return (await getTopData()).rankings;
}

export async function getTopArchetypes(): Promise<TopArchetype[]> {
  return (await getTopData()).archetypes;
}

/** Staples are a small curated set (~64), cached via the normal fetch cache. */
export async function getStaples(): Promise<RankedCard[]> {
  try {
    const res = await fetch(STAPLES_URL, {
      next: { revalidate: 60 * 60 * 24, tags: ['ygo-top'] },
    });
    if (!res.ok) throw new Error(`YGOPRODeck responded ${res.status}`);
    const json = (await res.json()) as { data?: Card[] };
    return json.data ? buildStaples(json.data) : [];
  } catch {
    return [];
  }
}

/** All cards belonging to one archetype (bounded set), for the detail page. */
export async function getArchetypeCards(name: string): Promise<Card[]> {
  try {
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24, tags: ['ygo-archetype'] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Card[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}
