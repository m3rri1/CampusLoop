"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Bell, ChevronRight, MapPin, Plus, Search, SlidersHorizontal } from "lucide-react";

const reports = [
  {
    id: "1",
    type: "lost",
    title: "Black AirPods case",
    category: "Electronics",
    location: "Central Library",
    time: "2h ago",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&q=85",
  },
  {
    id: "2",
    type: "found",
    title: "Blue water bottle",
    category: "Personal",
    location: "Sports Complex",
    time: "5h ago",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&q=85",
  },
  {
    id: "3",
    type: "lost",
    title: "Student ID card",
    category: "Documents",
    location: "Block B",
    time: "Yesterday",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=85",
  },
  {
    id: "4",
    type: "found",
    title: "Scientific calculator",
    category: "Study",
    location: "Engineering Lab",
    time: "Yesterday",
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=700&q=85",
  },
  {
    id: "5",
    type: "lost",
    title: "Grey hoodie",
    category: "Clothing",
    location: "Cafeteria",
    time: "2 days ago",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&q=85",
  },
  {
    id: "6",
    type: "found",
    title: "USB drive",
    category: "Electronics",
    location: "CS Department",
    time: "2 days ago",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85",
  },
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
      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#F0ECFA] px-4 pb-24 sm:px-6 lg:px-10">
        <header className="flex h-[68px] items-center justify-between border-b border-[#D9D4E8]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#23265B] text-[11px] font-bold text-white">
              C<span className="text-[#8570E8]">L</span>
            </div>
            <div>
              <div className="text-[14px] font-semibold tracking-[-0.03em]">CampusLoop</div>
              <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#77758A]">Lost &amp; Found</div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-[11px] font-semibold text-[#383A59]">
            <Bell size={16} strokeWidth={1.8} />
            <span className="hidden sm:inline">My reports</span>
          </button>
        </header>

        <section className="pt-7 sm:pt-9">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6854C9]">Lost &amp; Found</p>
              <h1 className="mt-1 text-[28px] font-bold leading-[1.02] tracking-[-0.055em] sm:text-[36px]">Find it. Return it.</h1>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button className="flex h-10 items-center gap-2 rounded-xl bg-[#23265B] px-4 text-[11px] font-semibold text-white">
                <Plus size={15} /> Report lost
              </button>
              <button className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[11px] font-semibold text-[#23265B] ring-1 ring-[#D8D3E4]">
                <Plus size={15} /> Report found
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-[#DED9EA]">
              <Search size={18} className="shrink-0 text-[#77798E]" strokeWidth={1.8} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items, places or categories" className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#9293A2]" />
            </label>
            <button className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#33375F] ring-1 ring-[#DED9EA] sm:flex" aria-label="Filters">
              <SlidersHorizontal size={17} />
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold transition ${category === item ? "bg-[#23265B] text-white" : "bg-white text-[#66687A] ring-1 ring-[#DED9EA]"}`}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 sm:mt-9">
          <div className="flex items-center justify-between border-b border-[#D9D4E8] pb-3">
            <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-[#DED9EA]">
              {(["all", "lost", "found"] as const).map((item) => (
                <button key={item} onClick={() => setMode(item)} className={`rounded-lg px-4 py-2 text-[11px] font-semibold capitalize ${mode === item ? "bg-[#E8E2FF] text-[#5944B9]" : "text-[#77798A]"}`}>
                  {item === "all" ? "All items" : item}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-medium text-[#7D7C8C]">{filteredReports.length} reports</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <article key={report.id} className="group overflow-hidden rounded-[20px] bg-white ring-1 ring-[#DDD8E8] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(39,35,77,0.09)]">
                <div className="relative aspect-[0.95/1] overflow-hidden bg-[#E6E1F5]">
                  <Image src={report.image} alt={report.title} fill sizes="(max-width: 639px) 48vw, (max-width: 1023px) 46vw, 31vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#5141A9] shadow-sm">
                    {report.type}
                  </div>
                </div>
                <div className="p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-[13px] font-bold tracking-[-0.02em] sm:text-[14px]">{report.title}</h2>
                      <p className="mt-1 text-[10px] text-[#7B7B8B]">{report.category}</p>
                    </div>
                    <ChevronRight size={15} className="mt-0.5 shrink-0 text-[#9A98A7]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEEAF4] pt-3 text-[9px] text-[#777889]">
                    <span className="flex min-w-0 items-center gap-1 truncate"><MapPin size={10} /> {report.location}</span>
                    <span className="shrink-0">{report.time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="rounded-[20px] bg-white px-6 py-16 text-center ring-1 ring-[#DDD8E8]">
              <p className="text-[14px] font-semibold">Nothing found</p>
              <p className="mt-1 text-[11px] text-[#7D7C8C]">Try another search or category.</p>
            </div>
          )}
        </section>

        <button className="fixed bottom-5 right-5 flex h-12 items-center gap-2 rounded-full bg-[#23265B] px-5 text-[11px] font-bold text-white shadow-[0_10px_25px_rgba(35,38,91,0.25)] sm:hidden">
          <Plus size={16} /> Report item
        </button>
      </div>
    </main>
  );
}
