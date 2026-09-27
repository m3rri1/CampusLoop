"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  image_url: string | null;
  location: string;
  seller_id: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

const categories = [
  ["all", "All items"],
  ["books", "Books"],
  ["electronics", "Electronics"],
  ["stationery", "Study"],
  ["clothing", "Clothing"],
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
    books: "Books",
    electronics: "Electronics",
    stationery: "Stationery",
    clothing: "Clothing",
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

export default function MarketplacePage() {
  const [supabase] = useState(() => createClient());

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMarketplace() {
      setLoading(true);
      setError("");

      const { data: listingData, error: listingError } = await supabase
        .from("marketplace_listings")
        .select(
          "id, title, description, price, category, condition, image_url, location, seller_id, created_at"
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (listingError) {
        if (mounted) {
          setError(listingError.message);
          setLoading(false);
        }
        return;
      }

      const listingRows = (listingData ?? []) as Listing[];

      if (!mounted) return;

      setListings(listingRows);

      const sellerIds = Array.from(
        new Set(listingRows.map((listing) => listing.seller_id))
      );

      if (sellerIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", sellerIds);

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

    loadMarketplace();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return listings.filter((listing) => {
      const categoryMatch =
        category === "all" || listing.category === category;

      const searchMatch =
        !search ||
        listing.title.toLowerCase().includes(search) ||
        listing.description.toLowerCase().includes(search) ||
        listing.location.toLowerCase().includes(search);

      return categoryMatch && searchMatch;
    });
  }, [listings, category, query]);

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">
        {/* HERO PANEL */}
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
            Campus marketplace
          </p>

          <h1 className="relative mt-2 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">
            Marketplace
          </h1>

          <p className="relative mt-1.5 text-[13px] font-medium text-[#C8C6E0]">
            Buy and sell useful things within your campus.
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

        {/* LISTINGS */}
        <section className="px-5 pb-16 pt-6 sm:px-8">
          {/* SECTION HEADER */}
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[19px] font-bold tracking-[-0.03em] text-[#172044]">
                All listings
              </h2>

              <p className="mt-1 text-[11px] font-medium text-[#858796]">
                {filteredListings.length}{" "}
                {filteredListings.length === 1 ? "item" : "items"} available
                on campus
              </p>
            </div>

<div className="flex shrink-0 items-center gap-2">
  <Link
    href="/marketplace/my-listings"
    className="rounded-full border border-[#DCD8D0] bg-white px-3.5 py-2.5 text-[10px] font-bold text-[#4F5364] transition hover:border-[#CFC8FF] hover:text-[#5D48D2]"
  >
    My listings
  </Link>

  <Link
    href="/marketplace/sell"
    className="rounded-full bg-[#20265F] px-4 py-2.5 text-[10px] font-bold text-white shadow-[0_5px_14px_rgba(32,38,95,0.14)] transition hover:bg-[#191E53]"
  >
    + Sell item
  </Link>
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
          ) : filteredListings.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#D3CFC6] bg-white/60 py-20 text-center">
              <p className="text-sm font-semibold text-[#172044]">
                No listings found
              </p>

              <p className="mt-1 text-xs text-[#898781]">
                Try another search or category.
              </p>

              <Link
                href="/marketplace/sell"
                className="mt-5 inline-flex rounded-full bg-[#20265F] px-4 py-2.5 text-[11px] font-bold text-white"
              >
                Sell the first item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {filteredListings.map((listing, index) => {
                const sellerName =
                  profiles[listing.seller_id]?.full_name ||
                  "Campus seller";

                return (
                  <Link
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
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
                        {listing.image_url ? (
                          <img
                            src={listing.image_url}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] font-semibold text-[#777A8B]">
                            No image
                          </div>
                        )}

                        {/* CATEGORY */}
                        <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF9]/95 px-2.5 py-1.5 text-[9px] font-bold text-[#30354B] shadow-sm">
                          {getCategoryLabel(listing.category)}
                        </span>

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
                          <Heart size={15} strokeWidth={1.8} />
                        </button>
                      </div>

                      {/* CARD DETAILS */}
                      <div className="px-3.5 pb-4 pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 line-clamp-2 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540]">
                            {listing.title}
                          </h3>

                          <span className="shrink-0 text-[12px] font-extrabold text-[#5E4BD1]">
                            ₹{Number(listing.price).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* CONDITION */}
                        <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-2 py-1 text-[9px] font-bold text-[#6650A5]">
                          {getConditionLabel(listing.condition)}
                        </span>

                        {/* SELLER */}
                        <p className="mt-2 truncate text-[10px] font-medium text-[#7E8190]">
                          {sellerName} · {listing.location}
                        </p>

                        <p className="mt-1 text-[9px] text-[#A0A0AA]">
                          {getPostedAgo(listing.created_at)}
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