"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AttributeChip, FrameChip } from "@/components/chips";
import { formatPrice } from "@/lib/card-price";
import { attributeMeta, formatStat, rankLabel, type Card } from "@/lib/ygoprodeck";

const GAP = 10;
const EDGE = 8;

/**
 * Floating, read-only preview of a full card, anchored to a hovered/focused
 * tile. Rendered through a portal with `position: fixed` so it escapes the
 * deck/search panels' `overflow` clipping, and flips/clamps to stay on screen.
 * Purely visual (`aria-hidden`) — the trigger carries the same facts in its
 * accessible name via `cardSummary`.
 */
export function CardHoverCard({ card, anchor }: { card: Card; anchor: DOMRect }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Prefer the right of the tile; fall back to the left; otherwise clamp.
    let left = anchor.right + GAP;
    if (left + width > vw - EDGE) left = anchor.left - GAP - width;
    if (left < EDGE) left = Math.min(Math.max(EDGE, anchor.left), vw - width - EDGE);

    // Align near the tile's top, then clamp within the viewport.
    const top = Math.min(Math.max(EDGE, anchor.top), vh - height - EDGE);

    setPos({ left, top });
  }, [anchor, card.id]);

  const isMonster = card.atk !== undefined;
  const stats = rankLabel(card);
  const attr = attributeMeta(card.attribute);
  const price = formatPrice(card);
  const art = card.card_images[0];

  return createPortal(
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[var(--z-tooltip)] w-[21rem] max-w-[calc(100vw-1rem)]"
      style={{
        transform: pos ? `translate(${pos.left}px, ${pos.top}px)` : undefined,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div className="grain animate-[reveal_0.14s_var(--ease-out-quint)] overflow-hidden rounded-xl border border-hairline-strong bg-surface-2/95 shadow-[var(--shadow-lift)] backdrop-blur-xl">
        <div className="flex gap-3 p-3.5">
          {art && (
            <div className="relative aspect-[59/86] w-[5.25rem] shrink-0 overflow-hidden rounded-md ring-1 ring-hairline">
              <Image
                src={art.image_url_small}
                alt=""
                fill
                sizes="84px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="text-balance font-serif text-[1.05rem] leading-tight text-ink">
              {card.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <FrameChip card={card} />
              {attr && <AttributeChip attribute={card.attribute} />}
              <span className="inline-flex items-center rounded-[3px] border border-hairline bg-surface/60 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
                {card.race}
              </span>
            </div>
            {isMonster && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[0.7rem] text-faint">
                {stats && (
                  <span>
                    {stats.label} <span className="text-ink">{stats.value}</span>
                  </span>
                )}
                <span>
                  ATK <span className="text-ink">{formatStat(card.atk)}</span>
                </span>
                {card.frameType !== "link" && (
                  <span>
                    DEF <span className="text-ink">{formatStat(card.def)}</span>
                  </span>
                )}
                {card.scale != null && (
                  <span>
                    Scale <span className="text-ink">{card.scale}</span>
                  </span>
                )}
              </div>
            )}
            {price && (
              <span className="font-mono text-[0.72rem] font-medium text-emerald-300">
                {price}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-hairline px-3.5 pb-3.5 pt-2.5">
          <p className="tech mb-1 text-amber">{isMonster ? "Card Text" : "Effect"}</p>
          <p className="line-clamp-[10] whitespace-pre-line text-[0.78rem] leading-relaxed text-muted">
            {card.desc}
          </p>
          {card.archetype && (
            <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-wider text-faint">
              Archetype <span className="text-ink">{card.archetype}</span>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Compact spoken summary of a card for a trigger's accessible name, so the
 *  facts in the visual hover card are also available to screen-reader users. */
export function cardSummary(card: Card): string {
  const parts: string[] = [card.humanReadableCardType];
  const attr = attributeMeta(card.attribute);
  if (attr) parts.push(attr.label);
  const stats = rankLabel(card);
  if (stats) parts.push(`${stats.label} ${stats.value}`);
  if (card.atk !== undefined) {
    parts.push(`ATK ${formatStat(card.atk)}`);
    if (card.frameType !== "link") parts.push(`DEF ${formatStat(card.def)}`);
  }
  const price = formatPrice(card);
  if (price) parts.push(`${price} market`);
  return parts.join(", ");
}
