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
    <main className="min-h-screen bg-[#F7F7F5] text-[#17191F]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-white">
        {/* Marketplace header */}
        <header className="border-b border-[#ECECE8] px-5 pb-0 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#17191F] text-sm font-bold text-white">C</div>
              <span className="text-[18px] font-bold tracking-[-0.035em]">CampusLoop</span>
            </Link>
            <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E3DE] text-[#45474D] hover:bg-[#F7F7F5]">
              <Bell size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7356D8]">CampusLoop</p>
              <h1 className="mt-1 text-[30px] font-bold tracking-[-0.045em] sm:text-[36px]">Marketplace</h1>
              <p className="mt-2 text-[13px] text-[#777A82]">Buy and sell useful things within your campus.</p>
            </div>

            <div className="flex h-12 w-full items-center gap-3 rounded-[14px] border border-[#DCDDD8] bg-[#FBFBF9] px-4 md:max-w-[430px]">
              <Search size={18} className="shrink-0 text-[#85888E]" strokeWidth={1.8} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#999B9F]"
              />
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-4">
            <nav className="flex gap-6 overflow-x-auto no-scrollbar">
              {categories.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`relative shrink-0 pb-3 text-[13px] font-semibold ${category === id ? "text-[#17191F]" : "text-[#85878D]"}`}
                >
                  {label}
                  {category === id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7356D8]" />}
                </button>
              ))}
            </nav>

            <button className="mb-2 hidden shrink-0 items-center gap-2 text-[12px] font-semibold text-[#555860] sm:flex">
              <SlidersHorizontal size={15} strokeWidth={1.8} /> Filters
            </button>
          </div>
        </header>

        {/* Listings */}
        <section className="px-5 pb-16 pt-7 sm:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[19px] font-bold tracking-[-0.025em]">All listings</h2>
              <p className="mt-1 text-[11px] text-[#8A8C91]">{items.length} items available on campus</p>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#555860]">
              Newest <ChevronDown size={14} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed border-[#D9D9D4] bg-[#FBFBF9] py-20 text-center">
              <p className="text-sm font-semibold">No listings found</p>
              <p className="mt-1 text-xs text-[#898B91]">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => (
                <Link key={item.id} href={`/marketplace/${item.id}`} className="group min-w-0">
                  <div className="relative aspect-[0.9] overflow-hidden rounded-[18px] bg-[#ECECE8]">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                    <button
                      onClick={(e) => e.preventDefault()}
                      aria-label="Save listing"
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#36383E] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    >
                      <Heart size={15} strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="pt-3 px-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 text-[13px] font-semibold leading-[18px] tracking-[-0.01em] line-clamp-2">{item.title}</h3>
                      <span className="shrink-0 text-[13px] font-bold text-[#7356D8]">₹{item.price}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] capitalize text-[#81838A]">{item.condition.replace("-", " ")} · {item.location}</p>
                    <p className="mt-1 text-[11px] text-[#9A9CA1]">{item.sellerName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
