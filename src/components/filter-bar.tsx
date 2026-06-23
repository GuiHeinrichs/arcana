"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ATTRIBUTES,
  DEFAULT_QUERY,
  KINDS,
  SORTS,
  type CardQuery,
} from "@/lib/ygoprodeck";
import { ChevronDownIcon, CloseIcon, SearchIcon } from "@/components/icons";

export function FilterBar({ query }: { query: CardQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q);

  useEffect(() => setText(query.q), [query.q]);

  useEffect(() => {
    if (text === query.q) return;
    const t = setTimeout(() => apply({ q: text }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  function apply(partial: Partial<CardQuery>) {
    const next: CardQuery = { ...query, ...partial };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.kind !== DEFAULT_QUERY.kind) params.set("kind", next.kind);
    if (next.attribute) params.set("attribute", next.attribute);
    if (next.sort !== DEFAULT_QUERY.sort) params.set("sort", next.sort);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/?${qs}` : "/", { scroll: false }));
  }

  return (
    <div className="relative flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search the collection by name…"
          aria-label="Search cards by name"
          enterKeyHint="search"
          className="h-12 w-full rounded-[5px] border border-hairline-strong bg-surface/70 pl-12 pr-11 text-[0.95rem] text-ink placeholder:text-faint focus:border-amber focus:outline-none focus-visible:outline-none"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[4px] text-muted transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <CloseIcon width={16} height={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Kind */}
        <div
          role="group"
          aria-label="Card kind"
          className="no-scrollbar -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1"
        >
          {KINDS.map((k) => {
            const active = query.kind === k.value;
            return (
              <button
                key={k.value}
                type="button"
                aria-pressed={active}
                onClick={() => apply({ kind: k.value })}
                className={`shrink-0 rounded-[4px] px-4 py-1.5 font-display text-sm font-medium uppercase tracking-wide transition-colors ${
                  active
                    ? "bg-amber text-amber-ink"
                    : "border border-hairline text-muted hover:border-hairline-strong hover:text-ink"
                }`}
              >
                {k.label}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <label className="ml-auto flex items-center gap-2">
          <span className="tech hidden text-faint sm:inline">Sort</span>
          <span className="relative">
            <select
              value={query.sort}
              onChange={(e) => apply({ sort: e.target.value as CardQuery["sort"] })}
              aria-label="Sort cards"
              className="appearance-none rounded-[4px] border border-hairline bg-surface/70 py-1.5 pl-3 pr-9 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-hairline-strong focus:border-amber focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              width={16}
              height={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
          </span>
        </label>
      </div>

      {/* Attribute */}
      <div
        role="group"
        aria-label="Filter by attribute"
        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
      >
        {ATTRIBUTES.map((a) => {
          const active = query.attribute === a.value;
          return (
            <button
              key={a.value}
              type="button"
              aria-pressed={active}
              onClick={() => apply({ attribute: active ? null : a.value })}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                active
                  ? "border-transparent text-ink"
                  : "border-hairline text-muted hover:border-hairline-strong hover:text-ink"
              }`}
              style={
                active
                  ? {
                      background: `color-mix(in oklch, var(${a.token}) 18%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(${a.token}) 55%, transparent)`,
                    }
                  : undefined
              }
            >
              <span aria-hidden className="size-2 rounded-[1px]" style={{ background: `var(${a.token})` }} />
              {a.label}
            </button>
          );
        })}
      </div>

      {/* Navigation progress while a filter change re-renders the gallery. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-px left-0 h-px bg-gradient-to-r from-transparent via-amber to-transparent transition-[width,opacity] duration-500 ${
          pending ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
