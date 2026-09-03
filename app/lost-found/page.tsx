"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bell, MapPin, Search, Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Report = {
  id: string;
  title: string;
  description: string | null;
  type: "lost" | "found";
  category: string;
  location: string;
  specific_area: string | null;
  date_reported: string;
  approximate_time: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
};

const categories = [
  "All",
  "Electronics",
  "Documents",
  "Study",
  "Personal",
  "Clothing",
];

export default function LostFoundPage() {
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<"all" | "lost" | "found">("all");

useEffect(() => {
  console.log("🔥 LOST FOUND EFFECT STARTED");

  const timer = setTimeout(() => {
    console.log("🔥 TIMER FIRED");

    setLoading(false);
    setError("TEST: React loading state is working.");
  }, 3000);

  return () => {
    clearTimeout(timer);
  };
}, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const matchesType =
        type === "all" || item.type === type;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query);

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [reports, search, category, type]);

  function formatTime(date: string) {
    const created = new Date(date);
    const now = new Date();

    const seconds = Math.floor(
      (now.getTime() - created.getTime()) / 1000
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    return `${Math.floor(months / 12)}y ago`;
  }

  return (
    <main className="min-h-screen bg-[#4E3439] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 pb-24 pt-5 sm:px-8">
        <div className="mx-auto max-w-5xl">

          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[13px] font-bold text-[#5D48D2]">
                CL
              </div>

              <div>
                <div className="text-[15px] font-bold tracking-[-0.02em]">
                  CampusLoop
                </div>

                <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#77798B]">
                  Lost &amp; Found
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E1DDD4] bg-[#FFFDF9]"
            >
              <Bell size={16} strokeWidth={1.6} />
            </button>
          </header>

          {/* INTRO */}
          <section className="pt-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#6952D7]">
              Lost &amp; Found
            </p>

            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.055em] sm:text-[36px]">
              Find it. Return it.
            </h1>

            <p className="mt-2 text-[12px] leading-5 text-[#6D7184]">
              Find things reported lost or found around your campus.
            </p>
          </section>

          {/* SEARCH */}
          <div className="mt-5 flex h-11 items-center gap-3 rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5">
            <Search size={16} className="shrink-0 text-[#858796]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, places or categories"
              className="w-full bg-transparent text-[12px] text-[#172044] outline-none placeholder:text-[#999AA5]"
            />
          </div>

          {/* CATEGORIES */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold transition ${
                    active
                      ? "border-[#DDD3FF] bg-[#EEE9FF] text-[#5D48D2]"
                      : "border-[#E1DDD4] bg-[#FFFDF9] text-[#5B6072]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* LOST / FOUND FILTER */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex rounded-full border border-[#E1DDD4] bg-[#FFFDF9] p-1">
              {[
                ["all", "All Items"],
                ["lost", "Lost"],
                ["found", "Found"],
              ].map(([value, label]) => {
                const active = type === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setType(value as "all" | "lost" | "found")
                    }
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold transition ${
                      active
                        ? "bg-[#292B68] text-white"
                        : "text-[#555A6D]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <span className="text-[10px] text-[#858796]">
              {loading ? "Loading..." : `${filteredReports.length} reports`}
            </span>
          </div>

          {/* CONTENT */}
          <section className="mt-5">

            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9]">
                <div className="text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
                  <p className="mt-4 text-[12px] font-semibold text-[#172044]">
                    Loading reports...
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-[20px] border border-[#F0CACA] bg-[#FFF4F4] p-6">
                <p className="text-[13px] font-bold text-[#9F3939]">
                  Could not load reports
                </p>

                <p className="mt-2 break-words text-[11px] leading-5 text-[#A85B5B]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-[12px] bg-[#292B68] px-4 py-2 text-[11px] font-bold text-white"
                >
                  Try again
                </button>
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && filteredReports.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                  <Search size={19} />
                </div>

                <h2 className="mt-4 text-[14px] font-bold">
                  No reports found
                </h2>

                <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#858796]">
                  {reports.length === 0
                    ? "There are no Lost & Found reports yet."
                    : "Try changing your search or filters."}
                </p>
              </div>
            )}

            {/* REPORT GRID */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredReports.map((item) => {
                  const isClaimed = item.status === "claimed";

                  return (
                    <Link
                      key={item.id}
                      href={`/lost-found/${item.id}`}
                      className={`group overflow-hidden rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(23,32,68,0.08)] ${
                        isClaimed ? "opacity-60" : ""
                      }`}
                    >
                      {/* IMAGE */}
                      <div className="relative h-44 w-full bg-[#E9EBDD]">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] text-[#72758A]">
                            No photo
                          </div>
                        )}

                        <span
                          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] ${
                            item.type === "lost"
                              ? "bg-[#EEE9FF] text-[#5D48D2]"
                              : "bg-[#E5F4E9] text-[#287A47]"
                          }`}
                        >
                          {item.type}
                        </span>

                        {isClaimed && (
                          <span className="absolute right-3 top-3 rounded-full bg-[#20223F]/85 px-2.5 py-1 text-[8px] font-bold text-white">
                            Claimed
                          </span>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="line-clamp-1 text-[13px] font-bold text-[#172044]">
                            {item.title}
                          </h3>

                          <ChevronRight
                            size={14}
                            className="shrink-0 text-[#8B8D99] transition group-hover:translate-x-0.5"
                          />
                        </div>

                        <p className="mt-1 text-[9px] font-medium text-[#6D7184]">
                          {item.category}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEEAE2] pt-3">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <MapPin
                              size={11}
                              className="shrink-0 text-[#858796]"
                            />

                            <span className="truncate text-[9px] text-[#6D7184]">
                              {item.location}
                            </span>
                          </div>

                          <span className="shrink-0 text-[9px] text-[#858796]">
                            {formatTime(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* REPORT BUTTON */}
        <Link
          href="/lost-found/report"
          className="fixed bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full bg-[#292B68] px-5 text-[11px] font-bold text-white shadow-[0_8px_25px_rgba(41,43,104,0.28)] transition hover:bg-[#202252]"
        >
          <Plus size={16} />
          Report item
        </Link>
      </div>
    </main>
  );
}