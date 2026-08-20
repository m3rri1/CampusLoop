"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";

const reports: Record<string, { title: string; type: "lost" | "found" }> = {
  "1": { title: "Black AirPods case", type: "lost" },
  "2": { title: "Blue water bottle", type: "found" },
  "3": { title: "Student ID card", type: "lost" },
  "4": { title: "Scientific calculator", type: "found" },
  "5": { title: "Grey hoodie", type: "lost" },
  "6": { title: "USB drive", type: "found" },
};

export default function ClaimPage() {
  const { id } = useParams<{ id: string }>();
  const report = reports[id];
  const [submitted, setSubmitted] = useState(false);

  if (!report) return null;

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#EEECE5] px-4 py-5 text-[#172044]">
        <div className="mx-auto min-h-[calc(100vh-40px)] max-w-[520px] rounded-[28px] bg-[#FBF9F4] p-5 sm:p-8">
          <Link href={`/lost-found/${id}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#555C70]"><ArrowLeft size={16} /> Back to report</Link>
          <div className="mt-16 rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9] p-7 text-center sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5F1EA] text-[#32704F]"><Check size={25} /></div>
            <h1 className="mt-5 text-[25px] font-extrabold tracking-[-0.04em]">Request sent</h1>
            <p className="mt-2 text-[13px] leading-5 text-[#707587]">Your request for <span className="font-bold text-[#30364E]">{report.title}</span> has been recorded. The other student can verify the details before arranging the handover.</p>
            <Link href="/lost-found" className="mt-6 flex h-11 items-center justify-center rounded-[14px] bg-[#23265B] text-[12px] font-extrabold text-white">Back to Lost &amp; Found</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-5 sm:px-8 sm:py-7">
        <div className="mx-auto max-w-xl">
          <Link href={`/lost-found/${id}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#555C70]"><ArrowLeft size={16} /> Back to item</Link>

          <div className="mt-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6952D7]">{report.type === "lost" ? "Found something?" : "Claim an item"}</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-[1.08] tracking-[-0.055em]">{report.type === "lost" ? "Help return it to its owner." : "Tell us why it is yours."}</h1>
            <p className="mt-2.5 text-[13px] leading-5 text-[#6D7184]">{report.type === "lost" ? "A few details help the owner confirm you have the right item." : "Give the finder enough information to verify that you are the owner."}</p>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] p-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#8A8D99]">Item</p>
            <p className="mt-1 text-[14px] font-extrabold text-[#252B43]">{report.title}</p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="mt-6 space-y-5">
            <label className="block"><span className="mb-2 block text-[11px] font-bold text-[#343A56]">How can you identify it?</span><textarea required rows={5} placeholder="Mention a detail that isn't obvious from the public report — a mark, sticker, case detail, contents, engraving, etc." className="w-full resize-none rounded-[15px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 py-3 text-[13px] leading-5 outline-none focus:border-[#8C7BDD]" /></label>
            <label className="block"><span className="mb-2 block text-[11px] font-bold text-[#343A56]">Where should the handover happen?</span><input required placeholder="e.g. Central Library reception" className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] outline-none focus:border-[#8C7BDD]" /></label>
            <label className="flex items-start gap-3 rounded-[16px] border border-[#E4DFD5] bg-[#F7F4EC] p-4"><input required type="checkbox" className="mt-0.5 h-4 w-4 accent-[#23265B]" /><span className="text-[11px] leading-5 text-[#626879]">I confirm the information I provided is accurate and understand that the other student may ask for additional proof before handing over the item.</span></label>

            <div className="flex gap-2 border-t border-[#E4E0D8] pt-5"><Link href={`/lost-found/${id}`} className="flex h-11 flex-1 items-center justify-center rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] text-[12px] font-bold text-[#555B6D]">Cancel</Link><button type="submit" className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-[14px] bg-[#23265B] text-[12px] font-extrabold text-white">Send request</button></div>
          </form>

          <div className="mt-6 flex gap-2.5 rounded-[16px] border border-[#E1DDD4] bg-[#F7F4EC] p-3.5"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#5D48D2]" /><p className="text-[10px] leading-5 text-[#74798A]">CampusLoop does not expose private contact details on the report. Keep the handover on campus and verify the item first.</p></div>
        </div>
      </div>
    </main>
  );
}
