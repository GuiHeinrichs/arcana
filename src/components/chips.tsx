/**
 * Coding chips for Yu-Gi-Oh! attributes and card frames. Each pairs its colour
 * with a text label (colour is never the only signal) so the meaning survives
 * for colour-blind users — a PRODUCT.md requirement. Styled as technical tags.
 */
import { attributeMeta, frameMeta, type Card } from "@/lib/ygoprodeck";

const BASE =
  "inline-flex items-center gap-1.5 rounded-[3px] px-2 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink";

export function AttributeChip({
  attribute,
  className = "",
}: {
  attribute: string | undefined;
  className?: string;
}) {
  const meta = attributeMeta(attribute);
  if (!meta) return null;
  return (
    <span className={`${BASE} border border-hairline-strong bg-surface/70 ${className}`}>
      <span aria-hidden className="size-2 rounded-[1px]" style={{ background: `var(${meta.token})` }} />
      {meta.label}
    </span>
  );
}

export function FrameChip({
  card,
  className = "",
}: {
  card: Card;
  className?: string;
}) {
  const meta = frameMeta(card.frameType);
  return (
    <span
      className={`${BASE} ${className}`}
      style={{
        background: `color-mix(in oklch, var(${meta.token}) 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(${meta.token}) 42%, transparent)`,
      }}
    >
      <span aria-hidden className="size-2 rounded-[1px]" style={{ background: `var(${meta.token})` }} />
      {meta.label}
    </span>
  );
}
