"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/marketplace/item-card";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { FeaturedBanner } from "@/components/marketplace/featured-banner";
import { mockItems } from "@/lib/mock-data";

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return mockItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;

      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#F6F6F4]">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-white">
        <MarketplaceHeader
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="px-5 pb-12">
          <FeaturedBanner />

          <section id="listings" className="pt-1">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6546D9]">
                  Campus Marketplace
                </p>
                <h2 className="mt-1 text-[22px] font-bold tracking-tight text-[#17233D]">
                  Recently listed
                </h2>
              </div>

              <span className="text-xs font-medium text-[#7A7D86]">
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D9DBE0] bg-[#FBFBFA] py-16 text-center">
                <p className="font-semibold text-[#17233D]">Nothing found</p>
                <p className="mt-1 text-sm text-[#7A7D86]">
                  Try a different search or category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
