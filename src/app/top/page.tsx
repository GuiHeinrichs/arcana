import { SiteHeader } from "@/components/site-header";
import { TopCards } from "@/components/top-cards";
import {
  getStaples,
  getTopRankings,
  type RankedCard,
  type TopLens,
} from "@/lib/top-cards";

const LENSES: TopLens[] = ["week", "views", "likes", "staples"];

function parseLens(value: string | undefined): TopLens {
  return value && (LENSES as string[]).includes(value) ? (value as TopLens) : "week";
}

export default async function TopPage({
  searchParams,
}: {
  searchParams: Promise<{ lens?: string }>;
}) {
  const { lens } = await searchParams;
  const active = parseLens(lens);

  const [rankings, staples] = await Promise.all([getTopRankings(), getStaples()]);
  const lenses: Record<TopLens, RankedCard[]> = {
    week: rankings.week,
    views: rankings.views,
    likes: rankings.likes,
    staples,
  };

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-2 border-b border-hairline pb-5">
          <span className="tech text-amber">人気 · Most Wanted</span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            Top Cards
          </h1>
          <p className="max-w-md font-serif text-base italic text-muted">
            The cards the duelists keep coming back to — ranked by what the
            community plays, views, and loves.
          </p>
        </div>

        <TopCards initialLens={active} lenses={lenses} />
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink">
            Arcana
          </span>
          <p className="max-w-xl text-xs leading-relaxed text-faint">
            Card data and popularity stats courtesy of the YGOPRODeck API.
            Yu-Gi-Oh! is a trademark of Konami. Arcana is a fan-made gallery,
            not affiliated with or endorsed by Konami.
          </p>
        </div>
      </footer>
    </>
  );
}
