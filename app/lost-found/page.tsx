"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Plus, ChevronRight, ShieldCheck } from "lucide-react";
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

const supabase = createClient();

export default function LostFoundPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<"all" | "lost" | "found">("all");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchReports() {
      setLoading(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("lost_found_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .abortSignal(controller.signal);

        if (!isMounted) return;

        if (fetchError) {
          setReports([]);
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        setReports((data ?? []) as Report[]);
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;

        setReports([]);
        setError(
          error instanceof Error
            ? error.name === "AbortError"
              ? "The Lost & Found request timed out. Check your Supabase connection and try again."
              : error.message
            : "Could not load Lost & Found reports."
        );
        setLoading(false);
      }
    }

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 10000);

    fetchReports();

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const matchesType = type === "all" || item.type === type;

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
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

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

  const lostCount = reports.filter((r) => r.type === "lost").length;
  const foundCount = reports.filter((r) => r.type === "found").length;

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-24">
        <div className="mx-auto max-w-5xl">

          {/* HERO PANEL */}
          <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-7 pt-9 text-white sm:px-8 sm:pb-9 sm:pt-11">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#C2661A]/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[#6654D9]/25 blur-3xl"
            />

            <div className="relative flex items-center justify-between gap-3">
  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F3C89A]">
    Lost &amp; Found
  </p>

  <Link
    href="/lost-found/my-reports"
    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
  >
    My reports
  </Link>
</div>

            <h1 className="relative mt-2 text-[30px] font-bold leading-[1] tracking-[-0.05em] sm:text-[38px]">
              Find it. Return it.
            </h1>

            <p className="relative mt-2 max-w-md text-[12.5px] leading-5 text-[#C8C6E0]">
              Find things reported lost or found around your campus.
            </p>

            {/* SEARCH — inside the hero */}
            <div className="relative mt-5 flex h-12 items-center gap-3 rounded-[15px] bg-white px-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <Search size={17} className="shrink-0 text-[#6952D7]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items, places or categories"
                className="w-full bg-transparent text-[13px] text-[#172044] outline-none placeholder:text-[#9C9AB0]"
              />
            </div>

            {/* STAT ROW */}
            <div className="relative mt-4 flex gap-4 text-[10.5px] font-semibold text-[#DCD6FF]">
              <span>{loading ? "…" : reports.length} total reports</span>
              <span className="text-white/30">•</span>
              <span>{loading ? "…" : lostCount} lost</span>
              <span className="text-white/30">•</span>
              <span>{loading ? "…" : foundCount} found</span>
            </div>
          </section>

          <div className="px-5 sm:px-8">

            {/* CATEGORY PILL RAIL */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => {
                const active = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[10.5px] font-semibold transition ${
                      active
                        ? "border-[#DDD3FF] bg-[#EEE9FF] text-[#5D48D2]"
                        : "border-[#E1DDD4] bg-[#FFFDF9] text-[#5B6072] hover:border-[#D8D0F5]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* LOST / FOUND SEGMENTED CONTROL */}
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
                      onClick={() => setType(value as "all" | "lost" | "found")}
                      className={`rounded-full px-4 py-1.5 text-[10px] font-semibold transition ${
                        active ? "bg-[#292B68] text-white" : "text-[#555A6D]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] font-semibold text-[#858796]">
                {loading ? "Loading..." : `${filteredReports.length} reports`}
              </span>
            </div>

            {/* CONTENT */}
            <section className="mt-5">

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

              {!loading && !error && filteredReports.length === 0 && (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                    <Search size={19} />
                  </div>
                  <h2 className="mt-4 text-[14px] font-bold">No reports found</h2>
                  <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#858796]">
                    {reports.length === 0
                      ? "There are no Lost & Found reports yet."
                      : "Try changing your search or filters."}
                  </p>
                </div>
              )}

              {!loading && !error && filteredReports.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredReports.map((item) => {
                    const isClaimed = item.status === "claimed";

                    return (
                      <Link
                        key={item.id}
                        href={`/lost-found/${item.id}`}
                        className={`group overflow-hidden rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,32,68,0.1)] ${
                          isClaimed ? "opacity-60" : ""
                        }`}
                      >
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
                                : "bg-[#FFE9D6] text-[#C2661A]"
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
                              <MapPin size={11} className="shrink-0 text-[#858796]" />
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

            {/* TRUST STRIP — matches Home page's, reinforces safe handover */}
            <section className="mt-6">
              <div className="flex items-start gap-3 rounded-[18px] border border-[#DDD6FF] bg-[#F6F3FF] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold">Claim safely</p>
                  <p className="mt-1 text-[10px] leading-4 text-[#70738A]">
                    Every claim goes through identity verification before
                    handover — no fake claims, no stolen items.
                  </p>
                </div>
              </div>
            </section>
          </div>
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