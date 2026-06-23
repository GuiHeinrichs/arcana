import { GRID, HoloCardSkeleton } from "@/components/holo-card";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="mb-10 h-24 border-b border-hairline" />
        <div className="mb-10 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-28 rounded-full" />
          ))}
        </div>
        <ul className={`${GRID} list-none`} aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <li key={i}>
              <HoloCardSkeleton />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
