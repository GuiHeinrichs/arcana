import { describe, expect, test } from "vitest";
import { formatPrice, priceOf } from "@/lib/card-price";
import type { Card } from "@/lib/ygoprodeck";

function card(prices?: Card["card_prices"]): Card {
  return { id: 1, name: "C", type: "t", humanReadableCardType: "t", frameType: "effect", desc: "d", race: "r", card_images: [], card_prices: prices } as Card;
}

describe("priceOf", () => {
  test("prefers tcgplayer, skipping zero/missing sources", () => {
    expect(priceOf(card([{ cardmarket_price: "0.00", tcgplayer_price: "0.42" }]))).toBe(0.42);
  });
  test("falls back through the source order when tcgplayer is zero", () => {
    expect(priceOf(card([{ tcgplayer_price: "0.00", ebay_price: "3.50" }]))).toBe(3.5);
  });
  test("returns 0 when unpriced or absent", () => {
    expect(priceOf(card([{ tcgplayer_price: "0.00" }]))).toBe(0);
    expect(priceOf(card(undefined))).toBe(0);
  });
});

describe("formatPrice", () => {
  test("formats with two decimals, compacts thousands, null when unpriced", () => {
    expect(formatPrice(card([{ tcgplayer_price: "0.42" }]))).toBe("$0.42");
    expect(formatPrice(card([{ tcgplayer_price: "1500" }]))).toBe("$1.5k");
    expect(formatPrice(card(undefined))).toBeNull();
  });
});
