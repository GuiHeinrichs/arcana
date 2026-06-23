"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  isDefaultQuery,
  type Card,
  type CardPage,
  type CardQuery,
} from "@/lib/ygoprodeck";
import { HoloCard, HoloCardSkeleton } from "@/components/holo-card";
import { CardDetailSheet } from "@/components/card-detail-sheet";
import { AlertIcon, SparkIcon, SpinnerIcon } from "@/components/icons";

const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(clamp(8.5rem,22vw,11.5rem),1fr))] gap-x-4 gap-y-8";

export function Gallery({
  initial,
  query,
}: {
  initial: CardPage;
  query: CardQuery;
}) {
  const [cards, setCards] = useState<Card[]>(initial.cards);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        q: query.q,
        kind: query.kind,
        sort: query.sort,
        offset: String(cards.length),
      });
      if (query.attribute) params.set("attribute", query.attribute);

      const res = await fetch(`/api/cards?${params.toString()}`);
      if (!res.ok) throw new Error("request failed");
      const page = (await res.json()) as CardPage;

      setCards((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...page.cards.filter((c) => !seen.has(c.id))];
      });
      setHasMore(page.hasMore);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cards.length, query]);

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (cards.length === 0) {
    return <EmptyState clearable={!isDefaultQuery(query)} query={query} />;
  }

  return (
    <>
      <ul className={`${GRID} list-none`}>
        {cards.map((card, i) => (
          <li key={card.id}>
            <HoloCard card={card} index={i} onSelect={setSelected} />
          </li>
        ))}
      </ul>

      {loading && (
        <ul className={`${GRID} mt-8 list-none`} aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <HoloCardSkeleton />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-px w-full" />

      <div className="mt-12 flex flex-col items-center gap-3" aria-live="polite">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="flex items-center gap-2 text-sm text-muted">
              <AlertIcon width={18} height={18} className="text-amber" />
              Something interrupted the gallery.
            </p>
            <button
              type="button"
              onClick={loadMore}
              className="rounded-full bg-amber px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide text-amber-ink transition-[filter] hover:brightness-105"
            >
              Try again
            </button>
          </div>
        ) : hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-ink transition-colors hover:border-amber hover:text-amber disabled:opacity-60"
          >
            {loading && <SpinnerIcon width={16} height={16} />}
            {loading ? "Summoning…" : "Load more cards"}
          </button>
        ) : (
          <p className="tech text-faint">
            終 · all {cards.length.toLocaleString()} on display
          </p>
        )}
      </div>

      <CardDetailSheet card={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function EmptyState({
  clearable,
  query,
}: {
  clearable: boolean;
  query: CardQuery;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-hairline-strong px-6 py-24 text-center">
      <span
        className="grid size-14 place-items-center rounded-full text-amber"
        style={{ background: "var(--amber-veil)" }}
      >
        <SparkIcon width={26} height={26} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
          No cards on this wall
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          {query.q
            ? `Nothing matches “${query.q}”. Try a shorter or different name`
            : "No cards match these filters"}
          {clearable
            ? " — or clear the filters to roam the whole collection."
            : ". Try searching by name to find a specific card."}
        </p>
      </div>
      {clearable && (
        <Link
          href="/"
          className="rounded-full bg-amber px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide text-amber-ink transition-[filter] hover:brightness-105"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
