"use client";

import { HoloCard } from "@/components/holo-card";
import { formatCount, metricLabel, type RankedCard, type TopLens } from "@/lib/top-cards";
import type { Card } from "@/lib/ygoprodeck";

// Visual ordering puts #1 in the centre, #2 left, #3 right, while the DOM keeps
// rank order (1,2,3) so screen readers and keyboard users meet the winner first.
const VISUAL_ORDER = ["order-2", "order-1", "order-3"];
const SELF_ALIGN = ["self-start", "self-end", "self-end"];

export function Podium({
  cards,
  lens,
  onSelect,
}: {
  cards: RankedCard[];
  lens: TopLens;
  onSelect: (card: Card) => void;
}) {
  if (cards.length === 0) return null;
  const top = cards.slice(0, 3);

  return (
    <ul className="mb-12 flex list-none items-end justify-center gap-3 sm:gap-6">
      {top.map((rc, i) => (
        <li
          key={rc.card.id}
          className={[
            VISUAL_ORDER[i],
            SELF_ALIGN[i],
            i === 0 ? "w-[42%] max-w-[18rem]" : "w-[29%] max-w-[12rem]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <HoloCard
            card={rc.card}
            onSelect={onSelect}
            rank={rc.rank}
            metric={`${formatCount(rc.metric)} ${metricLabel(lens)}`}
          />
        </li>
      ))}
    </ul>
  );
}
