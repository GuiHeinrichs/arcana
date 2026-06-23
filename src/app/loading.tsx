import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      {/* Hero placeholder */}
      <div className="relative overflow-hidden border-b border-hairline bg-bg-deep px-4 pb-20 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-5">
            <div className="skeleton h-4 w-56 rounded" />
            <div className="skeleton h-24 w-full max-w-md rounded-lg" />
            <div className="skeleton h-5 w-full max-w-sm rounded" />
            <div className="skeleton h-11 w-52 rounded-full" />
          </div>
          <div className="flex justify-center">
            <div className="skeleton aspect-[59/86] w-64 rounded-xl" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-16 sm:px-6 lg:px-10">
        <div className="mb-8 border-b border-hairline pb-5">
          <div className="skeleton h-9 w-72 rounded" />
        </div>
        <div className="mb-8 skeleton h-12 w-full rounded-[5px]" />
        <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(clamp(8.5rem,22vw,11.5rem),1fr))] gap-x-4 gap-y-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <li key={i}>
              <div className="skeleton aspect-[59/86] rounded-[10px]" />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
