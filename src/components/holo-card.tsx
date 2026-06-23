"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import { attributeMeta, frameMeta, type Card } from "@/lib/ygoprodeck";

export const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(clamp(8.5rem,22vw,11.5rem),1fr))] gap-x-4 gap-y-8";

function accessibleName(card: Card): string {
  const attr = attributeMeta(card.attribute);
  const parts = [card.name, card.humanReadableCardType];
  if (attr) parts.push(`${attr.label} attribute`);
  return parts.join(", ");
}

/**
 * Holographic, pointer-reactive card. The art tilts in 3D toward the cursor
 * while a rainbow foil and a specular glare track the pointer — the collectible
 * "holo card" effect. Tilt is enabled only for fine pointers (mouse/pen) and is
 * fully disabled under prefers-reduced-motion (see .holo in globals.css).
 */
export function HoloCard({
  card,
  index = 0,
  onSelect,
  animate = true,
  rank,
  metric,
  price,
}: {
  card: Card;
  index?: number;
  onSelect: (card: Card) => void;
  animate?: boolean;
  rank?: number;
  metric?: string;
  price?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const art = card.card_images[0];
  const frame = frameMeta(card.frameType);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 15}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 15}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
    el.style.setProperty("--active", "1");
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--active", "0");
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className={`group block w-full cursor-pointer rounded-[10px] text-left transition-transform duration-300 ease-[var(--ease-out-quint)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus:outline-none ${
        animate ? "reveal" : ""
      }`}
      style={
        animate
          ? { animationDelay: `${Math.min(index, 11) * 35}ms` }
          : undefined
      }
    >
      <span className="sr-only">
        View {card.name}
        {rank !== undefined && `, Rank ${rank}`}
        {metric && `, ${metric}`}
        {price && `, ${price}`}
      </span>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="holo relative aspect-[59/86] overflow-hidden rounded-[10px] bg-surface shadow-[var(--shadow-tile)] ring-1 ring-hairline group-hover:shadow-[var(--shadow-lift)] group-hover:ring-[oklch(0.82_0.15_78/0.45)] group-focus-visible:ring-amber"
      >
        {art ? (
          <Image
            src={art.image_url}
            alt={accessibleName(card)}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 768px) 30vw, (max-width: 1200px) 22vw, 200px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
            {card.name}
          </span>
        )}

        <span aria-hidden className="holo-foil pointer-events-none absolute inset-0" />
        <span aria-hidden className="holo-glare pointer-events-none absolute inset-0" />

        {rank !== undefined && (
          <span
            aria-hidden
            className="absolute left-2 top-2 rounded-[4px] bg-black/65 px-1.5 py-0.5 font-display text-[0.72rem] font-bold tracking-wide text-amber backdrop-blur-sm"
          >
            #{rank}
          </span>
        )}
        {metric && (
          <span
            aria-hidden
            className="absolute right-2 top-2 rounded-[4px] bg-black/65 px-1.5 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-ink/90 backdrop-blur-sm"
          >
            {metric}
          </span>
        )}
        {price && (
          <span
            aria-hidden
            className="absolute bottom-2 left-2 z-10 rounded-[4px] bg-black/70 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium tracking-wide text-emerald-300 backdrop-blur-sm"
          >
            {price}
          </span>
        )}

        {/* Caption reveals on hover/focus; the art leads by default. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-1 flex-col gap-1 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2.5 pb-2.5 pt-8 opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-out-quint)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <span className="line-clamp-2 font-display text-[0.8rem] font-medium uppercase leading-tight tracking-wide text-white">
            {card.name}
          </span>
          <span
            className="tech !text-[0.58rem]"
            style={{ color: `var(${frame.token})` }}
          >
            {frame.label}
          </span>
        </span>
      </div>
    </button>
  );
}

export function HoloCardSkeleton() {
  return <div className="skeleton aspect-[59/86] rounded-[10px]" />;
}
