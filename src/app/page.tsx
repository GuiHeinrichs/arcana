import Image from "next/image";
import {
  ATTRIBUTES,
  DEFAULT_QUERY,
  isDefaultQuery,
  KINDS,
  parseCardQuery,
  queryKey,
  searchCards,
  type CardQuery,
} from "@/lib/ygoprodeck";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { FilterBar } from "@/components/filter-bar";
import { Gallery } from "@/components/gallery";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function describe(query: CardQuery, total: number): string {
  const n = total.toLocaleString();
  if (query.q) {
    return `${n} ${total === 1 ? "result" : "results"} · “${query.q}”`;
  }
  const attr = ATTRIBUTES.find((a) => a.value === query.attribute);
  const kind = KINDS.find((k) => k.value === query.kind);
  const noun = query.kind === "all" ? "cards" : (kind?.label.toLowerCase() ?? "cards");
  const prefix = attr ? `${attr.label} ` : "";
  return `${n} ${prefix}${noun}`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = parseCardQuery((key) => {
    const value = sp[key];
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value[0] ?? null;
    return null;
  });

  const page = await searchCards(query);
  const heroTotal = isDefaultQuery(query)
    ? page.total
    : (await searchCards(DEFAULT_QUERY)).total;

  return (
    <>
      <SiteHeader />

      <Hero total={heroTotal} />

      <main>
        <section
          id="collection"
          className="relative isolate scroll-mt-20 overflow-hidden"
        >
          {/* Treated card art behind the header — full-bleed, always visible
              (the bottom of an infinite list never is), fading into the stage. */}
          <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[28rem]">
            <Image
              src="/art/blue-eyes.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[center_28%] opacity-[0.22]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.165 0.01 66 / 0.5), var(--bg) 88%)",
              }}
            />
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background:
                  "linear-gradient(110deg, oklch(0.5 0.16 60 / 0.35), transparent 60%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-6 lg:px-10">
            <div className="on-scroll mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
              <div className="flex flex-col gap-2">
                <span className="tech text-amber">図録 · The Collection</span>
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
                  Browse every card
                </h2>
                <p className="max-w-md font-serif text-base italic text-muted">
                  Between light and shadow, every card waits — tilt one into the
                  light and watch the foil catch fire.
                </p>
              </div>
              <p className="tech text-faint">{describe(query, page.total)}</p>
            </div>

            <FilterBar query={query} />
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-24 pt-9 sm:px-6 lg:px-10">
          <Gallery key={queryKey(query)} initial={page} query={query} />
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink">
            Arcana
          </span>
          <p className="max-w-xl text-xs leading-relaxed text-faint">
            Card data and artwork courtesy of the YGOPRODeck API. Yu-Gi-Oh! is a
            trademark of Konami. Arcana is a fan-made gallery, not affiliated
            with or endorsed by Konami.
          </p>
        </div>
      </footer>
    </>
  );
}
