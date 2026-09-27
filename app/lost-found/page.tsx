"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
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

const supabase = createClient();

function formatTime(date: string) {
  const created = new Date(date);
  const now = new Date();

  const seconds = Math.floor(
    (now.getTime() - created.getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  return `${Math.floor(months / 12)}y ago`;
}

export default function LostFoundPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] =
    useState<"all" | "lost" | "found">("all");

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
          .order("created_at", {
            ascending: false,
          })
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
        category === "All" ||
        item.category === category;

      const matchesType =
        type === "all" ||
        item.type === type;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.description ?? "")
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesType &&
        matchesSearch
      );
    });
  }, [reports, search, category, type]);

  const lostCount = reports.filter(
    (report) => report.type === "lost"
  ).length;

  const foundCount = reports.filter(
    (report) => report.type === "found"
  ).length;

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">
        <div className="mx-auto max-w-5xl">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-b-[32px] bg-[linear-gradient(115deg,#202660_0%,#2F337B_48%,#4D43B3_100%)] px-5 pb-7 pt-7 text-white sm:px-8 sm:pb-9 sm:pt-9">
            {/* Decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/[0.06]"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute right-8 top-20 h-32 w-32 rounded-full border border-white/[0.06]"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 left-12 h-48 w-48 rounded-full bg-[#7568D8]/20 blur-3xl"
            />

            {/* HERO TOP */}
            <div className="relative flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#F2C79A]">
                Lost &amp; Found
              </p>

              <Link
                href="/lost-found/my-reports"
                className="rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[10px] font-semibold text-white transition hover:bg-white/[0.13]"
              >
                My reports
              </Link>
            </div>

            {/* HERO TITLE */}
            <h1 className="relative mt-2 text-[29px] font-bold leading-[1.05] tracking-[-0.05em] sm:text-[36px]">
              Find it. Return it.
            </h1>

            <p className="relative mt-1.5 max-w-md text-[12px] leading-5 text-[#D0CDED]">
              Find things reported lost or found around your
              campus.
            </p>

            {/* SEARCH */}
            <div className="relative mt-5 flex h-12 items-center gap-3 rounded-[14px] bg-white px-4 shadow-[0_8px_25px_rgba(0,0,0,0.18)]">
              <Search
                size={17}
                className="shrink-0 text-[#5E4BD1]"
                strokeWidth={1.8}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search items, places or categories"
                className="w-full min-w-0 bg-transparent text-[12px] font-medium text-[#172044] outline-none placeholder:text-[#9B9CA6]"
              />
            </div>

            {/* STATS */}
            <div className="relative mt-3.5 flex gap-3.5 text-[10px] font-semibold text-[#DDD8F7]">
              <span>
                {loading ? "…" : reports.length} total reports
              </span>

              <span className="text-white/30">•</span>

              <span>
                {loading ? "…" : lostCount} lost
              </span>

              <span className="text-white/30">•</span>

              <span>
                {loading ? "…" : foundCount} found
              </span>
            </div>

            {/* REPORT ACTIONS */}
            <div className="relative mt-4 flex flex-wrap gap-2 sm:hidden">
              <Link
                href="/lost-found/report-lost"
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[10px] font-semibold"
                style={{
                  color: "#202660",
                }}
              >
                <Plus size={13} />
                Report lost
              </Link>

              <Link
                href="/lost-found/report-found"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.10] px-3.5 text-[10px] font-semibold text-white"
              >
                <Plus size={13} />
                Report found
              </Link>
            </div>
          </section>

          {/* CONTENT */}
          <div className="px-5 sm:px-8">
            {/* CATEGORY FILTERS */}
            <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-[11px] font-medium leading-none transition-colors ${
                      active
                        ? "border-[#D8CCF4] bg-[#F0EBFF] text-[#5944C7]"
                        : "border-[#E1DDD4] bg-[#FFFDF9] text-[#686D7B] hover:bg-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* LOST / FOUND FILTER */}
            <div className="mt-4 flex items-center justify-between gap-3">
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
                        setType(
                          value as
                            | "all"
                            | "lost"
                            | "found"
                        )
                      }
                      className={`rounded-full px-3.5 py-1.5 text-[10px] font-semibold transition sm:px-4 sm:py-2 sm:text-[11px] ${
                        active
                          ? "bg-[#23265B] text-white"
                          : "text-[#626776]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <span className="shrink-0 text-[10px] font-medium text-[#858796] sm:text-[11px]">
                {loading
                  ? "Loading..."
                  : `${filteredReports.length} ${
                      filteredReports.length === 1
                        ? "report"
                        : "reports"
                    }`}
              </span>
            </div>

            {/* LISTINGS */}
            <section className="mt-5">
              {loading && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 6 }).map(
                    (_, index) => (
                      <article
                        key={index}
                        className="overflow-hidden rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9]"
                      >
                        <div className="aspect-[0.94] animate-pulse bg-[#E9E5DC]" />

                        <div className="space-y-2 p-3.5 pb-4">
                          <div className="h-4 animate-pulse rounded bg-[#E9E5DC]" />
                          <div className="h-3 w-2/3 animate-pulse rounded bg-[#EFECE5]" />
                          <div className="h-3 w-1/2 animate-pulse rounded bg-[#EFECE5]" />
                        </div>
                      </article>
                    )
                  )}
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
                    onClick={() =>
                      window.location.reload()
                    }
                    className="mt-4 rounded-[12px] px-4 py-2 text-[11px] font-bold"
                    style={{
                      backgroundColor: "#292B68",
                      color: "#FFFFFF",
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading &&
                !error &&
                filteredReports.length === 0 && (
                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#D3CFC6] bg-white/60 px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                      <Search size={19} />
                    </div>

                    <h2 className="mt-4 text-[14px] font-bold text-[#172044]">
                      No reports found
                    </h2>

                    <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#858796]">
                      {reports.length === 0
                        ? "There are no Lost & Found reports yet."
                        : "Try changing your search or filters."}
                    </p>
                  </div>
                )}

              {!loading &&
                !error &&
                filteredReports.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredReports.map(
                      (item, index) => {
                        const isClaimed =
                          item.status === "claimed";

                        return (
                          <Link
                            key={item.id}
                            href={`/lost-found/${item.id}`}
                            className={`group min-w-0 ${
                              isClaimed
                                ? "opacity-60"
                                : ""
                            }`}
                          >
                            <article className="overflow-hidden rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,32,68,0.07)]">
                              {/* IMAGE */}
                              <div
                                className="relative aspect-[0.94] overflow-hidden"
                                style={{
                                  backgroundColor:
                                    cardTints[
                                      index %
                                        cardTints.length
                                    ],
                                }}
                              >
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 220px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[10px] font-medium text-[#777A8B]">
                                    No photo
                                  </div>
                                )}

                                {/* LOST / FOUND */}
                                <span
                                  className={`absolute left-3 top-3 rounded-full bg-[#FFFDF9]/95 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] shadow-sm ${
                                    item.type === "lost"
                                      ? "text-[#5D48D2]"
                                      : "text-[#C2661A]"
                                  }`}
                                >
                                  {item.type}
                                </span>

                                {/* STATUS */}
                                {isClaimed && (
                                  <span className="absolute right-3 top-3 rounded-full bg-[#20223F]/90 px-2.5 py-1.5 text-[9px] font-semibold text-white shadow-sm">
                                    Claimed
                                  </span>
                                )}
                              </div>

                              {/* DETAILS */}
                              <div className="px-3.5 pb-4 pt-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h3 className="line-clamp-2 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540]">
                                      {item.title}
                                    </h3>

                                    <p className="mt-1 text-[9px] font-medium text-[#7E8190]">
                                      {item.category}
                                    </p>
                                  </div>

                                  <ChevronRight
                                    size={14}
                                    className="mt-0.5 shrink-0 text-[#9A98A7] transition group-hover:translate-x-0.5"
                                  />
                                </div>

                                {/* LOCATION + TIME */}
                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEEAE2] pt-3">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <MapPin
                                      size={10}
                                      className="shrink-0 text-[#858796]"
                                    />

                                    <span className="truncate text-[9px] font-medium text-[#6D7184]">
                                      {item.location}
                                    </span>
                                  </div>

                                  <span className="shrink-0 text-[9px] text-[#858796]">
                                    {formatTime(
                                      item.created_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </article>
                          </Link>
                        );
                      }
                    )}
                  </div>
                )}
            </section>

            {/* TRUST STRIP */}
            <section className="mt-6">
              <div className="flex items-start gap-3 rounded-[18px] border border-[#DDD6FF] bg-[#F6F3FF] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#172044]">
                    Claim safely
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-[#70738A]">
                    Every claim goes through identity
                    verification before handover.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* MOBILE REPORT BUTTON */}
        <Link
          href="/lost-found/report"
          className="fixed bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full px-5 text-[11px] font-bold shadow-[0_8px_25px_rgba(41,43,104,0.28)] transition hover:bg-[#202252]"
          style={{
            backgroundColor: "#292B68",
            color: "#FFFFFF",
          }}
        >
          <Plus size={16} />
          Report item
        </Link>
      </div>
    </main>
  );
}