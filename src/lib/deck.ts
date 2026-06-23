import type { Card } from "@/lib/ygoprodeck";

/**
 * Client-side deck model. Decks live in the browser (localStorage) for now —
 * Neon persistence is deferred (see CLAUDE.md). The 3-copy limit is enforced
 * across the whole deck (main + extra + side) by card id.
 */

export type DeckZone = "main" | "extra" | "side";

export interface DeckEntry {
  card: Card;
  count: number;
}

export interface Deck {
  main: DeckEntry[];
  extra: DeckEntry[];
  side: DeckEntry[];
}

export const EMPTY_DECK: Deck = { main: [], extra: [], side: [] };

export const LIMITS: Record<DeckZone, { min: number; max: number }> & {
  copies: number;
} = {
  main: { min: 40, max: 60 },
  extra: { min: 0, max: 15 },
  side: { min: 0, max: 15 },
  copies: 3,
};

export const ZONE_LABELS: Record<DeckZone, string> = {
  main: "Main Deck",
  extra: "Extra Deck",
  side: "Side Deck",
};

// Fusion/Synchro/Xyz/Link cards (and their Pendulum variants) live in the Extra
// Deck; everything else — including plain Pendulum monsters — is a Main card.
const EXTRA_FRAMES = new Set([
  "fusion",
  "synchro",
  "xyz",
  "link",
  "fusion_pendulum",
  "synchro_pendulum",
  "xyz_pendulum",
]);

export function isExtraDeckCard(card: Card): boolean {
  return EXTRA_FRAMES.has(card.frameType);
}

/** Where a card lands when added automatically (the Side deck is opt-in). */
export function defaultZone(card: Card): Exclude<DeckZone, "side"> {
  return isExtraDeckCard(card) ? "extra" : "main";
}

export function zoneCount(entries: DeckEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.count, 0);
}

export function totalCopies(deck: Deck, id: number): number {
  return (["main", "extra", "side"] as const).reduce((sum, zone) => {
    const entry = deck[zone].find((e) => e.card.id === id);
    return sum + (entry ? entry.count : 0);
  }, 0);
}

/** Whether another copy of `card` can be added to `zone` (copy + size limits). */
export function canAdd(deck: Deck, card: Card, zone: DeckZone): boolean {
  if (totalCopies(deck, card.id) >= LIMITS.copies) return false;
  if (zoneCount(deck[zone]) >= LIMITS[zone].max) return false;
  return true;
}

export function addCard(deck: Deck, card: Card, zone: DeckZone): Deck {
  if (!canAdd(deck, card, zone)) return deck;
  const entries = deck[zone];
  const existing = entries.find((e) => e.card.id === card.id);
  const next = existing
    ? entries.map((e) =>
        e.card.id === card.id ? { ...e, count: e.count + 1 } : e,
      )
    : [...entries, { card, count: 1 }];
  return { ...deck, [zone]: next };
}

export function removeCard(deck: Deck, id: number, zone: DeckZone): Deck {
  const entries = deck[zone];
  const existing = entries.find((e) => e.card.id === id);
  if (!existing) return deck;
  const next =
    existing.count > 1
      ? entries.map((e) => (e.card.id === id ? { ...e, count: e.count - 1 } : e))
      : entries.filter((e) => e.card.id !== id);
  return { ...deck, [zone]: next };
}

export interface ZoneStatus {
  count: number;
  valid: boolean;
}

export function zoneStatus(deck: Deck, zone: DeckZone): ZoneStatus {
  const count = zoneCount(deck[zone]);
  const { min, max } = LIMITS[zone];
  return { count, valid: count >= min && count <= max };
}

/** A deck is legal when all three zones are within their bounds. */
export function isLegal(deck: Deck): boolean {
  return (["main", "extra", "side"] as const).every(
    (zone) => zoneStatus(deck, zone).valid,
  );
}

// ---- Persistence (localStorage) -------------------------------------------

const STORAGE_KEY = "arcana:deck";

export function loadDeck(): Deck {
  if (typeof window === "undefined") return EMPTY_DECK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DECK;
    const parsed = JSON.parse(raw) as Partial<Deck>;
    if (!parsed?.main || !parsed.extra || !parsed.side) return EMPTY_DECK;
    return { main: parsed.main, extra: parsed.extra, side: parsed.side };
  } catch {
    return EMPTY_DECK;
  }
}

export function saveDeck(deck: Deck): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
  } catch {
    /* quota / private mode — deck just won't persist */
  }
}
