import { ShieldCheck } from "lucide-react";

export function LostFoundBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 mb-4 text-white">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mb-2">
        <ShieldCheck size={14} />
        SAFE HANDOVER
      </div>
      <h3 className="text-lg font-bold mb-1">Every claim is QR-verified</h3>
      <p className="text-sm text-white/70">
        Scan to confirm identity before handing over any item — no fake claims.
      </p>
    </div>
  );
}