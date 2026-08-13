"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronRight, Clock3, MapPin, PackageSearch, Plus, Search } from "lucide-react";

const items = [
  { id: "1", type: "lost", title: "Black AirPods case", category: "Electronics", location: "Central Library", time: "2 hours ago", color: "#DCD6F5" },
  { id: "2", type: "found", title: "Blue water bottle", category: "Personal", location: "Sports Complex", time: "5 hours ago", color: "#D8E9E0" },
  { id: "3", type: "lost", title: "Student ID card", category: "Documents", location: "Block B", time: "Yesterday", color: "#D9E0F1" },
  { id: "4", type: "found", title: "Scientific calculator", category: "Study", location: "Engineering Lab", time: "Yesterday", color: "#EAE0CF" },
  { id: "5", type: "lost", title: "Grey hoodie", category: "Clothing", location: "Cafeteria", time: "2 days ago", color: "#DDE2E6" },
  { id: "6", type: "found", title: "USB drive", category: "Electronics", location: "CS Department", time: "2 days ago", color: "#E2DCEC" },
];

const filters = ["All", "Lost", "Found", "Electronics", "Study", "Personal", "Documents"];

export default function LostFoundPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => items.filter((item) => {
    const text = `${item.title} ${item.category} ${item.location}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesFilter = activeFilter === "All" || (activeFilter === "Lost" && item.type === "lost") || (activeFilter === "Found" && item.type === "found") || item.category === activeFilter;
    return matchesQuery && matchesFilter;
  }), [activeFilter, query]);

  return (
    <main className="min-h-screen bg-[#F6F4EE] text-[#202641]">
      <div className="mx-auto min-h-screen max-w-[1120px] px-5 pb-16 sm:px-8 lg:px-10">
        <header className="flex h-[68px] items-center justify-between border-b border-[#DDD9D0]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#293477] text-[11px] font-bold text-white">C<span className="text-[#AFA2F0]">L</span></div>
            <span className="text-[14px] font-semibold tracking-[-0.025em]">CampusLoop</span>
            <span className="hidden text-[#C6C1B8] sm:inline">/</span>
            <span className="hidden text-[12px] text-[#777985] sm:inline">Lost &amp; Found</span>
          </div>
          <button className="flex items-center gap-2 text-[11px] font-semibold text-[#30386F]"><Bell size={16} strokeWidth={1.7} /><span className="hidden sm:inline">My reports</span></button>
        </header>

        <section className="border-b border-[#DDD9D0] py-8 sm:py-10">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-[620px]">
              <p className="text-[11px] font-semibold text-[#6857C8]">Lost &amp; Found</p>
              <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.05em] sm:text-[38px]">Find a missing item.<br className="sm:hidden" /> Help return one.</h1>
              <p className="mt-3 max-w-[510px] text-[13px] leading-5 text-[#737680]">Search reports from students around campus, or add a report if you lost or found something.</p>
            </div>
            <div className="flex shrink-0 gap-5 text-[12px] font-semibold">
              <button className="inline-flex items-center gap-1.5 border-b-2 border-[#293477] pb-2 text-[#293477]"><Plus size={15} /> Lost item</button>
              <button className="inline-flex items-center gap-1.5 border-b-2 border-transparent pb-2 text-[#6D707B] hover:text-[#293477]"><Plus size={15} /> Found item</button>
            </div>
          </div>
        </section>

        <section className="border-b border-[#DDD9D0] py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex h-11 w-full items-center gap-3 border-b border-[#BDB9B0] md:max-w-[460px]">
              <Search size={18} className="text-[#777984]" strokeWidth={1.7} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search item, place or category" className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#9A9AA0]" />
            </div>
            <nav className="flex gap-5 overflow-x-auto no-scrollbar">
              {filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`shrink-0 border-b-2 pb-2 text-[11px] font-semibold transition ${activeFilter === filter ? "border-[#293477] text-[#293477]" : "border-transparent text-[#777984] hover:text-[#293477]"}`}>{filter}</button>)}
            </nav>
          </div>
        </section>

        <section className="pt-7 sm:pt-9">
          <div className="mb-4 flex items-baseline justify-between">
            <div><h2 className="text-[19px] font-semibold tracking-[-0.035em]">Recent reports</h2><p className="mt-1 text-[11px] text-[#85868E]">Items reported around campus</p></div>
            <span className="text-[11px] text-[#85868E]">{filteredItems.length} results</span>
          </div>

          <div className="divide-y divide-[#DDD9D0] border-y border-[#DDD9D0]">
            {filteredItems.map((item) => (
              <button key={item.id} className="group flex w-full items-center gap-4 py-4 text-left sm:gap-5 sm:py-5">
                <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center sm:h-[88px] sm:w-[100px]" style={{ backgroundColor: item.color }}>
                  <PackageSearch size={25} strokeWidth={1.35} className="text-[#353D79]" />
                  <span className={`absolute bottom-0 left-0 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${item.type === "lost" ? "bg-[#E8E0FA] text-[#624DAE]" : "bg-[#DDECE3] text-[#39705A]"}`}>{item.type}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0"><h3 className="truncate text-[13px] font-semibold text-[#252A43] sm:text-[14px]">{item.title}</h3><p className="mt-1 text-[10px] text-[#85868E]">{item.category}</p></div>
                    <ChevronRight size={17} className="mt-1 shrink-0 text-[#A1A1A6] transition group-hover:translate-x-1" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#777984]"><span className="inline-flex items-center gap-1"><MapPin size={11} />{item.location}</span><span className="inline-flex items-center gap-1"><Clock3 size={11} />{item.time}</span></div>
                </div>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && <div className="border-y border-[#DDD9D0] py-16 text-center"><p className="text-[13px] font-semibold">Nothing matches that search.</p><p className="mt-1 text-[11px] text-[#85868E]">Try another item, place or category.</p></div>}
        </section>
      </div>
    </main>
  );
}
