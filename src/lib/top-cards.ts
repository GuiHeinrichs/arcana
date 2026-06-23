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
 *  keeping only the primary image and dropping misc_info and price/set bulk. */
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
