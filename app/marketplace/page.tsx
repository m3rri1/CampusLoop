"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Heart, Plus, Search, Sparkles } from "lucide-react";
import { mockItems } from "@/lib/mock-data";

const categories = [
  ["all", "All"],
  ["books", "Books"],
  ["electronics", "Tech"],
  ["stationery", "Study"],
  ["clothing", "Clothing"],
] as const;

export default function MarketplacePage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => mockItems.filter((item) => {
    const categoryMatch = category === "all" || item.category === category;
    const queryMatch = item.title.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  }), [category, query]);

  const featured = mockItems[0];

  return (
    <main className="min-h-screen bg-[#F5F3EE]">
      <div className="mx-auto min-h-screen max-w-[1180px] overflow-hidden bg-[#F5F3EE]">
        <header className="px-5 pb-6 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#17151C] text-sm font-bold text-white">C</span>
              <span className="text-[19px] font-bold tracking-[-0.04em]">CampusLoop</span>
            </Link>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DEDAD1] bg-[#FAF9F6]" aria-label="Notifications">
              <Bell size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-[1fr_360px] md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7867D9]">
                <Sparkles size={13} /> Campus marketplace
              </div>
              <h1 className="max-w-[650px] text-[40px] font-bold leading-[0.98] tracking-[-0.055em] sm:text-[52px]">
                Good things are already on campus.
              </h1>
              <p className="mt-4 max-w-[500px] text-[14px] leading-6 text-[#74716D]">
                Find useful stuff from students around you. Buy it, use it, pass it on.
              </p>
            </div>

            <div className="flex h-12 items-center gap-3 rounded-[15px] border border-[#D9D5CC] bg-[#FBFAF7] px-4 shadow-[0_4px_18px_rgba(35,31,28,0.04)] focus-within:border-[#9A8AE8]">
              <Search size={18} className="text-[#88837C]" strokeWidth={1.8} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your campus..."
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#9A9791]"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 overflow-x-auto border-b border-[#DDD9D1] no-scrollbar">
            {categories.map(([id, label]) => (
              <button key={id} onClick={() => setCategory(id)} className={`relative shrink-0 pb-3 text-[13px] font-semibold ${category === id ? "text-[#17151C]" : "text-[#96918A]"}`}>
                {label}
                {category === id && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#17151C]" />}
              </button>
            ))}
          </div>
        </header>

        <section className="px-5 pb-28 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <Link href={`/marketplace/${featured.id}`} className="group relative min-h-[300px] overflow-hidden rounded-[26px] bg-[#24202B] sm:min-h-[350px]">
              <Image src={featured.imageUrl} alt={featured.title} fill className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17151C] via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">Featured find</span>
                <h2 className="mt-3 max-w-[420px] text-[25px] font-bold leading-tight tracking-[-0.035em] text-white sm:text-[31px]">{featured.title}</h2>
                <div className="mt-2 flex items-center gap-3 text-[12px] text-white/75">
                  <span>₹{featured.price}</span><span>·</span><span>{featured.condition}</span><span>·</span><span>{featured.location}</span>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {mockItems.slice(1, 3).map((item, index) => (
                <Link key={item.id} href={`/marketplace/${item.id}`} className={`group relative overflow-hidden rounded-[26px] ${index === 0 ? "bg-[#D9D0FF]" : "bg-[#E8E0D4]"} min-h-[142px] p-5`}>
                  <div className="relative z-10 max-w-[150px]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">{item.categoryLabel}</p>
                    <h3 className="mt-2 text-[17px] font-bold leading-tight tracking-[-0.025em]">{item.title}</h3>
                    <p className="mt-3 text-[13px] font-bold">₹{item.price}</p>
                  </div>
                  <Image src={item.imageUrl} alt="" fill className="object-cover opacity-20 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-11 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B867F]">Fresh today</p>
              <h2 className="mt-1 text-[23px] font-bold tracking-[-0.04em]">Recently listed</h2>
            </div>
            <span className="text-[12px] font-semibold text-[#8B867F]">{items.length} items</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`} className="group">
                <div className="relative aspect-[0.88] overflow-hidden rounded-[20px] bg-[#E8E5DF]">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <button onClick={(e) => e.preventDefault()} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FBFAF7]/90 backdrop-blur-sm" aria-label="Save item">
                    <Heart size={15} strokeWidth={1.8} />
                  </button>
                </div>
                <div className="pt-3 px-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-semibold leading-[18px] tracking-[-0.01em] line-clamp-2">{item.title}</h3>
                    <span className="shrink-0 text-[13px] font-bold">₹{item.price}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#85817B]">{item.condition} · {item.sellerName}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <button className="fixed bottom-6 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-[#17151C] px-5 text-white shadow-[0_10px_30px_rgba(23,21,28,0.22)] sm:right-8">
          <Plus size={19} /><span className="text-[12px] font-bold">Sell something</span>
        </button>
      </div>
    </main>
  );
}
