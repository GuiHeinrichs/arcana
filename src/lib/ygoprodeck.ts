/**
 * YGOPRODeck card data access.
 *
 * The API has no CORS and a ~20 req/s rate limit (CLAUDE.md), so every call is
 * made server-side and cached through Next's data cache. Card data is
 * near-static, so we revalidate daily. Clients paginate through our own
 * `/api/cards` route, never the upstream API directly.
 */

const API = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
const REVALIDATE = 60 * 60 * 24; // 1 day

export const PAGE_SIZE = 36;

// ---- Public option sets (drive the filter UI) ------------------------------

export const KINDS = [
  { value: "all", label: "All" },
  { value: "monster", label: "Monsters" },
  { value: "spell", label: "Spells" },
  { value: "trap", label: "Traps" },
] as const;
export type KindValue = (typeof KINDS)[number]["value"];

export const SORTS = [
  { value: "name", label: "Name" },
  { value: "atk", label: "ATK" },
  { value: "def", label: "DEF" },
  { value: "level", label: "Level" },
  { value: "new", label: "Newest" },
] as const;
export type SortValue = (typeof SORTS)[number]["value"];

export const ATTRIBUTES = [
  { value: "DARK", label: "Dark", token: "--attr-dark" },
  { value: "LIGHT", label: "Light", token: "--attr-light" },
  { value: "FIRE", label: "Fire", token: "--attr-fire" },
  { value: "WATER", label: "Water", token: "--attr-water" },
  { value: "EARTH", label: "Earth", token: "--attr-earth" },
  { value: "WIND", label: "Wind", token: "--attr-wind" },
  { value: "DIVINE", label: "Divine", token: "--attr-divine" },
] as const;
export type AttributeValue = (typeof ATTRIBUTES)[number]["value"];

const ATTRIBUTE_SET = new Set<string>(ATTRIBUTES.map((a) => a.value));
const KIND_SET = new Set<string>(KINDS.map((k) => k.value));
const SORT_SET = new Set<string>(SORTS.map((s) => s.value));

// Every monster `type` string the API exposes — joined into one comma query so
// the "Monsters" bucket includes every frame, not just plain Effect monsters.
const MONSTER_TYPES = [
  "Normal Monster",
  "Normal Tuner Monster",
  "Effect Monster",
  "Flip Effect Monster",
  "Flip Tuner Effect Monster",
  "Gemini Monster",
  "Spirit Monster",
  "Toon Monster",
  "Tuner Monster",
  "Union Effect Monster",
  "Pendulum Effect Monster",
  "Pendulum Normal Monster",
  "Pendulum Tuner Effect Monster",
  "Pendulum Flip Effect Monster",
  "Pendulum Effect Ritual Monster",
  "Ritual Monster",
  "Ritual Effect Monster",
  "Fusion Monster",
  "Pendulum Effect Fusion Monster",
  "Synchro Monster",
  "Synchro Tuner Monster",
  "Synchro Pendulum Effect Monster",
  "XYZ Monster",
  "XYZ Pendulum Effect Monster",
  "Link Monster",
].join(",");

// ---- Types -----------------------------------------------------------------

export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface MiscInfo {
  views?: number;
  viewsweek?: number;
  upvotes?: number;
  downvotes?: number;
}

export interface Card {
  id: number;
  name: string;
  type: string;
  humanReadableCardType: string;
  frameType: string;
  desc: string;
  race: string;
  archetype?: string;
  typeline?: string[];
  ygoprodeck_url?: string;
  atk?: number;
  def?: number | null;
  level?: number;
  attribute?: string;
  linkval?: number;
  linkmarkers?: string[];
  scale?: number;
  card_images: CardImage[];
  misc_info?: MiscInfo[];
}

export interface CardQuery {
  q: string;
  kind: KindValue;
  attribute: AttributeValue | null;
  sort: SortValue;
}

export interface CardPage {
  cards: Card[];
  total: number;
  offset: number;
  hasMore: boolean;
}

export const DEFAULT_QUERY: CardQuery = {
  q: "",
  kind: "all",
  attribute: null,
  sort: "name",
};

/**
 * Normalise an arbitrary param reader into a validated CardQuery. Shared by the
 * page (awaited searchParams) and the `/api/cards` route (URLSearchParams).
 */
