"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { ArrowDownIcon } from "@/components/icons";

const FEATURED = [
  { src: "/cards/dark-magician.jpg", name: "Dark Magician", rot: -11, x: "-58%", z: 10, dim: true },
  { src: "/cards/red-eyes.jpg", name: "Red-Eyes Black Dragon", rot: 11, x: "58%", z: 10, dim: true },
  { src: "/cards/blue-eyes.jpg", name: "Blue-Eyes White Dragon", rot: 0, x: "0%", z: 20, dim: false },
];

function useCountUp(target: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

function TiltCard({
  src,
  name,
  priority,
}: {
  src: string;
  name: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
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
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="holo relative aspect-[59/86] w-[min(64vw,17rem)] overflow-hidden rounded-xl shadow-[var(--shadow-lift)] ring-1 ring-hairline-strong"
    >
      <Image src={src} alt={name} fill priority={priority} sizes="17rem" className="object-cover" />
      <span aria-hidden className="holo-foil pointer-events-none absolute inset-0" />
      <span aria-hidden className="holo-glare pointer-events-none absolute inset-0" />
    </div>
  );
}

export function Hero({ total }: { total: number }) {
  const count = useCountUp(total);

  return (
    <section className="grain relative isolate overflow-hidden">
      {/* Cinematic background — full-HD neo-Tokyo, slowly drifting (Ken Burns). */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="kenburns absolute inset-0">
          <Image
            src="/hero/neo-tokyo.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Amber grade + ink vignette so type stays readable and on-palette. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.16 0.01 66 / 0.7) 0%, oklch(0.16 0.01 66 / 0.4) 38%, oklch(0.165 0.01 66 / 0.92) 88%, var(--bg) 100%)",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: "linear-gradient(115deg, oklch(0.5 0.16 60 / 0.45), transparent 55%)" }}
        />
        {/* Rising-sun disc. */}
        <div
          className="absolute -right-10 top-[14%] size-[42vw] max-w-[640px] rounded-full opacity-70 blur-[2px]"
          style={{
            background:
              "radial-gradient(circle, var(--amber-glow), oklch(0.82 0.15 78 / 0.08) 55%, transparent 70%)",
          }}
        />
      </div>

      <CornerMarks />

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-10 lg:pb-28 lg:pt-32">
        {/* Headline column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-amber">
            <span className="h-px w-10 bg-amber/60" />
            <span className="tech text-amber">館 No.001 — 決闘者の書庫</span>
          </div>

          <h1 className="font-display text-[clamp(2.7rem,8.5vw,5.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-ink">
            <span className="block overflow-hidden pb-[0.05em]">
              <span
                className="block whitespace-nowrap animate-[line-rise_0.9s_var(--ease-out-quint)_both]"
                style={{ animationDelay: "0.05s" }}
              >
                The Card
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.05em] text-amber">
              <span
                className="block whitespace-nowrap animate-[line-rise_0.9s_var(--ease-out-quint)_both]"
                style={{ animationDelay: "0.16s" }}
              >
                Gallery
              </span>
            </span>
          </h1>

          <p className="max-w-md font-serif text-lg italic leading-relaxed text-muted">
            Every Yu-Gi-Oh! card, lit like an exhibit — search the pool, filter
            by attribute, and tilt the art into the light.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-display text-3xl font-bold tabular-nums text-ink">
              {count.toLocaleString()}
            </span>
            <span className="tech text-faint">cards · sourced from ygoprodeck</span>
          </div>

          <a
            href="#collection"
            className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-amber-ink transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-105"
          >
            Browse the collection
            <ArrowDownIcon
              width={16}
              height={16}
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            />
          </a>
        </div>

        {/* Featured holographic fan */}
        <div className="relative flex items-center justify-center pt-6 lg:pt-0">
          <span
            aria-hidden
            className="vertical absolute -left-2 top-1/2 hidden -translate-y-1/2 font-serif text-2xl text-amber/70 lg:block"
          >
            光と闇
          </span>
          <div className="float-soft relative flex items-center justify-center">
            {FEATURED.map((c) => (
              <div
                key={c.src}
                className={c.dim ? "absolute" : "relative"}
                style={{
                  transform: c.dim
                    ? `translateX(${c.x}) rotate(${c.rot}deg) scale(0.86)`
                    : undefined,
                  zIndex: c.z,
                  opacity: c.dim ? 0.55 : 1,
                  filter: c.dim ? "saturate(0.8) brightness(0.7)" : undefined,
                }}
              >
                <TiltCard src={c.src} name={c.name} priority={!c.dim} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CornerMarks() {
  const base = "absolute size-4 border-amber/40";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <span className={`${base} left-4 top-20 border-l border-t sm:left-6 lg:left-10`} />
      <span className={`${base} right-4 top-20 border-r border-t sm:right-6 lg:right-10`} />
      <span className={`${base} bottom-6 left-4 border-b border-l sm:left-6 lg:left-10`} />
      <span className={`${base} bottom-6 right-4 border-b border-r sm:right-6 lg:right-10`} />
    </div>
  );
}
