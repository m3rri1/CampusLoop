import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FeaturedBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#E0E3EA] bg-[#17233D] p-5 sm:p-6 mb-7">
      <div className="relative z-10 max-w-md">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B9A8FF]">
          Campus marketplace
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
          Find it. Use it. Pass it on.
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#C8CEDA]">
          Buy and discover useful things from students around your campus.
        </p>
        <Link
          href="#listings"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#17233D] hover:bg-[#F1F2F5] transition-colors"
        >
          Browse listings
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="absolute -right-12 -bottom-20 h-52 w-52 rounded-full border-[28px] border-[#6546D9]/35" />
      <div className="absolute right-16 -top-10 h-28 w-28 rounded-full bg-[#6546D9]/20" />
    </section>
  );
}