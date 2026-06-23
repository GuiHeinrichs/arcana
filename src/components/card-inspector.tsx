"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import type { Card } from "@/lib/ygoprodeck";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";

const MIN = 1;
const MAX = 5;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

type Transform = { scale: number; x: number; y: number };
const RESET: Transform = { scale: 1, x: 0, y: 0 };

/**
 * Full-screen card inspector. Zoom with wheel / pinch / +- / double-click, pan
 * by dragging when zoomed. Opens above the detail sheet (nested <dialog> in the
 * top layer). Disabled gestures degrade gracefully; Escape closes.
 */
export function CardInspector({
  card,
  onClose,
}: {
  card: Card | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const last = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const [t, setT] = useState<Transform>(RESET);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (card && !dialog.open) {
      restoreFocusTo.current = document.activeElement as HTMLElement | null;
      setT(RESET);
      dialog.showModal();
    } else if (!card && dialog.open) {
      dialog.close();
    }
  }, [card]);

  function handleClose() {
    onClose();
    restoreFocusTo.current?.focus?.();
  }

  const clampPos = useCallback((x: number, y: number, scale: number) => {
    const vp = viewportRef.current?.getBoundingClientRect();
    const el = contentRef.current;
    if (!vp || !el) return { x, y };
    const maxX = Math.max(0, (el.offsetWidth * scale - vp.width) / 2 + 24);
    const maxY = Math.max(0, (el.offsetHeight * scale - vp.height) / 2 + 24);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }, []);

  const zoom = useCallback(
    (factor: number, focusX?: number, focusY?: number) => {
      setT((prev) => {
        const vp = viewportRef.current?.getBoundingClientRect();
        if (!vp) return prev;
        const cx = vp.left + vp.width / 2;
        const cy = vp.top + vp.height / 2;
        const ox = (focusX ?? cx) - cx;
        const oy = (focusY ?? cy) - cy;
        const ns = clamp(prev.scale * factor, MIN, MAX);
        if (ns === 1) return RESET;
        const contentX = (ox - prev.x) / prev.scale;
        const contentY = (oy - prev.y) / prev.scale;
        const next = clampPos(ox - contentX * ns, oy - contentY * ns, ns);
        return { scale: ns, ...next };
      });
    },
    [clampPos],
  );

  // Wheel zoom needs a non-passive listener to call preventDefault.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !card) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY > 0 ? 0.88 : 1.14, e.clientX, e.clientY);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [card, zoom]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = { x: e.clientX, y: e.clientY };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: t.scale,
      };
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const factor = dist / pinch.current.dist;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      setT((prev) => {
        const vp = viewportRef.current?.getBoundingClientRect();
        if (!vp) return prev;
        const cx = vp.left + vp.width / 2;
        const cy = vp.top + vp.height / 2;
        const ox = mid.x - cx;
        const oy = mid.y - cy;
        const ns = clamp(pinch.current!.scale * factor, MIN, MAX);
        if (ns === 1) return RESET;
        const contentX = (ox - prev.x) / prev.scale;
        const contentY = (oy - prev.y) / prev.scale;
        const next = clampPos(ox - contentX * ns, oy - contentY * ns, ns);
        return { scale: ns, ...next };
      });
      return;
    }

    if (last.current) {
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setT((prev) => {
        if (prev.scale <= 1) return prev;
        return { scale: prev.scale, ...clampPos(prev.x + dx, prev.y + dy, prev.scale) };
      });
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) last.current = null;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoom(1.25);
    } else if (e.key === "-") {
      e.preventDefault();
      zoom(0.8);
    } else if (e.key === "0") {
      e.preventDefault();
      setT(RESET);
    } else if (e.key.startsWith("Arrow") && t.scale > 1) {
      e.preventDefault();
      const step = 60;
      setT((prev) => {
        const dx = e.key === "ArrowLeft" ? step : e.key === "ArrowRight" ? -step : 0;
        const dy = e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0;
        return { scale: prev.scale, ...clampPos(prev.x + dx, prev.y + dy, prev.scale) };
      });
    }
  }

  const art = card?.card_images[0];
  const zoomed = t.scale > 1;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onKeyDown={onKeyDown}
      aria-label={card ? `Inspect ${card.name}` : "Card inspector"}
      className="grain m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm open:flex"
    >
      {card && art && (
        <div className="relative flex h-full w-full flex-col bg-bg-deep/70">
          {/* Top bar */}
          <div className="z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 flex-col">
              <span className="tech text-amber">拡大 · Inspect</span>
              <span className="truncate font-serif text-sm text-ink">{card.name}</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close inspector"
              className="grid size-10 place-items-center rounded-[4px] text-muted transition-colors hover:bg-surface-3 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Zoomable viewport */}
          <div
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={(e) =>
              zoomed ? setT(RESET) : zoom(2.4, e.clientX, e.clientY)
            }
            className={`relative flex flex-1 touch-none select-none items-center justify-center overflow-hidden ${
              zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
            }`}
          >
            <div
              ref={contentRef}
              className="relative aspect-[59/86] h-[min(82vh,calc(80vw*86/59))] will-change-transform"
              style={{
                transform: `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`,
                transition: pointers.current.size
                  ? "none"
                  : "transform 0.25s var(--ease-out-quint)",
              }}
            >
              <Image
                src={art.image_url}
                alt={card.name}
                fill
                quality={90}
                sizes="100vw"
                priority
                draggable={false}
                className="rounded-lg object-contain shadow-[var(--shadow-lift)]"
              />
            </div>

            {!zoomed && (
              <span className="tech pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-faint">
                scroll · pinch · double-click to zoom
              </span>
            )}
          </div>

          {/* Zoom controls */}
          <div className="z-10 flex items-center justify-center gap-1.5 py-4">
            <button
              type="button"
              onClick={() => zoom(0.8)}
              aria-label="Zoom out"
              disabled={t.scale <= MIN}
              className="grid size-10 place-items-center rounded-[4px] border border-hairline-strong text-ink transition-colors hover:border-amber hover:text-amber disabled:opacity-40"
            >
              <MinusIcon width={18} height={18} />
            </button>
            <button
              type="button"
              onClick={() => setT(RESET)}
              className="min-w-[4.5rem] rounded-[4px] border border-hairline-strong px-3 py-2 font-mono text-xs tabular-nums text-ink transition-colors hover:border-amber hover:text-amber"
            >
              {Math.round(t.scale * 100)}%
            </button>
            <button
              type="button"
              onClick={() => zoom(1.25)}
              aria-label="Zoom in"
              disabled={t.scale >= MAX}
              className="grid size-10 place-items-center rounded-[4px] border border-hairline-strong text-ink transition-colors hover:border-amber hover:text-amber disabled:opacity-40"
            >
              <PlusIcon width={18} height={18} />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
