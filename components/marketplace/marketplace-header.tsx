"use client";

import { Search, SlidersHorizontal, Bell } from "lucide-react";

const categories = [
  { id: "all", label: "Everything" },
  { id: "books", label: "Books" },
  { id: "electronics", label: "Electronics" },
  { id: "clothing", label: "Fashion" },
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
    <header className="px-5 pt-5 pb-4 border-b border-[#E8E9EE]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <img
            src="/campusloop-logo.svg"
            alt="CampusLoop"
            className="h-12 w-auto object-contain object-left"
          />
          <p className="mt-1 text-sm text-[#687086]">Your campus, in one loop.</p>
        </div>
        <button
          aria-label="Notifications"
          className="h-10 w-10 shrink-0 rounded-full border border-[#E3E5EA] bg-white flex items-center justify-center hover:bg-[#F6F7F9] transition-colors"
        >
          <Bell size={18} className="text-[#17233D]" />
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-[#DDE0E7] bg-[#F8F9FB] px-4 focus-within:border-[#6546D9] focus-within:bg-white transition-colors">
          <Search size={18} className="shrink-0 text-[#8991A3]" />
          <input
            type="text"
            placeholder="Search books, gadgets, notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm text-[#17233D] outline-none placeholder:text-[#8991A3]"
          />
        </div>
        <button
          aria-label="Filters"
          className="h-12 w-12 shrink-0 rounded-xl bg-[#17233D] flex items-center justify-center hover:bg-[#243451] transition-colors"
        >
          <SlidersHorizontal size={18} className="text-white" />
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {categories.map((category) => {
          const active = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`shrink-0 border px-4 h-9 text-sm font-medium transition-colors ${
                active
                  ? "border-[#17233D] bg-[#17233D] text-white"
                  : "border-[#DDE0E7] bg-white text-[#596176] hover:bg-[#F6F7F9]"
              } rounded-lg`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}