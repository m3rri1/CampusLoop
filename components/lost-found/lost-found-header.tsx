"use client";

import { Search } from "lucide-react";

const typeFilters = [
  { id: "all", label: "All" },
  { id: "lost", label: "Lost" },
  { id: "found", label: "Found" },
];

interface LostFoundHeaderProps {
  activeType: string;
  onTypeChange: (typeId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function LostFoundHeader({
  activeType,
  onTypeChange,
  searchQuery,
  onSearchChange,
}: LostFoundHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white pb-3 pt-4 px-4 border-b border-gray-100">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">Lost &amp; Found</h1>
        <p className="text-xs text-gray-400">CampusLoop</p>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 mb-3">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search lost or found items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-2">
        {typeFilters.map((f) => {
          const isActive = activeType === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onTypeChange(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-[#6759FF] text-white border-[#6759FF]"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
