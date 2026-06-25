import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { formatCount, getTopArchetypes } from "@/lib/top-cards";

export default async function ArchetypesPage() {
  const archetypes = await getTopArchetypes();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-2 border-b border-hairline pb-5">
          <span className="tech text-amber">系統 · Lineages</span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            Top Archetypes
          </h1>
          <p className="max-w-md font-serif text-base italic text-muted">
            The families collectors return to most — ranked by how often their
            cards are viewed. Step into one to see every card in the lineage.
          </p>
        </div>

        {archetypes.length === 0 ? (
          <p className="border border-dashed border-hairline-strong px-6 py-24 text-center text-sm text-muted">
            Archetype rankings are unavailable right now — try again later.
          </p>
        ) : (
          <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(clamp(9rem,20vw,13rem),1fr))] gap-3 sm:gap-4">
            {archetypes.map((a, i) => (
              <li key={a.name}>
                <Link
                  href={`/archetypes/${encodeURIComponent(a.name)}`}
                  aria-label={`${a.name} — ${a.cardCount} cards`}
                  className="reveal group relative block aspect-[3/4] overflow-hidden rounded-xl bg-surface ring-1 ring-hairline transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:ring-[oklch(0.82_0.15_78/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  style={{ animationDelay: `${Math.min(i, 11) * 35}ms` }}
                >
                  {a.art ? (
                    <Image
                      src={a.art}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 24vw, 13rem"
                      className="object-cover transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-2" />
                  )}

                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
                    <h2 className="line-clamp-2 text-balance font-display text-[0.95rem] font-bold uppercase leading-tight tracking-wide text-white">
                      {a.name}
                    </h2>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/75">
                      {a.cardCount} cards · {formatCount(a.views)} views
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
