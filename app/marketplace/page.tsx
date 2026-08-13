"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Heart, Search, SlidersHorizontal } from "lucide-react";
import { mockItems } from "@/lib/mock-data";

const categories = [
  ["all", "All items"],
  ["books", "Books"],
  ["electronics", "Electronics"],
  ["stationery", "Study"],
  ["clothing", "Clothing"],
] as const;

const cardTints = [
  "#E4E8D8", // sage
  "#E7E0F4", // lavender
  "#F1E6D7", // warm sand
  "#E1E9E3", // pale green
  "#E9E2EF", // lilac
  "#E9E7D7", // soft yellow
  "#DDE7EE", // powder blue
  "#F0DFE1", // blush
];

export default function MarketplacePage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const items = useMemo(
    () =>
      mockItems.filter((item) => {
        const categoryMatch = category === "all" || item.category === category;
        const queryMatch = item.title.toLowerCase().includes(query.toLowerCase());
        return categoryMatch && queryMatch;
      }),
    [category, query]
  );

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
                <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#85879A]">Campus marketplace</span>
              </div>
            </Link>
            <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DED4] bg-[#FFFDF9] text-[#303756] hover:bg-white">
              <Bell size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">Campus marketplace</p>
            <div className="mt-1 flex items-end justify-between gap-5">
              <div>
                <h1 className="text-[30px] font-bold tracking-[-0.055em] text-[#172044] sm:text-[38px]">Marketplace</h1>
                <p className="mt-1.5 text-[13px] font-medium text-[#6D7184]">Buy and sell useful things within your campus.</p>
              </div>
              <div className="hidden h-20 w-28 overflow-hidden rounded-[24px] bg-[#E6EFD9] sm:block">
                <div className="relative h-full w-full">
                  <span className="absolute bottom-0 left-9 h-14 w-12 rounded-t-full bg-[#A8C28F]" />
                  <span className="absolute left-6 top-4 h-7 w-10 -rotate-12 rounded-full bg-[#B9D0A4]" />
                  <span className="absolute right-4 top-2 h-8 w-11 rotate-12 rounded-full bg-[#C9DBB7]" />
                  <span className="absolute bottom-0 right-5 h-9 w-16 rounded-t-[16px] bg-[#D9D2EE]" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex h-12 items-center gap-3 rounded-[16px] border border-[#E1DDD4] bg-[#FFFDF9] px-4 shadow-[0_3px_14px_rgba(23,32,68,0.035)] focus-within:border-[#B8ACE4]">
              <Search size={18} className="shrink-0 text-[#8A8C9A]" strokeWidth={1.8} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings, books, tech..."
                className="w-full bg-transparent text-[13px] font-medium text-[#172044] outline-none placeholder:text-[#9B9CA6]"
              />
              <button aria-label="Filters" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F0ECFA] text-[#5E50A1]">
                <SlidersHorizontal size={15} strokeWidth={1.8} />
              </button>
            </div>

            <nav className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`flex h-9 shrink-0 items-center rounded-full border px-4 text-[12px] font-semibold transition-colors ${
                    category === id
                      ? "border-[#D8CCF4] bg-[#F0EBFF] text-[#5944C7]"
                      : "border-[#E3DFD6] bg-[#FFFDF9] text-[#6F7280] hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <section className="px-5 pb-16 pt-8 sm:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-[19px] font-bold tracking-[-0.03em] text-[#172044]">All listings</h2>
              <p className="mt-1 text-[11px] font-medium text-[#858796]">{items.length} items available on campus</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-full border border-[#E2DED5] bg-[#FFFDF9] px-3.5 py-2 text-[11px] font-semibold text-[#4F5366]">
              Newest <ChevronDown size={14} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#D3CFC6] bg-white/60 py-20 text-center">
              <p className="text-sm font-semibold">No listings found</p>
              <p className="mt-1 text-xs text-[#898781]">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item, index) => (
                <Link key={item.id} href={`/marketplace/${item.id}`} className="group min-w-0">
                  <article className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,32,68,0.07)]">
                    <div className="relative aspect-[0.94] overflow-hidden" style={{ backgroundColor: cardTints[index % cardTints.length] }}>
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                      <button
                        onClick={(e) => e.preventDefault()}
                        aria-label="Save listing"
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFFDF9]/95 text-[#343A56] shadow-[0_2px_9px_rgba(23,32,68,0.09)]"
                      >
                        <Heart size={15} strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="px-3.5 pb-4 pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540] line-clamp-2">{item.title}</h3>
                        <span className="shrink-0 text-[12px] font-extrabold text-[#5E4BD1]">₹{item.price}</span>
                      </div>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${item.condition === "like-new" ? "bg-[#E7F0DE] text-[#587145]" : "bg-[#EEE7FA] text-[#6650A5]"}`}>
                        {item.condition.replace("-", " ")}
                      </span>
                      <p className="mt-2 truncate text-[10px] font-medium text-[#7E8190]">{item.sellerName} · {item.location}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