export function parseCardQuery(get: (key: string) => string | null): CardQuery {
  const kind = get("kind");
  const sort = get("sort");
  const attribute = get("attribute");
  return {
    q: (get("q") ?? "").trim().slice(0, 80),
    kind: kind && KIND_SET.has(kind) ? (kind as KindValue) : "all",
    sort: sort && SORT_SET.has(sort) ? (sort as SortValue) : "name",
    attribute:
      attribute && ATTRIBUTE_SET.has(attribute)
        ? (attribute as AttributeValue)
        : null,
  };
}

/** Stable string used to key/cache a query (excludes pagination offset). */
export function queryKey(query: CardQuery): string {
  return `${query.kind}|${query.attribute ?? ""}|${query.sort}|${query.q}`;
}

export function isDefaultQuery(query: CardQuery): boolean {
  return queryKey(query) === queryKey(DEFAULT_QUERY);
}

const EMPTY: Omit<CardPage, "offset"> = {
  cards: [],
  total: 0,
  hasMore: false,
};

export async function searchCards(
  query: CardQuery,
  offset = 0,
): Promise<CardPage> {
  const params = new URLSearchParams({
    num: String(PAGE_SIZE),
    offset: String(Math.max(0, offset)),
    sort: query.sort,
  });

  if (query.q) params.set("fname", query.q);
  if (query.attribute) params.set("attribute", query.attribute);

  if (query.kind === "monster") params.set("type", MONSTER_TYPES);
  else if (query.kind === "spell") params.set("type", "Spell Card");
  else if (query.kind === "trap") params.set("type", "Trap Card");

  const res = await fetch(`${API}?${params.toString()}`, {
    next: { revalidate: REVALIDATE, tags: ["ygo-cards"] },
    headers: { Accept: "application/json" },
  });

  // The API answers an empty/garbled query with 400 + { error }. Treat that as
  // "no results" rather than a failure, so the UI shows its empty state.
  if (res.status === 400) return { ...EMPTY, offset };
  if (!res.ok) {
    throw new Error(`YGOPRODeck responded ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: Card[];
    meta?: { total_rows?: number };
    error?: string;
  };

  if (json.error || !json.data) return { ...EMPTY, offset };

  const cards = json.data;
  const total = json.meta?.total_rows ?? cards.length;
  return {
    cards,
    total,
    offset,
    hasMore: offset + cards.length < total,
  };
}

// ---- Display helpers --------------------------------------------------------

export interface FrameMeta {
  label: string;
  token: string;
}

const FRAME_META: Record<string, FrameMeta> = {
  normal: { label: "Normal", token: "--frame-normal" },
  effect: { label: "Effect", token: "--frame-effect" },
  ritual: { label: "Ritual", token: "--frame-ritual" },
  fusion: { label: "Fusion", token: "--frame-fusion" },
  synchro: { label: "Synchro", token: "--frame-synchro" },
  xyz: { label: "Xyz", token: "--frame-xyz" },
  link: { label: "Link", token: "--frame-link" },
  spell: { label: "Spell", token: "--frame-spell" },
  trap: { label: "Trap", token: "--frame-trap" },
  normal_pendulum: { label: "Pendulum", token: "--frame-normal" },
  effect_pendulum: { label: "Pendulum", token: "--frame-effect" },
  ritual_pendulum: { label: "Pendulum", token: "--frame-ritual" },
  fusion_pendulum: { label: "Pendulum", token: "--frame-fusion" },
  synchro_pendulum: { label: "Pendulum", token: "--frame-synchro" },
  xyz_pendulum: { label: "Pendulum", token: "--frame-xyz" },
  token: { label: "Token", token: "--frame-normal" },
  skill: { label: "Skill", token: "--frame-link" },
};

export function frameMeta(frameType: string): FrameMeta {
  return FRAME_META[frameType] ?? { label: "Card", token: "--frame-normal" };
}

export function attributeMeta(attribute: string | undefined) {
  return ATTRIBUTES.find((a) => a.value === attribute) ?? null;
}

/** ATK/DEF: the API uses -1 for the "?" stat and null where it doesn't apply. */
export function formatStat(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value < 0) return "?";
  return String(value);
}

/** Monsters count by Level, Xyz by Rank, Link by Link rating. */
export function rankLabel(
  card: Card,
): { label: string; value: string } | null {
  if (card.frameType === "link" && card.linkval != null) {
    return { label: "Link", value: `LINK-${card.linkval}` };
  }
  if (card.frameType.startsWith("xyz") && card.level != null) {
    return { label: "Rank", value: String(card.level) };
  }
  if (card.level != null && card.level > 0) {
    return { label: "Level", value: String(card.level) };
  }
  return null;
}
