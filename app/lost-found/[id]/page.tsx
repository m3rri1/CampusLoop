"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, MapPin, QrCode, ShieldCheck } from "lucide-react";

const reports = [
  { id: "1", type: "lost", title: "Black AirPods case", category: "Electronics", location: "Central Library", time: "2h ago", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=85", description: "Black AirPods case with a small scratch near the hinge. Lost around the library and may have been left near a study table." },
  { id: "2", type: "found", title: "Blue water bottle", category: "Personal", location: "Sports Complex", time: "5h ago", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=85", description: "Blue reusable water bottle found near the sports complex entrance. It was picked up and kept safely." },
  { id: "3", type: "lost", title: "Student ID card", category: "Documents", location: "Block B", time: "Yesterday", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85", description: "Student ID card misplaced around Block B. Please verify the name and details before handing it over." },
  { id: "4", type: "found", title: "Scientific calculator", category: "Study", location: "Engineering Lab", time: "Yesterday", image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&q=85", description: "Scientific calculator found in the engineering lab after a class. It is currently being kept safely." },
  { id: "5", type: "lost", title: "Grey hoodie", category: "Clothing", location: "Cafeteria", time: "2 days ago", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=85", description: "Grey hoodie left somewhere around the cafeteria. Look for the specific details mentioned by the owner when claiming it." },
  { id: "6", type: "found", title: "USB drive", category: "Electronics", location: "CS Department", time: "2 days ago", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=900&q=85", description: "USB drive found in the CS department. The owner should be able to identify its contents or distinguishing details." },
];

export default function LostFoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const report = reports.find((item) => item.id === id);
  if (!report) return null;
  const isLost = report.type === "lost";

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4]">
        <header className="flex items-center justify-between border-b border-[#E5E1D8] px-5 py-4 sm:px-8">
          <Link href="/lost-found" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#555C70]"><ArrowLeft size={16} /> Lost &amp; Found</Link>
          <span className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] ${isLost ? "bg-[#EEE9FF] text-[#5A45C5]" : "bg-[#E5F1EA] text-[#32704F]"}`}>{report.type}</span>
        </header>
        <div className="mx-auto grid max-w-5xl lg:grid-cols-[1.08fr_.92fr] lg:gap-10 lg:px-8 lg:py-8">
          <div><div className="relative aspect-[1.08/1] overflow-hidden bg-[#E8E4E0] sm:aspect-[1.35/1] lg:rounded-[24px]"><Image src={report.image} alt={report.title} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /><span className="absolute left-4 top-4 rounded-full bg-[#FFFDF9]/95 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#29304B] shadow-sm">{report.category}</span></div></div>
          <div className="px-5 pb-10 pt-6 sm:px-8 lg:px-0 lg:pt-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6952D7]">Campus lost &amp; found</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-[1.08] tracking-[-0.055em] sm:text-[36px]">{report.title}</h1>
            <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-[16px] border border-[#E4E0D8] bg-[#FFFDF9] p-3.5"><MapPin size={16} className="text-[#5D48D2]" /><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#9294A0]">Location</p><p className="mt-0.5 text-[12px] font-bold text-[#30364E]">{report.location}</p></div><div className="rounded-[16px] border border-[#E4E0D8] bg-[#FFFDF9] p-3.5"><Clock3 size={16} className="text-[#5D48D2]" /><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#9294A0]">Reported</p><p className="mt-0.5 text-[12px] font-bold text-[#30364E]">{report.time}</p></div></div>
            <section className="mt-7 border-t border-[#E4E0D8] pt-6"><h2 className="text-[12px] font-extrabold uppercase tracking-[0.13em]">What happened</h2><p className="mt-2.5 text-[13px] leading-6 text-[#676D7E]">{report.description}</p></section>
            <section className="mt-6 rounded-[18px] border border-[#E3DED4] bg-[#F7F4EC] p-4"><div className="flex gap-3"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#5D48D2]" /><div><h2 className="text-[12px] font-extrabold">Keep it verifiable</h2><p className="mt-1 text-[11px] leading-5 text-[#74798A]">Only claim this item if you can provide details that are not publicly visible. This helps prevent false claims.</p></div></div></section>
            <div className="mt-6 space-y-2.5"><Link href={`/lost-found/${report.id}/claim`} className="flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#23265B] text-[12px] font-extrabold text-white">{isLost ? "I found this item" : "This is my item"}<ChevronRight size={15} /></Link><Link href={`/lost-found/${report.id}/verify`} className="flex h-11 w-full items-center justify-center gap-2 rounded-[15px] border border-[#D9D4EA] bg-[#F0ECFA] text-[12px] font-extrabold text-[#4F3EAA]"><QrCode size={15} /> Verify with QR</Link><Link href="/lost-found" className="flex h-11 w-full items-center justify-center rounded-[15px] border border-[#DEDAD4] bg-[#FFFDF9] text-[12px] font-bold text-[#555B6D]">Back to reports</Link></div>
            <div className="mt-6 flex items-center gap-2 text-[10px] text-[#9699A3]"><CheckCircle2 size={13} className="text-[#5D48D2]" /> CampusLoop reports are intended for campus members.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
