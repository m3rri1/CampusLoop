"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  Heart,
  MapPin,
  Share2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
  view_count: number;
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
    year: "numeric",
  });
}

export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const viewedListingRef = useRef<string | null>(null);

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      setLoading(true);
      setError("");

      const { data: listingData, error: listingError } = await supabase
        .from("marketplace_listings")
        .select(
          "id, seller_id, title, description, price, category, condition, location, image_url, status, created_at, view_count"
        )
        .eq("id", id)
        .maybeSingle();

      if (listingError) {
        if (mounted) {
          setError(listingError.message);
          setLoading(false);
        }
        return;
      }

      if (!listingData) {
        if (mounted) {
          setError("This listing could not be found.");
          setLoading(false);
        }
        return;
      }

      if (!mounted) return;

      setListing(listingData as Listing);

      // Count one view for this page visit.
      // The ref prevents accidental duplicate counting during effect re-runs.
      if (viewedListingRef.current !== listingData.id) {
        viewedListingRef.current = listingData.id;

        const { data: newViewCount } = await supabase.rpc(
          "increment_marketplace_listing_view",
          {
            p_listing_id: listingData.id,
          }
        );

        if (mounted && typeof newViewCount === "number") {
          setListing((current) =>
            current
              ? {
                  ...current,
                  view_count: newViewCount,
                }
              : current
          );
        }
      }

      const { data: sellerData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", listingData.seller_id)
        .maybeSingle();

      if (mounted && sellerData) {
        setSeller(sellerData as Profile);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: favoriteData } = await supabase
          .from("marketplace_favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingData.id)
          .maybeSingle();

        if (mounted) {
          setIsFavorite(Boolean(favoriteData));
        }
      } else if (mounted) {
        setIsFavorite(false);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    if (id) {
      loadListing();
    }

    return () => {
      mounted = false;
    };
  }, [id, supabase]);

  async function toggleFavorite() {
    if (!listing) return;

    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/marketplace/${listing.id}`);
      return;
    }

    if (isFavorite) {
      const { error: deleteError } = await supabase
        .from("marketplace_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listing.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setIsFavorite(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("marketplace_favorites")
      .insert({
        user_id: user.id,
        listing_id: listing.id,
      });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setIsFavorite(true);
  }

  async function handleChatWithSeller() {
    if (!listing) return;

    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/marketplace/${listing.id}`);
      return;
    }

    if (user.id === listing.seller_id) {
      setError("You cannot start a chat with yourself.");
      return;
    }

    const { data: existingConversation, error: findError } =
      await supabase
        .from("marketplace_conversations")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("seller_id", listing.seller_id)
        .eq("buyer_id", user.id)
        .maybeSingle();

    if (findError) {
      setError(findError.message);
      return;
    }

    if (existingConversation) {
      router.push(
        `/chat?type=marketplace&conversation=${existingConversation.id}`
      );
      return;
    }

    const { data: newConversation, error: createError } =
      await supabase
        .from("marketplace_conversations")
        .insert({
          listing_id: listing.id,
          seller_id: listing.seller_id,
          buyer_id: user.id,
        })
        .select("id")
        .single();

    if (createError) {
      setError(createError.message);
      return;
    }

    router.push(
      `/chat?type=marketplace&conversation=${newConversation.id}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
              <p className="mt-4 text-[11px] font-semibold text-[#777A8B]">
                Loading listing...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870]"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>

          <div className="mt-8 rounded-[24px] border border-[#E3DFD7] bg-white px-6 py-16 text-center">
            <h1 className="text-[18px] font-bold text-[#202540]">
              Listing unavailable
            </h1>

            <p className="mt-2 text-[11px] text-[#858796]">
              {error || "This listing no longer exists."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) return null;

  const sellerName = seller?.full_name || "Campus seller";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* TOP BAR */}
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870] transition-colors hover:border-[#CFC5F4] hover:text-[#6546D9]"
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Marketplace
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Share listing"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1E2E6] bg-white text-[#4D5870] transition-colors hover:border-[#CFC5F4] hover:text-[#6546D9]"
            >
              <Share2 size={16} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={
                isFavorite
                  ? "Remove from saved listings"
                  : "Save listing"
              }
              className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-colors ${
                isFavorite
                  ? "border-[#CFC5F4] text-[#6546D9]"
                  : "border-[#E1E2E6] text-[#4D5870] hover:border-[#CFC5F4] hover:text-[#6546D9]"
              }`}
            >
              <Heart
                size={16}
                strokeWidth={1.8}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-[26px] border border-[#E7E5E0] bg-white shadow-[0_8px_35px_rgba(23,35,61,0.06)] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
          {/* IMAGE */}
          <div className="relative aspect-[1/0.92] min-h-[300px] overflow-hidden bg-[#EDEBF0] sm:aspect-[1.25/1] lg:aspect-auto lg:min-h-[650px]">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] font-semibold text-[#777A8B]">
                No image available
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#17233D]/20 to-transparent" />

            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#17233D] shadow-sm backdrop-blur-sm">
              {getCategoryLabel(listing.category)}
            </span>
          </div>

          {/* INFORMATION */}
          <div className="flex flex-col p-5 sm:p-7 lg:p-9">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#6546D9]">
                  Campus marketplace
                </p>

                <h1 className="text-[24px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#17233D] sm:text-[29px]">
                  {listing.title}
                </h1>
              </div>

              <p className="shrink-0 pt-5 text-[20px] font-extrabold tracking-[-0.03em] text-[#6546D9] sm:text-[23px]">
                ₹{Number(listing.price).toLocaleString("en-IN")}
              </p>
            </div>

            {/* META */}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-[#737C8F]">
              <MapPin
                size={14}
                className="text-[#6546D9]"
                strokeWidth={1.8}
              />

              <span>{listing.location}</span>

              <span className="text-[#D2D4D9]">•</span>

              <span>{getPostedAgo(listing.created_at)}</span>

              <span className="text-[#D2D4D9]">•</span>

              <Eye
                size={14}
                className="text-[#6546D9]"
                strokeWidth={1.8}
              />

              <span>
                {listing.view_count}{" "}
                {listing.view_count === 1 ? "view" : "views"}
              </span>
            </div>

            {/* CONDITION */}
            <span className="mt-4 w-fit rounded-full border border-[#D9E7DF] bg-[#F0F8F4] px-3 py-1.5 text-[11px] font-bold text-[#39735A]">
              {getConditionLabel(listing.condition)}
            </span>

            {error && (
              <div className="mt-4 rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-3.5 py-3 text-[11px] leading-5 text-[#A33A3A]">
                {error}
              </div>
            )}

            <div className="my-6 h-px bg-[#ECECE8]" />

            {/* DESCRIPTION */}
            <section>
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">
                Description
              </h2>

              <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-6 text-[#697286]">
                {listing.description}
              </p>
            </section>

            <div className="my-6 h-px bg-[#ECECE8]" />

            {/* SELLER */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">
                  Seller
                </h2>

                <span className="text-[10px] font-semibold text-[#9298A4]">
                  Campus member
                </span>
              </div>

              <Link
                href={`/marketplace/seller/${listing.seller_id}`}
                className="group flex items-center gap-3 rounded-2xl border border-[#E8E8E5] bg-[#FAFAF8] p-3.5 transition-all hover:border-[#D7CFF6] hover:bg-[#F9F7FF] hover:shadow-[0_5px_18px_rgba(23,32,68,0.05)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8E3FF] text-[14px] font-extrabold text-[#6546D9]">
                  {sellerInitial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-bold text-[#17233D]">
                      {sellerName}
                    </p>

                    <BadgeCheck
                      size={14}
                      className="shrink-0 text-[#6546D9]"
                      strokeWidth={2}
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-[#9298A4]">
                    View seller profile and other listings
                  </p>
                </div>

                <span className="shrink-0 text-[18px] font-light text-[#AAAEB9] transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </section>

            {/* ACTION */}
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={handleChatWithSeller}
                className="w-full rounded-2xl bg-[#6546D9] py-3.5 text-[13px] font-extrabold text-white shadow-[0_8px_22px_rgba(101,70,217,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#5839C8]"
              >
                Chat with Seller
              </button>

              <p className="mt-2.5 text-center text-[10px] font-medium text-[#969BA6]">
                Ask questions and arrange a campus meetup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}