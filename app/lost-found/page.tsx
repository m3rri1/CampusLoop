"use client";

import { useMemo, useState } from "react";
import { Search, Plus, MapPin, Clock3, ChevronRight, PackageSearch } from "lucide-react";

const items = [
  { id: "1", type: "lost", title: "Black AirPods case", category: "Electronics", location: "Central Library", time: "2 hours ago", color: "#E9E2F7" },
  { id: "2", type: "found", title: "Blue water bottle", category: "Personal", location: "Sports Complex", time: "5 hours ago", color: "#DCEBE5" },
  { id: "3", type: "lost", title: "Student ID card", category: "Documents", location: "Block B", time: "Yesterday", color: "#E7E8F5" },
  { id: "4", type: "found", title: "Scientific calculator", category: "Study", location: "Engineering Lab", time: "Yesterday", color: "#F1E8D8" },
  { id: "5", type: "lost", title: "Grey hoodie", category: "Clothing", location: "Cafeteria", time: "2 days ago", color: "#E3E8EE" },
  { id: "6", type: "found", title: "USB drive", category: "Electronics", location: "CS Department", time: "2 days ago", color: "#E8E3F0" },
];

const filters = ["All", "Lost", "Found", "Electronics", "Study", "Personal", "Documents"];

export default function LostFoundPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === "All" || (activeFilter === "Lost" && item.type === "lost") || (activeFilter === "Found" && item.type === "found") || item.category === activeFilter;
    return matchesQuery && matchesFilter;
  }), [activeFilter, query]);

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#18213A]">
      <div className="mx-auto min-h-screen max-w-[1180px] px-5 pb-16 pt-7 sm:px-8">
        <header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#252D68] text-[15px] font-bold text-white">C<span className="text-[#B7A5F4]">L</span></div>
              <div>
                <p className="text-[15px] font-bold tracking-[-0.02em]">CampusLoop</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A829C]">Lost & Found</p>
              </div>
            </div>
            <button className="rounded-full border border-[#DDD9D1] bg-[#FBFAF7] px-4 py-2 text-[11px] font-semibold text-[#252D68]">My reports</button>
          </div>

          <div className="mt-9 max-w-[680px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7259D6]">Campus lost & found</p>
            <h1 className="mt-2 text-[32px] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[40px]">Find what was lost.<br />Return what was found.</h1>
            <p className="mt-3 max-w-[570px] text-[13px] leading-6 text-[#777A86]">Check recent reports from students around campus or report something you have lost or found.</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#252D68] px-5 text-[12px] font-bold text-white shadow-[0_5px_18px_rgba(37,45,104,0.14)]"><Plus size={16} /> Report lost item</button>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#DAD6CE] bg-[#FBFAF7] px-5 text-[12px] font-bold text-[#252D68]"><PackageSearch size={16} /> Report found item</button>
          </div>
        </header>

        <section className="mt-10">
          <div className="flex h-12 items-center gap-3 rounded-[14px] border border-[#DDD9D1] bg-[#FBFAF7] px-4 focus-within:border-[#A998E5]">
            <Search size={18} className="text-[#8C8D95]" strokeWidth={1.8} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an item, place or category..." className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-[#9A9AA1]" />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filters.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold transition ${activeFilter === filter ? "bg-[#252D68] text-white" : "border border-[#DDD9D1] bg-[#FBFAF7] text-[#6F7180] hover:text-[#252D68]"}`}>{filter}</button>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8D8795]">Recent reports</p><h2 className="mt-1 text-[20px] font-bold tracking-[-0.03em]">Items around campus</h2></div>
            <span className="text-[11px] font-semibold text-[#858691]">{filteredItems.length} reports</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <button key={item.id} className="group text-left">
                <article className="overflow-hidden rounded-[20px] border border-[#E1DED7] bg-[#FBFAF7] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(38,39,55,0.07)]">
                  <div className="relative flex h-[150px] items-center justify-center" style={{ backgroundColor: item.color }}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/65 text-[#252D68] shadow-[0_8px_20px_rgba(37,45,104,0.08)]"><PackageSearch size={28} strokeWidth={1.5} /></div>
                    <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${item.type === "lost" ? "bg-[#E9DFFF] text-[#6546B8]" : "bg-[#DDEDE5] text-[#39705A]"}`}>{item.type}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="text-[14px] font-bold tracking-[-0.015em]">{item.title}</h3><p className="mt-1 text-[10px] font-semibold text-[#8A8A94]">{item.category}</p></div><ChevronRight size={16} className="mt-0.5 text-[#A1A0A7] transition group-hover:translate-x-0.5" /></div>
                    <div className="mt-4 flex items-center gap-3 text-[10px] font-medium text-[#777984]"><span className="inline-flex items-center gap-1"><MapPin size={12} />{item.location}</span><span className="inline-flex items-center gap-1"><Clock3 size={12} />{item.time}</span></div>
                  </div>
                </article>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && <div className="rounded-[20px] border border-dashed border-[#D8D4CC] bg-[#FBFAF7] px-6 py-16 text-center"><p className="text-sm font-bold">No reports found</p><p className="mt-1 text-xs text-[#85858D]">Try another search or category.</p></div>}
        </section>
      </div>
    </main>
  );
}
