"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { mockItems } from "@/lib/mock-data";

const categories = [
  ["all", "All items"],
  ["books", "Books"],
  ["electronics", "Electronics"],
  ["stationery", "Study"],
  ["clothing", "Clothing"],
] as const;

const cardTints = [
  "#E4E8D8",
  "#E7E0F4",
  "#F1E6D7",
  "#E1E9E3",
  "#E9E2EF",
  "#E9E7D7",
  "#DDE7EE",
  "#F0DFE1",
];

export default function MarketplacePage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const items = useMemo(
    () =>
      mockItems.filter((item) => {
        const categoryMatch =
          category === "all" || item.category === category;

        const queryMatch = item.title
          .toLowerCase()
          .includes(query.toLowerCase());

        return categoryMatch && queryMatch;
      }),
    [category, query]
  );

  return (
    <main className="min-h-screen bg-[#4E3439] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">

        {/* PAGE CONTENT */}
        <div className="px-5 pt-7 sm:px-8 sm:pt-9">

          {/* PAGE INTRO */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">
              Campus marketplace
            </p>

            <h1 className="mt-2 text-[30px] font-bold tracking-[-0.055em] text-[#172044] sm:text-[38px]">
              Marketplace
            </h1>

            <p className="mt-1.5 text-[13px] font-medium text-[#6D7184]">
              Buy and sell useful things within your campus.
            </p>
          </section>

          {/* SEARCH */}
          <div className="mt-6 flex h-12 items-center gap-3 rounded-[16px] border border-[#E1DDD4] bg-[#FFFDF9] px-4 shadow-[0_3px_14px_rgba(23,32,68,0.035)] focus-within:border-[#B8ACE4]">
            <Search
              size={18}
              className="shrink-0 text-[#8A8C9A]"
              strokeWidth={1.8}
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings, books, tech..."
              className="w-full bg-transparent text-[13px] font-medium text-[#172044] outline-none placeholder:text-[#9B9CA6]"
            />

            <button
              type="button"
              aria-label="Filters"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F0ECFA] text-[#5E50A1]"
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />
            </button>
          </div>

          {/* CATEGORIES */}
          <nav className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(([id, label]) => (
              <button
                key={id}
                type="button"
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

        {/* LISTINGS */}
        <section className="px-5 pb-16 pt-8 sm:px-8">

          {/* SECTION HEADER */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-[19px] font-bold tracking-[-0.03em] text-[#172044]">
                All listings
              </h2>

              <p className="mt-1 text-[11px] font-medium text-[#858796]">
                {items.length}{" "}
                {items.length === 1 ? "item" : "items"} available on campus
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-[#E2DED5] bg-[#FFFDF9] px-3.5 py-2 text-[11px] font-semibold text-[#4F5366]"
            >
              Newest
              <ChevronDown size={14} />
            </button>
          </div>

          {/* EMPTY STATE */}
          {items.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#D3CFC6] bg-white/60 py-20 text-center">
              <p className="text-sm font-semibold text-[#172044]">
                No listings found
              </p>

              <p className="mt-1 text-xs text-[#898781]">
                Try another search or category.
              </p>
            </div>
          ) : (
            /* LISTING GRID */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.id}`}
                  className="group min-w-0"
                >
                  <article className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,32,68,0.07)]">

                    {/* IMAGE */}
                    <div
                      className="relative aspect-[0.94] overflow-hidden"
                      style={{
                        backgroundColor:
                          cardTints[index % cardTints.length],
                      }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />

                      {/* SAVE */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        aria-label="Save listing"
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFFDF9]/95 text-[#343A56] shadow-[0_2px_9px_rgba(23,32,68,0.09)]"
                      >
                        <Heart
                          size={15}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    {/* CARD DETAILS */}
                    <div className="px-3.5 pb-4 pt-3">
                      <div className="flex items-start justify-between gap-2">

                        <h3 className="min-w-0 line-clamp-2 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540]">
                          {item.title}
                        </h3>

                        <span className="shrink-0 text-[12px] font-extrabold text-[#5E4BD1]">
                          ₹{item.price}
                        </span>

                      </div>

                      {/* CONDITION */}
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${
                          item.condition === "like-new"
                            ? "bg-[#E7F0DE] text-[#587145]"
                            : "bg-[#EEE7FA] text-[#6650A5]"
                        }`}
                      >
                        {item.condition.replace("-", " ")}
                      </span>

                      {/* SELLER */}
                      <p className="mt-2 truncate text-[10px] font-medium text-[#7E8190]">
                        {item.sellerName} · {item.location}
                      </p>
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