import { SiteHeader } from "@/components/site-header";
import { DeckBuilder } from "@/components/deck-builder";

export default function BuilderPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-2 border-b border-hairline pb-5">
          <span className="tech text-amber">構築 · Forge</span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            Deck Builder
          </h1>
          <p className="max-w-md font-serif text-base italic text-muted">
            Search the library and forge a deck — Main, Extra, and Side. Your
            work is saved to this browser as you build.
          </p>
        </div>

        <DeckBuilder />
      </main>
    </>
  );
}
