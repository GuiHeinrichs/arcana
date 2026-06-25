"use client";

import { useState } from "react";
import { CardDetailSheet } from "@/components/card-detail-sheet";
import { GRID, HoloCard } from "@/components/holo-card";
import type { Card } from "@/lib/ygoprodeck";

/** A plain grid of cards that opens the shared detail sheet on select. Used
 *  where the full set is already in hand (no pagination), e.g. an archetype. */
export function CardGrid({ cards }: { cards: Card[] }) {
  const [selected, setSelected] = useState<Card | null>(null);
  return (
    <>
      <ul className={`${GRID} list-none`}>
        {cards.map((card, i) => (
          <li key={card.id}>
            <HoloCard card={card} index={i} onSelect={setSelected} />
          </li>
        ))}
      </ul>
      <CardDetailSheet card={selected} onClose={() => setSelected(null)} />
    </>
  );
}
