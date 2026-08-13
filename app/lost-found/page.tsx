"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Bell, Clock3, MapPin, Plus, Search } from "lucide-react";

const items = [
  { id: "1", type: "lost", title: "Black AirPods case", category: "Electronics", location: "Central Library", time: "2 hours ago", color: "#D8D3EF" },
  { id: "2", type: "found", title: "Blue water bottle", category: "Personal", location: "Sports Complex", time: "5 hours ago", color: "#D1E3D8" },
  { id: "3", type: "lost", title: "Student ID card", category: "Documents", location: "Block B", time: "Yesterday", color: "#D5DDF0" },
  { id: "4", type: "found", title: "Scientific calculator", category: "Study", location: "Engineering Lab", time: "Yesterday", color: "#E8DCC6" },
  { id: "5", type: "lost", title: "Grey hoodie", category: "Clothing", location: "Cafeteria", time: "2 days ago", color: "#D9DEE2" },
  { id: "6", type: "found", title: "USB drive", category: "Electronics", location: "CS Department", time: "2 days ago", color: "#DDD5E7" },
];

const filters = ["All", "Lost", "Found", "Electronics", "Study", "Personal", "Documents"];

export default function LostFoundPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const text = `${item.title} ${item.category} ${item.location}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Lost" && item.type === "lost") ||
        (activeFilter === "Found" && item.type === "found") ||
        item.category === activeFilter;
      return matchesQuery && matchesFilter;
    }),
    [activeFilter, query]
  );

  return (
    <main className="min-h-screen bg-[#EEEAE1] text-[#171D36]">
      <div className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-7 lg:px-10">
        <header className="flex h-[72px] items-center justify-between border-b border-[#CFC9BE]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#171D36] text-[12px] font-black text-white">
              C<span className="text-[#8170E5]">L</span>
            </div>
            <div className="leading-none">
              <div className="text-[14px] font-bold tracking-[-0.03em]">CampusLoop</div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-[#77736D]">Lost &amp; Found</div>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 border-l border-[#CFC9BE] pl-4 text-[11px] font-semibold text-[#42475A] sm:pl-5">
            <Bell size={16} strokeWidth={1.7} />
            <span>My reports</span>
          </button>
        </header>

        <section className="grid border-b border-[#CFC9BE] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="py-9 pr-0 lg:border-r lg:border-[#CFC9BE] lg:py-12 lg:pr-12">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6653C5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6653C5]" /> Campus utility
            </div>
            <h1 className="mt-4 max-w-[590px] text-[38px] font-black leading-[0.98] tracking-[-0.065em] sm:text-[52px]">
              Lost something?<br />
              <span className="text-[#6653C5]">Start here.</span>
            </h1>
            <p className="mt-5 max-w-[500px] text-[13px] leading-6 text-[#666660]">
              Search what students have reported around campus. If you found something, put it back into the loop.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-8 py-7 lg:py-12 lg:pl-12">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-[#CFC9BE] bg-[#CFC9BE]">
              <button className="group flex min-h-[112px] flex-col justify-between bg-[#171D36] p-4 text-left text-white transition hover:bg-[#22294A]">
                <Plus size={18} strokeWidth={1.7} />
                <span className="flex items-end justify-between text-[12px] font-bold">
                  Report lost
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
              <button className="group flex min-h-[112px] flex-col justify-between bg-[#D8E5D9] p-4 text-left text-[#24382D] transition hover:bg-[#CCDDCE]">
                <Plus size={18} strokeWidth={1.7} />
                <span className="flex items-end justify-between text-[12px] font-bold">
                  Report found
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </div>
            <div className="flex items-baseline justify-between border-t border-[#CFC9BE] pt-4 text-[11px]">
              <span className="text-[#77736D]">Open reports</span>
              <span className="font-bold text-[#171D36]">{items.length}</span>
            </div>
          </div>
        </section>

        <section className="border-b border-[#CFC9BE] py-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="flex h-12 items-center gap-3 border-b-2 border-[#171D36] bg-[#F4F1E9] px-3">
              <Search size={18} strokeWidth={1.7} className="text-[#666660]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search item, place or category"
                className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-[#8D8A82]"
              />
            </label>
            <nav className="flex gap-5 overflow-x-auto no-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 border-b-2 pb-2 text-[11px] font-bold transition ${
                    activeFilter === filter
                      ? "border-[#6653C5] text-[#6653C5]"
                      : "border-transparent text-[#77736D] hover:text-[#171D36]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </nav>
          </div>
        </section>

        <section className="grid gap-8 pt-8 lg:grid-cols-[180px_1fr] lg:gap-12 lg:pt-10">
          <aside className="hidden lg:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#77736D]">Browse</p>
            <p className="mt-3 text-[13px] font-semibold leading-5 text-[#4E514F]">Recent reports from students across campus.</p>
            <div className="mt-8 border-t border-[#CFC9BE] pt-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#77736D]">Showing</p>
              <p className="mt-1 text-[24px] font-black tracking-[-0.05em]">{filteredItems.length}</p>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-end justify-between border-b border-[#CFC9BE] pb-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#77736D]">Latest</p>
                <h2 className="mt-1 text-[22px] font-black tracking-[-0.045em]">Reports around campus</h2>
              </div>
              <span className="text-[10px] font-semibold text-[#77736D]">{filteredItems.length} results</span>
            </div>

            <div className="divide-y divide-[#CFC9BE] border-y border-[#CFC9BE]">
              {filteredItems.map((item, index) => (
                <button key={item.id} className="group grid w-full grid-cols-[28px_88px_1fr_auto] items-center gap-3 py-4 text-left sm:grid-cols-[34px_110px_1fr_auto] sm:gap-4 sm:py-5">
                  <span className="self-start pt-1 text-[9px] font-bold tabular-nums text-[#99958C]">0{index + 1}</span>
                  <div className="relative h-[68px] overflow-hidden sm:h-[82px]" style={{ backgroundColor: item.color }}>
                    <span className={`absolute left-0 top-0 px-2 py-1 text-[7px] font-black uppercase tracking-[0.12em] ${item.type === "lost" ? "bg-[#6653C5] text-white" : "bg-[#365C4B] text-white"}`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-bold tracking-[-0.015em] sm:text-[14px]">{item.title}</h3>
                    <p className="mt-1 text-[10px] font-medium text-[#77736D]">{item.category}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-[#6E6C67]">
                      <span className="inline-flex items-center gap-1"><MapPin size={10} />{item.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 size={10} />{item.time}</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} strokeWidth={1.5} className="text-[#88847C] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="border-b border-[#CFC9BE] py-16 text-center">
                <p className="text-[13px] font-bold">Nothing matches that search.</p>
                <p className="mt-1 text-[11px] text-[#77736D]">Try another item, place or category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
