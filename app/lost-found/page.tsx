"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Bell, ChevronRight, MapPin, Plus, Search, SlidersHorizontal } from "lucide-react";

const reports = [
  { id: "1", type: "lost", title: "Black AirPods case", category: "Electronics", location: "Central Library", time: "2h ago", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&q=85" },
  { id: "2", type: "found", title: "Blue water bottle", category: "Personal", location: "Sports Complex", time: "5h ago", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&q=85" },
  { id: "3", type: "lost", title: "Student ID card", category: "Documents", location: "Block B", time: "Yesterday", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=85" },
  { id: "4", type: "found", title: "Scientific calculator", category: "Study", location: "Engineering Lab", time: "Yesterday", image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=700&q=85" },
  { id: "5", type: "lost", title: "Grey hoodie", category: "Clothing", location: "Cafeteria", time: "2 days ago", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&q=85" },
  { id: "6", type: "found", title: "USB drive", category: "Electronics", location: "CS Department", time: "2 days ago", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85" },
];

const categories = ["All", "Electronics", "Documents", "Study", "Personal", "Clothing"];

export default function LostFoundPage() {
  const [mode, setMode] = useState<"all" | "lost" | "found">("all");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredReports = useMemo(() => {
    const search = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesMode = mode === "all" || report.type === mode;
      const matchesCategory = category === "All" || report.category === category;
      const matchesSearch = !search || `${report.title} ${report.category} ${report.location}`.toLowerCase().includes(search);
      return matchesMode && matchesCategory && matchesSearch;
    });
  }, [mode, category, query]);

  return (
    <main className="min-h-screen bg-[#F0ECFA] text-[#171936]">
      <div className="mx-auto min-h-screen max-w-[1180px] px-3 pb-24 sm:px-6 lg:px-10">
        <header className="flex h-14 items-center justify-between border-b border-[#D9D4E8] sm:h-[68px]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#23265B] text-[10px] font-bold text-white sm:h-9 sm:w-9 sm:text-[11px]">C<span className="text-[#8570E8]">L</span></div>
            <div>
              <div className="text-[13px] font-semibold tracking-[-0.03em] sm:text-[14px]">CampusLoop</div>
              <div className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#77758A] sm:text-[8px]">Lost &amp; Found</div>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#383A59] sm:h-auto sm:w-auto sm:gap-2" aria-label="My reports"><Bell size={15} strokeWidth={1.8} /><span className="hidden sm:inline text-[11px] font-semibold">My reports</span></button>
        </header>

        <section className="pt-4 sm:pt-9">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6854C9] sm:text-[11px]">Lost &amp; Found</p>
              <h1 className="mt-0.5 text-[24px] font-bold leading-tight tracking-[-0.055em] sm:mt-1 sm:text-[36px]">Find it. Return it.</h1>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button className="flex h-10 items-center gap-2 rounded-xl bg-[#23265B] px-4 text-[11px] font-semibold text-white"><Plus size={15} /> Report lost</button>
              <button className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[11px] font-semibold text-[#23265B] ring-1 ring-[#D8D3E4]"><Plus size={15} /> Report found</button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 sm:mt-6">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-white px-3 ring-1 ring-[#DED9EA] sm:h-12 sm:gap-3 sm:rounded-2xl sm:px-4">
              <Search size={16} className="shrink-0 text-[#77798E]" strokeWidth={1.8} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items, places or categories" className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#9293A2] sm:text-[12px]" />
            </label>
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#33375F] ring-1 ring-[#DED9EA] sm:h-12 sm:w-12 sm:rounded-2xl" aria-label="Filters"><SlidersHorizontal size={16} /></button>
          </div>

          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:mt-4 sm:gap-2">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold sm:px-4 sm:py-2 sm:text-[11px] ${category === item ? "bg-[#23265B] text-white" : "bg-white text-[#66687A] ring-1 ring-[#DED9EA]"}`}>{item}</button>
            ))}
          </div>
        </section>

        <section className="mt-4 sm:mt-9">
          <div className="flex items-center justify-between border-b border-[#D9D4E8] pb-2.5 sm:pb-3">
            <div className="flex items-center gap-0.5 rounded-lg bg-white p-0.5 ring-1 ring-[#DED9EA] sm:gap-1 sm:rounded-xl sm:p-1">
              {(["all", "lost", "found"] as const).map((item) => (
                <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold capitalize sm:rounded-lg sm:px-4 sm:py-2 sm:text-[11px] ${mode === item ? "bg-[#E8E2FF] text-[#5944B9]" : "text-[#77798A]"}`}>{item === "all" ? "All" : item}</button>
              ))}
            </div>
            <span className="text-[9px] font-medium text-[#7D7C8C] sm:text-[10px]">{filteredReports.length} reports</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-5 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <article key={report.id} className="group overflow-hidden rounded-[15px] bg-white ring-1 ring-[#DDD8E8] sm:rounded-[20px]">
                <div className="relative aspect-[1.1/1] overflow-hidden bg-[#E6E1F5] sm:aspect-[0.95/1]">
                  <Image src={report.image} alt={report.title} fill sizes="(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 31vw" className="object-cover" />
                  <div className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-[#5141A9] shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[8px]">{report.type}</div>
                </div>
                <div className="p-2.5 sm:p-4">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <h2 className="truncate text-[11px] font-bold tracking-[-0.02em] sm:text-[14px]">{report.title}</h2>
                      <p className="mt-0.5 text-[9px] text-[#7B7B8B] sm:mt-1 sm:text-[10px]">{report.category}</p>
                    </div>
                    <ChevronRight size={13} className="mt-0.5 shrink-0 text-[#9A98A7] sm:h-[15px] sm:w-[15px]" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#EEEAF4] pt-2 text-[8px] text-[#777889] sm:mt-3 sm:pt-3 sm:text-[9px]">
                    <span className="flex min-w-0 items-center gap-1 truncate"><MapPin size={9} /> {report.location}</span>
                    <span className="shrink-0">{report.time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredReports.length === 0 && <div className="rounded-[16px] bg-white px-5 py-12 text-center ring-1 ring-[#DDD8E8]"><p className="text-[13px] font-semibold">Nothing found</p><p className="mt-1 text-[10px] text-[#7D7C8C]">Try another search or category.</p></div>}
        </section>

        <div className="fixed bottom-3 left-1/2 z-20 -translate-x-1/2 sm:hidden">
          <button className="flex h-10 items-center gap-2 rounded-full bg-[#23265B] px-4 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(35,38,91,0.22)]"><Plus size={14} /> Report item</button>
        </div>
      </div>
    </main>
  );
}
