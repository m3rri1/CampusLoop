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

const cardTints = ["#E7E1F7", "#E7EEF1", "#F1E7D8", "#E4EBD9", "#E9E1EC"];

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
    <main className="min-h-screen bg-[#EDEAE3] text-[#17191F]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#F8F5EE] shadow-[0_0_0_1px_rgba(23,25,31,0.03)]">
        <header className="px-5 pb-0 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#17191F] text-sm font-bold text-white">C</div>
              <div>
                <span className="block text-[17px] font-bold tracking-[-0.035em]">CampusLoop</span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[#77756F]">Campus marketplace</span>
              </div>
            </Link>
            <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCD8CF] bg-[#F8F5EE] text-[#45474D] hover:bg-white">
              <Bell size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7356D8]">Marketplace</p>
                <h1 className="mt-1 text-[30px] font-bold tracking-[-0.05em] sm:text-[38px]">Find something useful.</h1>
              </div>
              <span className="hidden text-right text-[11px] font-medium leading-4 text-[#77756F] sm:block">Buy, sell and reuse<br />within your campus.</span>
            </div>

            <div className="mt-6 flex h-12 items-center gap-3 rounded-[16px] border border-[#DCD8CF] bg-white/70 px-4 shadow-[0_2px_10px_rgba(23,25,31,0.025)] focus-within:border-[#A99BD9]">
              <Search size={18} className="shrink-0 text-[#85837E]" strokeWidth={1.8} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books, gadgets, notes..."
                className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-[#99968F]"
              />
              <button aria-label="Filters" className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0EDE6] text-[#4C4A46] sm:flex">
                <SlidersHorizontal size={15} strokeWidth={1.8} />
              </button>
            </div>

            <nav className="mt-6 flex gap-7 overflow-x-auto border-b border-[#DDD9D0] no-scrollbar">
              {categories.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`relative shrink-0 pb-3 text-[12px] font-bold ${category === id ? "text-[#17191F]" : "text-[#88857E]"}`}
                >
                  {label}
                  {category === id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6546D9]" />}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <section className="px-5 pb-16 pt-7 sm:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-[18px] font-bold tracking-[-0.025em]">All listings</h2>
              <p className="mt-1 text-[11px] font-medium text-[#8A8881]">{items.length} items on campus</p>
            </div>
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-[#55534E]">
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
                  <article className="overflow-hidden rounded-[22px] border border-[#E1DDD4] bg-white/80 transition-transform duration-300 hover:-translate-y-0.5">
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
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFFDF9]/95 text-[#36383E] shadow-[0_2px_9px_rgba(0,0,0,0.09)]"
                      >
                        <Heart size={15} strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="px-3.5 pb-4 pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 text-[12px] font-bold leading-[17px] tracking-[-0.01em] line-clamp-2">{item.title}</h3>
                        <span className="shrink-0 text-[12px] font-extrabold text-[#6546D9]">₹{item.price}</span>
                      </div>
                      <p className="mt-2 text-[10px] font-medium capitalize text-[#77756F]">{item.condition.replace("-", " ")}</p>
                      <p className="mt-1 truncate text-[10px] text-[#96938C]">{item.sellerName} · {item.location}</p>
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
