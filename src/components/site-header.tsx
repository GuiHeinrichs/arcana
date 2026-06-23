import Link from "next/link";
import { ArcanaMark } from "@/components/icons";
import { HeaderNav } from "@/components/header-nav";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-sticky)] border-b border-hairline bg-bg/55 backdrop-blur-xl">
      <div className="mx-auto flex h-[3.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md"
          aria-label="Arcana — home"
        >
          <ArcanaMark width={24} height={24} className="text-amber" />
          <span className="font-display text-lg font-bold uppercase tracking-[0.18em] text-ink">
            Arcana
          </span>
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
