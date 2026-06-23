import type { Card } from "@/lib/ygoprodeck";

// Source preference: TCGplayer (USD) first, then the other USD shops, with
// Cardmarket (EUR) only as a last resort so the `$` label stays mostly honest.
const PRICE_ORDER = [
  "tcgplayer_price",
  "coolstuffinc_price",
  "ebay_price",
  "amazon_price",
  "cardmarket_price",
] as const;

/** Best available market price for a card, or 0 when it is unpriced. */
export function priceOf(card: Card): number {
  const prices = card.card_prices?.[0];
  if (!prices) return 0;
  for (const key of PRICE_ORDER) {
    const value = Number.parseFloat(prices[key] ?? "");
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

/** Formats the market price as `$0.42` / `$12.50` / `$1.2k`, or null when unpriced. */
export function formatPrice(card: Card): string | null {
  const value = priceOf(card);
  if (value <= 0) return null;
  if (value >= 1000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${value.toFixed(2)}`;
}
