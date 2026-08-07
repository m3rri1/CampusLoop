"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const categories = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "electronics", label: "Electronics" },
  { id: "clothing", label: "Clothing" },
  { id: "stationery", label: "Stationery" },
];

interface MarketplaceHeaderProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MarketplaceHeader({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: MarketplaceHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white pb-3 pt-4 px-4 border-b border-gray-100">
      {/* App name row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Marketplace</h1>
          <p className="text-xs text-gray-400">CampusLoop</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search books, gadgets, clothes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <button className="bg-[#6759FF] p-2.5 rounded-xl shrink-0">
          <SlidersHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-[#6759FF] text-white border-[#6759FF]"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}