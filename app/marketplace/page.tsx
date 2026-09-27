"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Search } from "lucide-react";
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

  const minutes = Math.floor(
    (now - created) / (1000 * 60)
  );

  const hours = Math.floor(
    (now - created) / (1000 * 60 * 60)
  );

  const days = Math.floor(
    (now - created) / (1000 * 60 * 60 * 24)
  );

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
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] =
    useState<Record<string, Profile>>({});
  const [favoriteIds, setFavoriteIds] =
    useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMarketplace() {
      setLoading(true);
      setError("");

      const {
        data: listingData,
        error: listingError,
      } = await supabase
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
        new Set(
          listingRows.map((listing) => listing.seller_id)
        )
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
      } else {
        setProfiles({});
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && listingRows.length > 0) {
        const { data: favoriteData } = await supabase
          .from("marketplace_favorites")
          .select("listing_id")
          .eq("user_id", user.id)
          .in(
            "listing_id",
            listingRows.map((listing) => listing.id)
          );

        if (mounted && favoriteData) {
          setFavoriteIds(
            new Set(
              favoriteData.map(
                (favorite) => favorite.listing_id
              )
            )
          );
        }
      } else if (mounted) {
        setFavoriteIds(new Set());
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

  async function toggleFavorite(
    event: MouseEvent<HTMLButtonElement>,
    listingId: string
  ) {
    event.preventDefault();
    event.stopPropagation();

    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/marketplace");
      return;
    }

    const isFavorite = favoriteIds.has(listingId);

    if (isFavorite) {
      const { error: deleteError } = await supabase
        .from("marketplace_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setFavoriteIds((previous) => {
        const next = new Set(previous);
        next.delete(listingId);
        return next;
      });
    } else {
      const { error: insertError } = await supabase
        .from("marketplace_favorites")
        .insert({
          user_id: user.id,
          listing_id: listingId,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setFavoriteIds((previous) => {
        const next = new Set(previous);
        next.add(listingId);
        return next;
      });
    }
  }

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return listings.filter((listing) => {
      const categoryMatch =
        category === "all" ||
        listing.category === category;

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
        {/* HERO */}
        <section className="relative overflow-hidden rounded-b-[32px] bg-[linear-gradient(115deg,#202660_0%,#2F337B_48%,#4D43B3_100%)] px-5 pb-7 pt-7 text-white sm:px-8 sm:pb-9 sm:pt-9">
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

          <p className="relative text-[10px] font-bold uppercase tracking-[0.20em] text-[#C5BFFF]">
            Campus marketplace
          </p>

          <h1 className="relative mt-1.5 text-[29px] font-bold tracking-[-0.045em] sm:text-[36px]">
            Marketplace
          </h1>

          <p className="relative mt-1 text-[12px] font-medium text-[#D0CDED]">
            Buy and sell useful things within your campus.
          </p>

          {/* SEARCH */}
          <div className="relative mt-5 flex h-12 items-center gap-3 rounded-[14px] bg-white px-4 shadow-[0_8px_25px_rgba(0,0,0,0.18)]">
            <Search
              size={17}
              className="shrink-0 text-[#5E4BD1]"
              strokeWidth={1.8}
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings, books, tech..."
              className="w-full min-w-0 bg-transparent text-[12px] font-medium text-[#172044] outline-none placeholder:text-[#9B9CA6]"
            />
          </div>

          {/* CATEGORY FILTERS */}
          <nav className="relative mt-3.5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map(([id, label]) => {
              const selected = category === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={`flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[11px] font-medium leading-none transition-colors ${
                    selected
                      ? "bg-white text-[#20265F]"
                      : "bg-white/10 text-[#DDD8F7] hover:bg-white/15"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </section>

        {/* LISTINGS */}
        <section className="px-5 pb-16 pt-6 sm:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[19px] font-bold tracking-[-0.03em] text-[#172044]">
                All listings
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#858796]">
                {filteredListings.length}{" "}
                {filteredListings.length === 1
                  ? "item"
                  : "items"}{" "}
                available on campus
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/marketplace/saved"
                className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-[#DCD8D0] bg-white px-3.5 text-[10px] font-medium text-[#555967] transition hover:border-[#CFC8FF] hover:text-[#5D48D2]"
              >
                Saved
              </Link>

              <Link
                href="/marketplace/my-listings"
                className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-[#DCD8D0] bg-white px-3.5 text-[10px] font-medium text-[#555967] transition hover:border-[#CFC8FF] hover:text-[#5D48D2]"
              >
                My listings
              </Link>

              <Link
                href="/marketplace/sell"
                className="inline-flex h-9 min-w-[92px] items-center justify-center whitespace-nowrap rounded-full px-4 text-[11px] font-semibold shadow-[0_5px_14px_rgba(32,38,95,0.14)] transition hover:bg-[#191E53]"
                style={{
                  backgroundColor: "#20265F",
                  color: "#FFFFFF",
                }}
              >
                + Sell item
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9]"
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
            <div className="rounded-[20px] border border-dashed border-[#D3CFC6] bg-white/60 py-20 text-center">
              <p className="text-sm font-semibold text-[#172044]">
                No listings found
              </p>

              <p className="mt-1 text-xs text-[#898781]">
                Try another search or category.
              </p>

              <Link
                href="/marketplace/sell"
                className="mt-5 inline-flex rounded-full px-4 py-2.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: "#20265F",
                  color: "#FFFFFF",
                }}
              >
                Sell the first item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {filteredListings.map((listing, index) => {
                const sellerName =
                  profiles[listing.seller_id]?.full_name ||
                  "Campus seller";

                const isFavorite =
                  favoriteIds.has(listing.id);

                return (
                  <Link
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
                    className="group min-w-0"
                  >
                    <article className="overflow-hidden rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,32,68,0.07)]">
                      {/* IMAGE */}
                      <div
                        className="relative aspect-[0.94] overflow-hidden"
                        style={{
                          backgroundColor:
                            cardTints[
                              index % cardTints.length
                            ],
                        }}
                      >
                        {listing.image_url ? (
                          <img
                            src={listing.image_url}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] font-medium text-[#777A8B]">
                            No image
                          </div>
                        )}

                        {/* CATEGORY */}
                        <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF9]/95 px-2.5 py-1.5 text-[9px] font-semibold text-[#30354B] shadow-sm">
                          {getCategoryLabel(
                            listing.category
                          )}
                        </span>

                        {/* FAVORITE */}
                        <button
                          type="button"
                          onClick={(event) =>
                            toggleFavorite(
                              event,
                              listing.id
                            )
                          }
                          aria-label={
                            isFavorite
                              ? "Remove from saved listings"
                              : "Save listing"
                          }
                          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFFDF9]/95 shadow-[0_2px_9px_rgba(23,32,68,0.09)] transition ${
                            isFavorite
                              ? "text-[#6546D9]"
                              : "text-[#343A56]"
                          }`}
                        >
                          <Heart
                            size={15}
                            strokeWidth={1.8}
                            fill={
                              isFavorite
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>

                      {/* DETAILS */}
                      <div className="px-3.5 pb-4 pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 line-clamp-2 text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#202540]">
                            {listing.title}
                          </h3>

                          <span className="shrink-0 text-[12px] font-extrabold text-[#5E4BD1]">
                            ₹
                            {Number(
                              listing.price
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-2 py-1 text-[9px] font-semibold text-[#6650A5]">
                          {getConditionLabel(
                            listing.condition
                          )}
                        </span>

                        <p className="mt-2 truncate text-[10px] font-medium text-[#7E8190]">
                          {sellerName} ·{" "}
                          {listing.location}
                        </p>

                        <p className="mt-1 text-[9px] text-[#A0A0AA]">
                          {getPostedAgo(
                            listing.created_at
                          )}
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