"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Clock3,
  ChevronRight,
  PackageSearch,
  SlidersHorizontal,
  Bell,
} from "lucide-react";

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

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = `${item.title} ${item.category} ${item.location}`
          .toLowerCase()
          .includes(query.toLowerCase());
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
    <main className="min-h-screen bg-[#F5F3ED] text-[#18213A]">
      <div className="mx-auto min-h-screen max-w-[1100px] px-4 pb-12 sm:px-7 lg:px-10">
        <header className="border-b border-[#E3DFD6] py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#292F72] text-[13px] font-bold text-white">
                C<span className="text-[#B8A8F4]">L</span>
              </div>
              <div>
                <p className="text-[14px] font-bold tracking-[-0.02em]">CampusLoop</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#88839A]">Lost &amp; Found</p>
              </div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DDD9D0] bg-[#FAF9F5] text-[#292F72] sm:hidden">
              <Bell size={17} strokeWidth={1.8} />
            </button>
            <button className="hidden rounded-full border border-[#DDD9D0] bg-[#FAF9F5] px-4 py-2 text-[11px] font-bold text-[#292F72] sm:block">
              My reports
            </button>
          </div>

          <div className="mt-7 flex items-end justify-between gap-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7059D4]">Campus Lost &amp; Found</p>
              <h1 className="mt-2 max-w-[620px] text-[27px] font-bold leading-[1.08] tracking-[-0.045em] sm:text-[35px]">
                Find it. Return it.
              </h1>
              <p className="mt-2 max-w-[540px] text-[12px] leading-5 text-[#777A86] sm:text-[13px]">
                Search items reported by students or post something you have lost or found.
              </p>
            </div>
            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#E7E1FA] text-[#51469B] sm:flex">
              <PackageSearch size={29} strokeWidth={1.35} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:max-w-[500px]">
            <button className="flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-[#292F72] text-[11px] font-bold text-white shadow-[0_5px_15px_rgba(41,47,114,0.14)]">
              <Plus size={15} /> Report lost
            </button>
            <button className="flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-[#D9D5CC] bg-[#FBFAF7] text-[11px] font-bold text-[#292F72]">
              <PackageSearch size={15} /> Report found
            </button>
          </div>
        </header>

        <section className="pt-5">
          <div className="flex h-11 items-center gap-2.5 rounded-[13px] border border-[#DEDAD2] bg-[#FBFAF7] px-3.5 shadow-[0_1px_2px_rgba(20,25,45,0.02)] focus-within:border-[#A99ADE]">
            <Search size={17} className="shrink-0 text-[#898A91]" strokeWidth={1.8} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, place or category"
              className="min-w-0 w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-[#9A9AA0]"
            />
            <button className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0EDF7] text-[#51469B] sm:flex" aria-label="Filters">
              <SlidersHorizontal size={14} />
            </button>
          </div>

          <div className="mt-4 flex gap-1 rounded-[13px] bg-[#EAE7DF] p-1 sm:hidden">
            {["All", "Lost", "Found"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 rounded-[9px] py-2 text-[10px] font-bold ${activeFilter === filter ? "bg-[#FBFAF7] text-[#292F72] shadow-sm" : "text-[#777883]"}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold transition ${
                  activeFilter === filter
                    ? "bg-[#292F72] text-white"
                    : "border border-[#DDD9D1] bg-[#FBFAF7] text-[#70727D] hover:text-[#292F72]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 sm:mt-9">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#918C99]">Recent reports</p>
              <h2 className="mt-1 text-[18px] font-bold tracking-[-0.03em] sm:text-[20px]">Around campus</h2>
            </div>
            <span className="text-[10px] font-semibold text-[#858691]">{filteredItems.length} reports</span>
          </div>

          <div className="space-y-2.5 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <button key={item.id} className="group block w-full text-left">
                <article className="flex min-h-[104px] overflow-hidden rounded-[16px] border border-[#E1DED6] bg-[#FBFAF7] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(38,39,55,0.06)] sm:block sm:min-h-0">
                  <div
                    className="relative flex w-[105px] shrink-0 items-center justify-center sm:h-[135px] sm:w-full"
                    style={{ backgroundColor: item.color }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/70 text-[#3D4385] shadow-[0_5px_15px_rgba(37,45,104,0.07)] sm:h-14 sm:w-14 sm:rounded-[18px]">
                      <PackageSearch size={22} strokeWidth={1.45} />
                    </div>
                    <span
                      className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] sm:left-3 sm:top-3 ${
                        item.type === "lost"
                          ? "bg-[#E9DFFF] text-[#6546B8]"
                          : "bg-[#DDEDE5] text-[#39705A]"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-[12px] font-bold tracking-[-0.01em] sm:text-[13px]">{item.title}</h3>
                        <p className="mt-0.5 text-[9px] font-semibold text-[#8A8A94]">{item.category}</p>
                      </div>
                      <ChevronRight size={15} className="mt-0.5 shrink-0 text-[#A1A0A7] transition group-hover:translate-x-0.5" />
                    </div>
                    <div className="mt-3 space-y-1 text-[9px] font-medium text-[#777984] sm:flex sm:items-center sm:gap-3 sm:space-y-0">
                      <span className="inline-flex min-w-0 items-center gap-1 truncate"><MapPin size={11} />{item.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 size={11} />{item.time}</span>
                    </div>
                  </div>
                </article>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="rounded-[18px] border border-dashed border-[#D8D4CC] bg-[#FBFAF7] px-6 py-14 text-center">
              <p className="text-sm font-bold">No reports found</p>
              <p className="mt-1 text-xs text-[#85858D]">Try another search or category.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
