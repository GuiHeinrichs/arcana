"use client";

import { SiteHeader } from "@/components/site-header";
import { AlertIcon } from "@/components/icons";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-5 px-6 py-32 text-center">
        <span
          className="grid size-16 place-items-center rounded-full text-gold"
          style={{ background: "var(--gold-veil)" }}
        >
          <AlertIcon width={30} height={30} />
        </span>
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="font-serif text-2xl text-ink">
            The gallery went dark
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            We couldn&rsquo;t reach the card library just now. It&rsquo;s
            usually a brief hiccup with the upstream data source.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-gold-ink transition-[filter] hover:brightness-105"
        >
          Try again
        </button>
      </main>
    </>
  );
}
