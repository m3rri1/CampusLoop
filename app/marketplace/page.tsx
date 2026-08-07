"use client";

import { useState, useMemo } from "react";
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
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-md md:max-w-3xl lg:max-w-6xl mx-auto bg-white min-h-screen md:shadow-sm">
        <MarketplaceHeader
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="px-4 py-4">
          <FeaturedBanner />
          <p className="text-xs text-gray-400 mb-3">
            {filteredItems.length} listing{filteredItems.length !== 1 ? "s" : ""}
          </p>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No items match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}