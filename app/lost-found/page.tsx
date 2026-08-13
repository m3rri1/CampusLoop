"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, ChevronDown, ChevronRight, MapPin, Plus, Search, SlidersHorizontal } from "lucide-react";

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

const cardTints = [
  "#E4E8D8",
  "#E7E0F4",
  "#F1E6D7",
  "#E1E9E3",
  "#E9E2EF",
  "#E9E7D7",
];

export default function LostFoundPage() {
  const [mode, setMode] = useState<"all" | "lost" | "found">("all");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredReports = useMemo(() => {
    const search = query.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesMode = mode === "all" || report.type === mode;
      const matchesCategory = category === "All" || report.category === category;
      const matchesSearch =
        !search ||
        `${report.title} ${report.category} ${report.location}`.toLowerCase().includes(search);
      return matchesMode && matchesCategory && matchesSearch;
    });
  }, [mode, category, query]);

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] shadow-[0_0_0_1px_rgba(23,32,68,0.03)]">
        <header className="px-5 pb-0 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] bg-[#F0EBFF]">
                <span className="absolute -left-2 -top-3 h-8 w-8 rounded-full bg-[#6C55D9]/20" />
                <span className="relative text-[17px] font-extrabold tracking-[-0.09em] text-[#5D48D2]">CL</span>
              </div>
              <div>
                <span className="block text-[17px] font-bold tracking-[-0.04em] text-[#172044]">Campus<span className="text-[#6952D7]">Loop</span></span>
                <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#85879A]">Lost &amp; Found</span>
              </div>
            </Link>
            <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DED4] bg-[#FFFDF9] text-[#303756] hover:bg-white">
              <Bell size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">Lost &amp; Found</p>
                <h1 className="mt-1 text-[30px] font-bold tracking-[-0.055em] text-[#172044] sm:text-[38px]">Find it. Return it.</h1>
                <p className="mt-1.5 text-[13px] font-medium text-[#6D7184]">Find things reported lost or found around your campus.</p>
              </div>
              <div className="hidden shrink-0 gap-2 sm:flex">
                <Link href="/lost-found/report-lost" className="flex h-10 items-center gap-2 rounded-[14px] bg-[#23265B] px-4 text-[11px] font-semibold text-white">
                  <Plus size={15} /> Report lost
                </Link>
                <Link href="/lost-found/report-found" className="flex h-10 items-center gap-2 rounded-[14px] border border-[#E2DED5] bg-[#FFFDF9] px-4 text-[11px] font-semibold text-[#303756]">
                  <Plus size={15} /> Report found
                </Link>
              </div>
            </div>

            <div className="mt-6 flex h-12 items-center gap-3 rounded-[16px] border border-[#E1DDD4] bg-[#FFFDF9] px-4 shadow-[0_3px_14px_rgba(23,32,68,0.035)] focus-within:border-[#B8ACE4]">
              <Search size={18} className="shrink-0 text-[#8A8C9A]" strokeWidth={1.8} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items, places or categories"
                className="w-full bg-transparent text-[13px] font-medium text-[#172044] outline-none placeholder:text-[#9B9CA6]"
              />
              <button aria-label="Filters" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F0ECFA] text-[#5E50A1]">
                <SlidersHorizontal size={15} strokeWidth={1.8} />
              </button>
            </div>

            <nav className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`flex h-9 shrink-0 items-center rounded-full border px-4 text-[12px] font-semibold transition-colors ${
                    category === item
                      ? "border-[#D8CCF4] bg-[#F0EBFF] text-[#5944C7]"
                      : "border-[#E3DFD6] bg-[#FFFDF9] text-[#6F7280] hover:bg-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <section className="px-5 pb-16 pt-8 sm:px-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-full border border-[#E2DED5] bg-[#FFFDF9] p-1">
              {(["all", "lost", "found"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold capitalize transition-colors ${
                    mode === item ? "bg-[#23265B] text-white" : "text-[#6F7280]"
                  }`}
                >
                  {item === "all" ? "All items" : item}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#858796]">{filteredReports.length} reports</span>
              <button className="hidden items-center gap-1.5 rounded-full border border-[#E2DED5] bg-[#FFFDF9] px-3.5 py-2 text-[11px] font-semibold text-[#4F5366] sm:flex">
                Newest <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#D3CFC6] bg-white/60 py-20 text-center">
              <p className="text-sm font-semibold">No reports found</p>
              <p className="mt-1 text-xs text-[#898781]">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {filteredReports.map((report, index) => (
                <Link key={report.id} href={`/lost-found/${report.id}`} className="group min-w-0">
                  <article className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,32,68,0.07)]">
                    <div className="relative aspect-[0.94] overflow-hidden" style={{ backgroundColor: cardTints[index % cardTints.length] }}>
                      <Image
                        src={report.image}
                        alt={report.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF9]/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#5141A9] shadow-[0_2px_9px_rgba(23,32,68,0.07)]">
                        {report.type}
                      </span>
                    </div>
                    <div className="px-3.5 pb-4 pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 min-w-0 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540] sm:text-[13px]">{report.title}</h2>
                          <p className="mt-1 text-[10px] font-medium text-[#7E8190]">{report.category}</p>
                        </div>
                        <ChevronRight size={15} className="mt-0.5 shrink-0 text-[#9A98A7]" />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEEAF4] pt-3 text-[9px] font-medium text-[#7E8190]">
                        <span className="flex min-w-0 items-center gap-1 truncate"><MapPin size={10} /> {report.location}</span>
                        <span className="shrink-0">{report.time}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="fixed bottom-5 right-5 flex gap-2 sm:hidden">
          <Link href="/lost-found/report-lost" className="flex h-11 items-center gap-2 rounded-full bg-[#23265B] px-4 text-[11px] font-bold text-white shadow-[0_10px_25px_rgba(35,38,91,0.22)]">
            <Plus size={15} /> Report lost
          </Link>
          <Link href="/lost-found/report-found" className="flex h-11 items-center justify-center rounded-full border border-[#DAD6CE] bg-[#FFFDF9] px-4 text-[11px] font-bold text-[#23265B] shadow-[0_10px_25px_rgba(23,32,68,0.08)]">
            Found
          </Link>
        </div>
      </div>
    </main>
  );
}
