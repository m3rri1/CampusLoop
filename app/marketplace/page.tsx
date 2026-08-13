"use client";

import { useMemo, useState } from "react";
import { Search, Bell, Plus, Heart, UserRound, Home } from "lucide-react";
import { ItemCard } from "@/components/marketplace/item-card";
import { mockItems } from "@/lib/mock-data";

const categories = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "electronics", label: "Electronics" },
  { id: "stationery", label: "Notes" },
  { id: "clothing", label: "Fashion" },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => mockItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#171A24]">
      <div className="mx-auto min-h-screen max-w-[1240px] bg-[#FAFAF8]">
        <header className="px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-center justify-between">
            <img src="/campusloop-mark.svg" alt="CampusLoop" className="h-10 w-auto object-contain object-left" />
            <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full text-[#171A24] hover:bg-[#F0F0ED]"><Bell size={19} strokeWidth={1.8} /></button>
          </div>

          <div className="mt-7">
            <h1 className="text-[28px] font-bold tracking-[-0.04em] sm:text-[32px]">Marketplace</h1>
            <p className="mt-1 text-[13px] font-medium text-[#777B86]">Buy, sell and discover things around your campus.</p>
          </div>

          <div className="mt-5 flex h-12 items-center gap-3 border border-[#E5E5E1] bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#B7A9E8]">
            <Search size={18} className="text-[#8A8D95]" strokeWidth={1.8} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search books, electronics, notes..." className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-[#9A9CA3]" />
          </div>

          <nav className="mt-5 flex gap-6 overflow-x-auto border-b border-[#E9E9E6] no-scrollbar">
            {categories.map((category) => (
              <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`relative shrink-0 pb-3 text-[13px] font-semibold ${activeCategory === category.id ? "text-[#171A24]" : "text-[#898C94]"}`}>
                {category.label}
                {activeCategory === category.id && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#6546D9]" />}
              </button>
            ))}
          </nav>
        </header>

        <section className="px-5 pb-28 sm:px-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold tracking-[-0.02em]">Recently listed</h2>
            <button className="text-[12px] font-semibold text-[#6546D9]">See all</button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="border border-dashed border-[#DADAD6] bg-white py-16 text-center">
              <p className="text-sm font-semibold">Nothing found</p>
              <p className="mt-1 text-xs text-[#858891]">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[68px] max-w-[1240px] items-center justify-around border-t border-[#E7E7E3] bg-[#FAFAF8]/95 px-4 backdrop-blur-md sm:bottom-5 sm:max-w-[520px] sm:rounded-full sm:border sm:shadow-[0_8px_30px_rgba(23,26,36,0.08)]">
          <button className="flex flex-col items-center gap-1 text-[#777B86]"><Home size={18} strokeWidth={1.8} /><span className="text-[9px] font-semibold">Home</span></button>
          <button className="flex flex-col items-center gap-1 text-[#6546D9]"><Search size={18} strokeWidth={2} /><span className="text-[9px] font-semibold">Browse</span></button>
          <button className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#171A24] text-white shadow-lg"><Plus size={21} strokeWidth={2} /></button>
          <button className="flex flex-col items-center gap-1 text-[#777B86]"><Heart size={18} strokeWidth={1.8} /><span className="text-[9px] font-semibold">Saved</span></button>
          <button className="flex flex-col items-center gap-1 text-[#777B86]"><UserRound size={18} strokeWidth={1.8} /><span className="text-[9px] font-semibold">Profile</span></button>
        </nav>
      </div>
    </main>
  );
}
