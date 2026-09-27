"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Package,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RentItem = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  daily_rent: number;
  deposit: number;
  condition: string;
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

const categories = [
  ["all", "All items"],
  ["electronics", "Electronics"],
  ["lab-equipment", "Lab equipment"],
  ["study", "Study"],
  ["books", "Books"],
  ["stationery", "Stationery"],
  ["other", "Other"],
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

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    electronics: "Electronics",
    "lab-equipment": "Lab equipment",
    study: "Study",
    books: "Books",
    stationery: "Stationery",
    other: "Other",
  };

  return labels[category] ?? category;
}

function getConditionLabel(condition: string) {
  return condition
    .replace("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPostedAgo(dateString: string) {
  const created = new Date(dateString).getTime();
  const now = Date.now();

  const minutes = Math.floor((now - created) / (1000 * 60));
  const hours = Math.floor((now - created) / (1000 * 60 * 60));
  const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function RentPage() {
  const [supabase] = useState(() => createClient());

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<RentItem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRentItems() {
      setLoading(true);
      setError("");

      const { data: itemData, error: itemError } = await supabase
        .from("borrow_items")
        .select(
          "id, owner_id, title, description, category, daily_rent, deposit, condition, location, image_url, status, created_at"
        )
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (itemError) {
        if (mounted) {
          setError(itemError.message);
          setLoading(false);
        }
        return;
      }

      const itemRows = (itemData ?? []) as RentItem[];

      if (!mounted) return;

      setItems(itemRows);

      const ownerIds = Array.from(
        new Set(itemRows.map((item) => item.owner_id))
      );

      if (ownerIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds);

        if (mounted && profileData) {
          const profileMap: Record<string, Profile> = {};

          (profileData as Profile[]).forEach((profile) => {
            profileMap[profile.id] = profile;
          });

          setProfiles(profileMap);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadRentItems();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items.filter((item) => {
      const categoryMatch =
        category === "all" || item.category === category;

      const searchMatch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search);

      return categoryMatch && searchMatch;
    });
  }, [items, category, query]);

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-8 pt-9 text-white sm:px-8 sm:pb-10 sm:pt-11">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#5E4BD1]/30 blur-3xl"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-[#8C7BFF]/20 blur-3xl"
          />

          <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-[#BEB8FF]">
            Campus rentals
          </p>

          <h1 className="relative mt-2 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">
            Rent
          </h1>

          <p className="relative mt-1.5 max-w-xl text-[13px] font-medium leading-5 text-[#C8C6E0]">
            Rent useful things from other students without buying them.
          </p>

          {/* SEARCH */}
          <div className="relative mt-6 flex h-12 items-center gap-3 rounded-[16px] bg-white px-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <Search
              size={18}
              className="shrink-0 text-[#5E4BD1]"
              strokeWidth={1.8}
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search calculators, lab coats, kits..."
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

          {/* CATEGORY PILLS */}
          <nav className="relative mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`flex h-9 shrink-0 items-center rounded-full px-4 text-[12px] font-semibold transition-colors ${
                  category === id
                    ? "bg-white text-[#20265F]"
                    : "bg-white/10 text-[#DCD6FF] hover:bg-white/15"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </section>

        {/* CONTENT */}
        <section className="px-5 pb-16 pt-6 sm:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[19px] font-bold tracking-[-0.03em] text-[#172044]">
                Available to rent
              </h2>

              <p className="mt-1 text-[11px] font-medium text-[#858796]">
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "item" : "items"} available on
                campus
              </p>
            </div>

            <div className="hidden shrink-0 items-center rounded-full border border-[#DCD8D0] bg-white px-3.5 py-2.5 text-[10px] font-bold text-[#4F5364] sm:flex">
              <Package size={13} className="mr-1.5 text-[#6546D9]" />
              Student-to-student
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-[16px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9]"
                >
                  <div className="aspect-[0.94] animate-pulse bg-[#E9E5DC]" />

                  <div className="space-y-2 p-3.5 pb-4">
                    <div className="h-4 animate-pulse rounded bg-[#E9E5DC]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-[#EFECE5]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#EFECE5]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#D3CFC6] bg-white/60 px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE7FA] text-[#6546D9]">
                <Package size={20} />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#172044]">
                No rental items found
              </p>

              <p className="mt-1 text-xs text-[#898781]">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {filteredItems.map((item, index) => {
                const ownerName =
                  profiles[item.owner_id]?.full_name || "Campus student";

                return (
                  <Link
                    key={item.id}
                    href={`/rent/${item.id}`}
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
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] font-semibold text-[#777A8B]">
                            <div className="text-center">
                              <Package
                                size={25}
                                className="mx-auto mb-2 text-[#8A8D9A]"
                              />
                              No image
                            </div>
                          </div>
                        )}

                        <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF9]/95 px-2.5 py-1.5 text-[9px] font-bold text-[#30354B] shadow-sm">
                          {getCategoryLabel(item.category)}
                        </span>

                        <div className="absolute bottom-3 left-3 rounded-[11px] bg-[#20265F]/92 px-2.5 py-2 text-white shadow-sm backdrop-blur-sm">
                          <p className="text-[9px] font-medium text-[#D9D7EE]">
                            Per day
                          </p>

                          <p className="text-[13px] font-extrabold">
                            ₹{Number(item.daily_rent).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="px-3.5 pb-4 pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 line-clamp-2 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540]">
                            {item.title}
                          </h3>

                          <ChevronRight
                            size={14}
                            className="mt-0.5 shrink-0 text-[#A1A3AE] transition-transform group-hover:translate-x-0.5"
                          />
                        </div>

                        <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-2 py-1 text-[9px] font-bold text-[#6650A5]">
                          {getConditionLabel(item.condition)}
                        </span>

                        <div className="mt-2 flex items-center gap-1 text-[9px] font-medium text-[#7E8190]">
                          <MapPin size={11} />
                          <span className="truncate">{item.location}</span>
                        </div>

                        <p className="mt-1 truncate text-[10px] font-medium text-[#7E8190]">
                          {ownerName}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#ECE9E2] pt-2.5">
                          <span className="flex items-center gap-1 text-[9px] font-medium text-[#858796]">
                            <CalendarDays size={11} />
                            Refundable deposit
                          </span>

                          <span className="text-[10px] font-extrabold text-[#3E4357]">
                            ₹{Number(item.deposit).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <p className="mt-1 text-[9px] text-[#A0A0AA]">
                          Listed {getPostedAgo(item.created_at)}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}