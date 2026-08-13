import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function FeaturedBanner() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[22px] border border-[#E5E1FF] bg-[#F4F2FF] px-5 py-5 sm:px-6 sm:py-6">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6546D9]">
            <Sparkles size={13} />
            Made for your campus
          </div>
          <h2 className="text-[21px] font-extrabold leading-tight tracking-[-0.03em] text-[#17233D] sm:text-[24px]">
            Find it. Use it. Pass it on.
          </h2>
          <p className="mt-1.5 max-w-md text-[13px] leading-5 text-[#697286]">
            Useful things from students around you, without the noise of a public marketplace.
          </p>
        </div>

        <Link
          href="#listings"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-[#17233D] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Browse listings
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border-[18px] border-[#6546D9]/10" />
      <div className="pointer-events-none absolute -bottom-14 right-24 h-28 w-28 rounded-full bg-[#6546D9]/[0.06]" />
    </section>
  );
}
