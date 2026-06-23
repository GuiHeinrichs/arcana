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
