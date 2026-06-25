import Link from "next/link";
import { notFound } from "next/navigation";
import { CardGrid } from "@/components/card-grid";
import { SiteHeader } from "@/components/site-header";
import { ArrowUpRightIcon } from "@/components/icons";
import { getArchetypeCards } from "@/lib/top-cards";

function decodeName(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return { title: `${decodeName(name)} — Archetype · Arcana` };
}

export default async function ArchetypePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const archetypeName = decodeName(name);
  const cards = await getArchetypeCards(archetypeName);

  if (cards.length === 0) notFound();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-3 border-b border-hairline pb-5">
          <Link
            href="/archetypes"
            className="inline-flex w-fit items-center gap-1 font-mono text-xs uppercase tracking-wider text-faint transition-colors hover:text-amber"
          >
            <ArrowUpRightIcon
              width={13}
              height={13}
              className="-rotate-[135deg]"
            />
            All archetypes
          </Link>
          <span className="tech text-amber">系統 · Lineage</span>
          <h1 className="text-balance font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            {archetypeName}
          </h1>
          <p className="font-mono text-xs uppercase tracking-wider text-faint">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </p>
        </div>

        <CardGrid cards={cards} />
      </main>
    </>
  );
}
