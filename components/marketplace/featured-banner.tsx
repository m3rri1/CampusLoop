import { Sparkles, ArrowRight } from "lucide-react";

export function FeaturedBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6759FF] to-[#4338CA] p-5 mb-4 text-white">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mb-2">
        <Sparkles size={14} />
        FEATURED DEAL
      </div>
      <h3 className="text-lg font-bold mb-1">End-of-semester clearance is live!</h3>
      <p className="text-sm text-white/70 mb-4">
        Students are listing books, gadgets & more before break.
      </p>
      <button className="flex items-center gap-1.5 bg-white text-[#6759FF] text-sm font-semibold px-4 py-2 rounded-xl">
        View Deals
        <ArrowRight size={15} />
      </button>
    </div>
  );
}