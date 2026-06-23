import { describe, expect, test } from 'vitest';
import { formatCount, metricLabel, buildRankings, buildStaples, rankBy, trimCard } from '@/lib/top-cards';
import type { Card } from '@/lib/ygoprodeck';

describe('formatCount', () => {
  test('leaves values under 1000 as-is', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(842)).toBe('842');
  });
  test('compacts thousands with one decimal, trimming .0', () => {
    expect(formatCount(1000)).toBe('1k');
    expect(formatCount(128420)).toBe('128.4k');
  });
  test('compacts millions', () => {
    expect(formatCount(1000000)).toBe('1M');
    expect(formatCount(1500000)).toBe('1.5M');
  });
});

describe('metricLabel', () => {
  test('maps each lens to a short label', () => {
    expect(metricLabel('week')).toBe('views/sem');
    expect(metricLabel('views')).toBe('views');
    expect(metricLabel('likes')).toBe('likes');
    expect(metricLabel('staples')).toBe('views');
  });
});

function card(partial: Partial<Card> & { id: number }): Card {
  return {
    name: `Card ${partial.id}`,
    type: 'Effect Monster',
    humanReadableCardType: 'Effect Monster',
    frameType: 'effect',
    desc: 'desc',
    race: 'Warrior',
    card_images: [
      {
        id: partial.id,
        image_url: `https://img/${partial.id}.jpg`,
        image_url_small: `https://img/s/${partial.id}.jpg`,
        image_url_cropped: `https://img/c/${partial.id}.jpg`,
      },
    ],
    ...partial,
  } as Card;
}

describe('rankBy', () => {
  const cards = [
    card({ id: 1, misc_info: [{ views: 10, viewsweek: 1, upvotes: 5 }] }),
    card({ id: 2, misc_info: [{ views: 30, viewsweek: 3, upvotes: 1 }] }),
    card({ id: 3, misc_info: [{ views: 20, viewsweek: 2, upvotes: 9 }] }),
    card({ id: 4 }), // no misc_info -> metric 0, sinks to the bottom
  ];

  test('sorts by the metric descending and assigns 1-based ranks', () => {
    const ranked = rankBy(cards, 'views', 10);
    expect(ranked.map((r) => r.card.id)).toEqual([2, 3, 1, 4]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
    expect(ranked.map((r) => r.metric)).toEqual([30, 20, 10, 0]);
  });

  test('respects the limit', () => {
    expect(rankBy(cards, 'views', 2).map((r) => r.card.id)).toEqual([2, 3]);
  });

  test('uses the requested metric key', () => {
    expect(rankBy(cards, 'upvotes', 2).map((r) => r.card.id)).toEqual([3, 1]);
  });
});

describe('trimCard', () => {
  test('keeps only the first image and drops misc_info and extra keys', () => {
    const raw = {
      ...card({ id: 7, misc_info: [{ views: 5 }] }),
      card_images: [
        { id: 7, image_url: 'a', image_url_small: 'a', image_url_cropped: 'a' },
        { id: 8, image_url: 'b', image_url_small: 'b', image_url_cropped: 'b' },
      ],
      card_sets: [{ set_name: 'x' }],
      card_prices: [{ cardmarket_price: '1' }],
    } as unknown as Card;

    const trimmed = trimCard(raw);
    expect(trimmed.card_images).toHaveLength(1);
    expect(trimmed.card_images[0].id).toBe(7);
    expect(trimmed.misc_info).toBeUndefined();
    expect('card_sets' in trimmed).toBe(false);
    expect('card_prices' in trimmed).toBe(false);
    expect(trimmed.name).toBe('Card 7');
  });

  test('handles a card with no images', () => {
    const raw = { ...card({ id: 9 }), card_images: [] } as Card;
    expect(trimCard(raw).card_images).toEqual([]);
  });
});

describe('buildRankings', () => {
  test('produces the three lenses, each ordered by its metric', () => {
    const cards = [
      card({ id: 1, misc_info: [{ views: 10, viewsweek: 5, upvotes: 1 }] }),
      card({ id: 2, misc_info: [{ views: 20, viewsweek: 1, upvotes: 9 }] }),
    ];
    const r = buildRankings(cards);
    expect(r.views.map((c) => c.card.id)).toEqual([2, 1]);
    expect(r.week.map((c) => c.card.id)).toEqual([1, 2]);
    expect(r.likes.map((c) => c.card.id)).toEqual([2, 1]);
  });
});

describe('buildStaples', () => {
  test('ranks all cards by total views without a cap', () => {
    const cards = [
      card({ id: 1, misc_info: [{ views: 10 }] }),
      card({ id: 2, misc_info: [{ views: 30 }] }),
      card({ id: 3, misc_info: [{ views: 20 }] }),
    ];
    const staples = buildStaples(cards);
    expect(staples).toHaveLength(3);
    expect(staples.map((c) => c.card.id)).toEqual([2, 3, 1]);
  });
});
