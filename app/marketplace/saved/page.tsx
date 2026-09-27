"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
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

export default function SavedListingsPage() {
  const [supabase] = useState(() => createClient());

  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSavedListings() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setLoading(false);
          setError("Please sign in to view your saved listings.");
        }
        return;
      }

      const { data: favoriteData, error: favoriteError } =
        await supabase
          .from("marketplace_favorites")
          .select("listing_id")
          .eq("user_id", user.id);

      if (favoriteError) {
        if (mounted) {
          setError(favoriteError.message);
          setLoading(false);
        }
        return;
      }

      const listingIds = (favoriteData ?? []).map(
        (favorite) => favorite.listing_id
      );

      if (listingIds.length === 0) {
        if (mounted) {
          setListings([]);
          setLoading(false);
        }
        return;
      }

      const { data: listingData, error: listingError } = await supabase
        .from("marketplace_listings")
        .select(
          "id, title, description, price, category, condition, image_url, location, seller_id, created_at"
        )
        .in("id", listingIds)
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

    loadSavedListings();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function removeFavorite(listingId: string) {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: deleteError } = await supabase
      .from("marketplace_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setListings((previous) =>
      previous.filter((listing) => listing.id !== listingId)
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-5 pb-28 pt-5 sm:px-8 sm:pt-8">
        <div className="mb-7 flex items-center justify-between gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870] transition hover:border-[#CFC5F4] hover:text-[#6546D9]"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>
        </div>

        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6546D9]">
            Marketplace
          </p>

          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.045em] text-[#17233D]">
            Saved listings
          </h1>

          <p className="mt-1 text-[12px] font-medium text-[#858796]">
            Things you want to come back to later.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-[16px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-white"
              >
                <div className="aspect-[0.94] animate-pulse bg-[#E9E5DC]" />
                <div className="space-y-2 p-4">
                  <div className="h-4 animate-pulse rounded bg-[#E9E5DC]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#EFECE5]" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#D3CFC6] bg-white/60 px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE7FA] text-[#6546D9]">
              <Heart size={20} />
            </div>

            <h2 className="mt-4 text-[16px] font-bold text-[#202540]">
              No saved listings yet
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-[#858796]">
              Tap the heart on any marketplace listing to save it here.
            </p>

            <Link
              href="/marketplace"
              className="mt-5 inline-flex rounded-full bg-[#20265F] px-4 py-2.5 text-[11px] font-bold text-white"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {listings.map((listing) => {
              const sellerName =
                profiles[listing.seller_id]?.full_name ||
                "Campus seller";

              return (
                <div
                  key={listing.id}
                  className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9]"
                >
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[0.94] overflow-hidden bg-[#E9E5DC]">
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

                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-bold text-[#30354B] shadow-sm">
                        {getCategoryLabel(listing.category)}
                      </span>
                    </div>
                  </Link>

                  <div className="px-3.5 pb-4 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/marketplace/${listing.id}`}
                        className="min-w-0"
                      >
                        <h2 className="line-clamp-2 text-[12px] font-bold leading-[17px] text-[#202540]">
                          {listing.title}
                        </h2>
                      </Link>

                      <span className="shrink-0 text-[12px] font-extrabold text-[#5E4BD1]">
                        ₹{Number(listing.price).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-2 py-1 text-[9px] font-bold text-[#6650A5]">
                      {getConditionLabel(listing.condition)}
                    </span>

                    <p className="mt-2 truncate text-[10px] font-medium text-[#7E8190]">
                      {sellerName} · {listing.location}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFavorite(listing.id)}
                      className="mt-3 w-full rounded-full border border-[#E1E2E6] bg-white py-2 text-[10px] font-bold text-[#666A78] transition hover:border-[#D7CFF6] hover:text-[#6546D9]"
                    >
                      Remove from saved
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}