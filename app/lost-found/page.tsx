"use client";

import { useMemo, useState } from "react";
import { Bell, Clock3, MapPin, Plus, Search } from "lucide-react";

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
    <main className="min-h-screen bg-[#F5F2EA] text-[#18213F]">
      <div className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-8 lg:px-12">
        <header className="flex h-[70px] items-center justify-between border-b border-[#D7D2C7]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#202957] text-[11px] font-bold text-white">C<span className="text-[#8D7AE8]">L</span></div>
            <div className="leading-none"><div className="text-[14px] font-semibold tracking-[-0.03em]">CampusLoop</div><div className="mt-1 text-[8px] font-medium uppercase tracking-[0.16em] text-[#777871]">Lost &amp; Found</div></div>
          </div>
          <button className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#343B59]"><Bell size={16} strokeWidth={1.7} />My reports</button>
        </header>

        <section className="border-b border-[#D7D2C7] py-6 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6758C8]"><span className="h-1.5 w-1.5 rounded-full bg-[#6758C8]" /> Lost &amp; Found</div>
              <h1 className="mt-2 text-[30px] font-bold leading-none tracking-[-0.055em] sm:text-[38px]">Find it. Return it.</h1>
              <p className="mt-2 max-w-[520px] text-[12px] leading-5 text-[#70716D]">Search items reported by students around campus or add a report of your own.</p>
            </div>
            <div className="grid w-full max-w-[390px] grid-cols-2 border border-[#CFC9BE]">
              <button className="flex h-[66px] items-center gap-2 bg-[#202957] px-4 text-left text-[12px] font-semibold text-white"><Plus size={16} strokeWidth={1.7} /> Report lost</button>
              <button className="flex h-[66px] items-center gap-2 bg-[#D9E7DE] px-4 text-left text-[12px] font-semibold text-[#284338]"><Plus size={16} strokeWidth={1.7} /> Report found</button>
            </div>
          </div>
        </section>

        <section className="border-b border-[#D7D2C7] py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex h-11 w-full items-center gap-3 border-b-2 border-[#202957] bg-[#FAF8F3] px-3 lg:max-w-[470px]">
              <Search size={17} className="text-[#70736F]" strokeWidth={1.7} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search item, place or category" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#94948F]" />
            </label>
            <nav className="flex gap-5 overflow-x-auto no-scrollbar">
              {filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`shrink-0 border-b-2 pb-2 text-[11px] font-semibold ${activeFilter === filter ? "border-[#6758C8] text-[#6758C8]" : "border-transparent text-[#777871] hover:text-[#202957]"}`}>{filter}</button>)}
            </nav>
          </div>
        </section>

        <section className="pt-7 sm:pt-9">
          <div className="mb-5 flex items-end justify-between">
            <div><h2 className="text-[21px] font-bold tracking-[-0.04em]">Items around campus</h2><p className="mt-1 text-[11px] text-[#7A7B76]">Recent lost and found reports</p></div>
            <span className="text-[11px] text-[#7A7B76]">{filteredItems.length} results</span>
          </div>

          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <button key={item.id} className="group text-left">
                <div className="relative aspect-[1.22/1] overflow-hidden" style={{ backgroundColor: item.color }}>
                  <div className="absolute inset-0 flex items-center justify-center text-[58px] font-bold tracking-[-0.08em] text-[#202957]/10">{item.title.slice(0, 2).toUpperCase()}</div>
                  <span className={`absolute left-3 top-3 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${item.type === "lost" ? "bg-[#6758C8] text-white" : "bg-[#315D4A] text-white"}`}>{item.type}</span>
                </div>
                <div className="border-b border-[#D7D2C7] pb-4 pt-3">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="text-[14px] font-semibold tracking-[-0.02em]">{item.title}</h3><p className="mt-1 text-[11px] text-[#777871]">{item.category}</p></div><span className="text-[10px] text-[#777871]">View →</span></div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#6F716D]"><span className="inline-flex items-center gap-1"><MapPin size={10} />{item.location}</span><span className="inline-flex items-center gap-1"><Clock3 size={10} />{item.time}</span></div>
                </div>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && <div className="border-y border-[#D7D2C7] py-16 text-center"><p className="text-[13px] font-semibold">No matching reports</p><p className="mt-1 text-[11px] text-[#7A7B76]">Try a different search or category.</p></div>}
        </section>
      </div>
    </main>
  );
}
