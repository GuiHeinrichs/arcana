"use client";

import { useRef, useState } from "react";
import { CardDetailSheet } from "@/components/card-detail-sheet";
import { GRID, HoloCard } from "@/components/holo-card";
import { Podium } from "@/components/podium";
import { formatCount, metricLabel, type RankedCard, type TopLens } from "@/lib/top-cards";
import type { Card } from "@/lib/ygoprodeck";

const TABS: { lens: TopLens; label: string }[] = [
  { lens: "week", label: "Em alta" },
  { lens: "views", label: "Mais vistas" },
  { lens: "likes", label: "Curtidas" },
  { lens: "staples", label: "Staples" },
];

export function TopCards({
  initialLens,
  lenses,
}: {
  initialLens: TopLens;
  lenses: Record<TopLens, RankedCard[]>;
}) {
  const [active, setActive] = useState<TopLens>(initialLens);
  const [selected, setSelected] = useState<Card | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cards = lenses[active];
  const rest = cards.slice(3);

  function selectLens(lens: TopLens) {
    setActive(lens);
    // Update the URL without a server round-trip or scroll jump (data is in memory).
    window.history.replaceState(null, "", lens === "week" ? "/top" : `/top?lens=${lens}`);
  }

  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + TABS.length) % TABS.length;
    selectLens(TABS[next].lens);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Top cards lenses"
        className="mb-10 flex flex-wrap gap-2 border-b border-hairline pb-3"
      >
        {TABS.map((tab, i) => {
          const isActive = tab.lens === active;
          return (
            <button
              key={tab.lens}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`top-tab-${tab.lens}`}
              aria-selected={isActive}
              aria-controls="top-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectLens(tab.lens)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={`rounded-full px-4 py-1.5 font-display text-sm font-medium uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-amber text-amber-ink"
                  : "border border-hairline-strong text-muted hover:border-amber hover:text-amber"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id="top-panel" role="tabpanel" aria-labelledby={`top-tab-${active}`}>
        {cards.length === 0 ? (
          <p className="border border-dashed border-hairline-strong px-6 py-24 text-center text-sm text-muted">
            Ranking indisponível no momento — tente novamente mais tarde.
          </p>
        ) : (
          <>
            <Podium cards={cards} lens={active} onSelect={setSelected} />
            {rest.length > 0 && (
              <ul className={`${GRID} list-none`}>
                {rest.map((rc) => (
                  <li key={rc.card.id}>
                    <HoloCard
                      card={rc.card}
                      onSelect={setSelected}
                      rank={rc.rank}
                      metric={`${formatCount(rc.metric)} ${metricLabel(active)}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <CardDetailSheet card={selected} onClose={() => setSelected(null)} />
    </>
  );
}
