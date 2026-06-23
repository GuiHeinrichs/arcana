"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import {
  attributeMeta,
  formatStat,
  rankLabel,
  type Card,
} from "@/lib/ygoprodeck";
import { AttributeChip, FrameChip } from "@/components/chips";
import { CardInspector } from "@/components/card-inspector";
import {
  ArrowUpRightIcon,
  CloseIcon,
  ExpandIcon,
  ShieldIcon,
  SwordIcon,
} from "@/components/icons";

export function CardDetailSheet({
  card,
  onClose,
}: {
  card: Card | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const [inspect, setInspect] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (card && !dialog.open) {
      restoreFocusTo.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!card && dialog.open) {
      dialog.close();
    }
  }, [card]);

  function handleClose() {
    setInspect(false);
    onClose();
    restoreFocusTo.current?.focus?.();
  }

  function onMove(e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === "touch") return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
    el.style.setProperty("--active", "1");
  }
  function resetTilt() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--active", "0");
  }

  const stats = card ? rankLabel(card) : null;
  const isMonster = card ? card.atk !== undefined : false;
  const attr = card ? attributeMeta(card.attribute) : null;
  const art = card?.card_images[0];

  return (
    <>
    <dialog
      ref={ref}
      onClose={handleClose}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) handleClose();
      }}
      aria-label={card ? `${card.name} details` : "Card details"}
      className="m-0 ml-auto h-full max-h-none w-full max-w-[min(32rem,100vw)] bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-[2px] open:flex"
    >
      {card && (
        <div className="grain relative flex h-full w-full animate-[sheet-in_0.42s_var(--ease-out-quint)] flex-col overflow-y-auto border-l border-hairline-strong bg-surface shadow-[var(--shadow-sheet)]">
          {/* Treated card-art backdrop — the card's own art, blurred + amber-graded. */}
          {art && (
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <Image
                src={art.image_url_cropped}
                alt=""
                fill
                sizes="32rem"
                className="scale-125 object-cover opacity-25 blur-2xl"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.5 0.16 60 / 0.25), transparent 30%), linear-gradient(0deg, var(--surface) 22%, oklch(0.205 0.012 66 / 0.7))",
                }}
              />
            </div>
          )}

          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-hairline bg-surface/70 px-5 py-3 backdrop-blur-md">
            <span className="tech text-faint">Card Detail · 図鑑</span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close card detail"
              className="-mr-1 grid size-9 place-items-center rounded-[4px] text-muted transition-colors hover:bg-surface-3 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-col gap-6 px-5 pb-12 pt-7 sm:px-7">
            {art && (
              <div className="relative mx-auto w-full max-w-[17rem]">
                <div
                  aria-hidden
                  className="absolute inset-x-6 bottom-2 top-10 -z-10 blur-2xl"
                  style={{ background: "var(--amber-glow)" }}
                />
                <button
                  type="button"
                  ref={cardRef}
                  onClick={() => setInspect(true)}
                  onPointerMove={onMove}
                  onPointerLeave={resetTilt}
                  aria-label={`Inspect ${card.name} up close`}
                  className="holo group/card relative block aspect-[59/86] w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-hairline-strong shadow-[var(--shadow-lift)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                >
                  <Image
                    src={art.image_url}
                    alt={card.name}
                    fill
                    sizes="(max-width: 640px) 70vw, 272px"
                    className="object-cover"
                  />
                  <span aria-hidden className="holo-foil pointer-events-none absolute inset-0" />
                  <span aria-hidden className="holo-glare pointer-events-none absolute inset-0" />
                  <span
                    aria-hidden
                    className="absolute right-2 top-2 flex items-center gap-1 rounded-[4px] bg-black/55 px-2 py-1 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-ink/90 backdrop-blur-sm transition-transform group-hover/card:-translate-y-0.5"
                  >
                    <ExpandIcon width={12} height={12} /> Inspect
                  </span>
                </button>
              </div>
            )}

            <header className="flex flex-col gap-3">
              <h2 className="font-serif text-[1.7rem] leading-tight text-ink text-balance">
                {card.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <FrameChip card={card} />
                {attr && <AttributeChip attribute={card.attribute} />}
                <span className="inline-flex items-center rounded-[3px] border border-hairline bg-surface/60 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
                  {card.race}
                </span>
              </div>
            </header>

            {isMonster && (
              <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
                {stats && <Stat label={stats.label} value={stats.value} />}
                <Stat
                  label="ATK"
                  value={formatStat(card.atk)}
                  icon={<SwordIcon width={13} height={13} />}
                />
                {card.frameType !== "link" && (
                  <Stat
                    label="DEF"
                    value={formatStat(card.def)}
                    icon={<ShieldIcon width={13} height={13} />}
                  />
                )}
                {card.scale != null && <Stat label="Scale" value={String(card.scale)} />}
              </dl>
            )}

            <section className="flex flex-col gap-2">
              <h3 className="tech text-amber">{isMonster ? "Card Text" : "Effect"}</h3>
              <p className="max-w-[68ch] whitespace-pre-line text-[0.94rem] leading-relaxed text-muted">
                {card.desc}
              </p>
            </section>

            {card.archetype && (
              <p className="font-mono text-xs uppercase tracking-wider text-faint">
                Archetype{" "}
                <span className="font-medium text-ink">{card.archetype}</span>
              </p>
            )}

            {card.ygoprodeck_url && (
              <a
                href={card.ygoprodeck_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-[4px] border border-hairline-strong px-4 py-2 font-display text-sm font-medium uppercase tracking-wide text-ink transition-colors hover:border-amber hover:text-amber"
              >
                View on YGOPRODeck
                <ArrowUpRightIcon width={16} height={16} />
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>

      <CardInspector
        card={inspect && card ? card : null}
        onClose={() => setInspect(false)}
      />
    </>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 bg-surface/85 px-3 py-3">
      <dt className="flex items-center gap-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.14em] text-faint">
        {icon}
        {label}
      </dt>
      <dd className="font-display text-xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
