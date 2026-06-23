"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  addCard,
  defaultZone,
  EMPTY_DECK,
  isLegal,
  LIMITS,
  loadDeck,
  removeCard,
  saveDeck,
  totalCopies,
  ZONE_LABELS,
  zoneStatus,
  type Deck,
  type DeckEntry,
  type DeckZone,
} from "@/lib/deck";
import type { Card, CardPage } from "@/lib/ygoprodeck";
import { SearchIcon, SpinnerIcon } from "@/components/icons";

type Target = "auto" | "side";

export function DeckBuilder() {
  const [deck, setDeck] = useState<Deck>(EMPTY_DECK);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target>("auto");

  // Load any saved deck after mount (keeps SSR markup === first client render;
  // localStorage is client-only).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(loadDeck());
  }, []);

  // Autosave on every change.
  useEffect(() => {
    saveDeck(deck);
  }, [deck]);

  // Debounced search against our same-origin card route. All state updates live
  // inside the timer callback (asynchronous), so none run synchronously during
  // the effect.
  useEffect(() => {
    const q = term.trim();
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/cards?q=${encodeURIComponent(q)}&sort=name`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const page = (await res.json()) as CardPage;
        setResults(page.cards);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, q.length < 2 ? 0 : 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term]);

  function handleAdd(card: Card) {
    const zone: DeckZone = target === "side" ? "side" : defaultZone(card);
    setDeck((d) => addCard(d, card, zone));
  }

  const legal = isLegal(deck);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Search ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
        <div className="flex flex-col gap-3">
          <label className="relative block">
            <SearchIcon
              width={18}
              height={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search cards by name…"
              className="w-full rounded-full border border-hairline-strong bg-surface/60 py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-faint focus:border-amber focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-2 text-xs">
            <span className="tech text-faint">Add to</span>
            {(["auto", "side"] as Target[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTarget(t)}
                aria-pressed={target === t}
                className={`rounded-full px-3 py-1 font-display font-medium uppercase tracking-wide transition-colors ${
                  target === t
                    ? "bg-amber text-amber-ink"
                    : "border border-hairline-strong text-muted hover:border-amber hover:text-amber"
                }`}
              >
                {t === "auto" ? "Main / Extra" : "Side"}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-hairline bg-surface/30 p-3">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <SpinnerIcon width={16} height={16} /> Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="px-2 py-10 text-center text-sm text-faint">
              {term.trim().length < 2
                ? "Type at least 2 letters to search the card library."
                : `No cards match “${term.trim()}”.`}
            </p>
          ) : (
            <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2">
              {results.map((card) => {
                const atLimit = totalCopies(deck, card.id) >= LIMITS.copies;
                return (
                  <li key={card.id}>
                    <Tile
                      card={card}
                      action="Add"
                      disabled={atLimit}
                      onClick={() => handleAdd(card)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Deck ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-display text-xs font-semibold uppercase tracking-wide ${
              legal
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-amber/15 text-amber"
            }`}
          >
            {legal ? "Legal deck" : "Incomplete"}
          </span>
          <button
            type="button"
            onClick={() => setDeck(EMPTY_DECK)}
            className="font-mono text-xs uppercase tracking-wider text-faint transition-colors hover:text-amber"
          >
            Clear deck
          </button>
        </div>

        {(["main", "extra", "side"] as DeckZone[]).map((zone) => (
          <Zone
            key={zone}
            zone={zone}
            entries={deck[zone]}
            status={zoneStatus(deck, zone)}
            onRemove={(id) => setDeck((d) => removeCard(d, id, zone))}
          />
        ))}
      </section>
    </div>
  );
}

function Zone({
  zone,
  entries,
  status,
  onRemove,
}: {
  zone: DeckZone;
  entries: DeckEntry[];
  status: { count: number; valid: boolean };
  onRemove: (id: number) => void;
}) {
  const { min, max } = LIMITS[zone];
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          {ZONE_LABELS[zone]}
        </h2>
        <span
          className={`font-mono text-xs tabular-nums ${
            status.valid ? "text-faint" : "text-amber"
          }`}
        >
          {status.count}
          {zone === "main" ? `/${min}–${max}` : `/${max}`}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline px-3 py-6 text-center text-xs text-faint">
          Empty
        </p>
      ) : (
        <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5">
          {entries.map((entry) => (
            <li key={entry.card.id}>
              <Tile
                card={entry.card}
                count={entry.count}
                action="Remove one"
                onClick={() => onRemove(entry.card.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tile({
  card,
  count,
  action,
  disabled = false,
  onClick,
}: {
  card: Card;
  count?: number;
  action: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const art = card.card_images[0];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={card.name}
      aria-label={`${action}: ${card.name}`}
      className="group relative block aspect-[59/86] w-full overflow-hidden rounded-[5px] bg-surface ring-1 ring-hairline transition-transform hover:-translate-y-0.5 hover:ring-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:ring-hairline"
    >
      {art ? (
        <Image
          src={art.image_url_small}
          alt={card.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full items-center justify-center p-1 text-center text-[0.5rem] text-muted">
          {card.name}
        </span>
      )}
      {count && count > 1 ? (
        <span className="absolute bottom-0 right-0 rounded-tl-[5px] bg-black/80 px-1 font-mono text-[0.6rem] font-bold tabular-nums text-amber">
          ×{count}
        </span>
      ) : null}
    </button>
  );
}
