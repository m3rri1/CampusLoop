"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  MapPin,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
};

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
  view_count: number;
};

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

function getDateLabel(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [supabase] = useState(() => createClient());

  const [seller, setSeller] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSeller() {
      setLoading(true);
      setError("");

      const { data: sellerData, error: sellerError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", sellerId)
        .maybeSingle();

      if (sellerError) {
        if (mounted) {
          setError(sellerError.message);
          setLoading(false);
        }
        return;
      }

      if (!sellerData) {
        if (mounted) {
          setError("This seller profile could not be found.");
          setLoading(false);
        }
        return;
      }

      if (!mounted) return;

      setSeller(sellerData as Profile);

      const { data: listingData, error: listingError } = await supabase
        .from("marketplace_listings")
        .select(
          "id, title, description, price, category, condition, image_url, location, seller_id, created_at, view_count"
        )
        .eq("seller_id", sellerId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (listingError) {
        if (mounted) {
          setError(listingError.message);
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setListings((listingData ?? []) as Listing[]);
        setLoading(false);
      }
    }

    if (sellerId) {
      loadSeller();
    }

    return () => {
      mounted = false;
    };
  }, [sellerId, supabase]);

  const activeCount = listings.length;

  const sellingSince = useMemo(() => {
    if (listings.length === 0) return null;

    const oldest = [...listings].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )[0];

    return oldest?.created_at ?? null;
  }, [listings]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-5 py-6 sm:px-8">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
              <p className="mt-4 text-[11px] font-semibold text-[#777A8B]">
                Loading seller...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-5 py-6 sm:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870]"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>

          <div className="mt-8 rounded-[24px] border border-[#E3DFD7] bg-white px-6 py-16 text-center">
            <h1 className="text-[18px] font-bold text-[#202540]">
              Seller unavailable
            </h1>

            <p className="mt-2 text-[11px] text-[#858796]">
              {error || "This seller profile could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const sellerName = seller.full_name || "Campus seller";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] pb-28">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-10 pt-7 text-white sm:px-8 sm:pb-12 sm:pt-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5D48D2]/30 blur-3xl"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 left-20 h-52 w-52 rounded-full bg-[#8C7BFF]/20 blur-3xl"
          />

          <Link
            href="/marketplace"
            className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-semibold text-[#E6E2FF] backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={14} />
            Marketplace
          </Link>

          <div className="relative mt-7 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white/10 text-[21px] font-extrabold text-white backdrop-blur">
              {sellerInitial || "C"}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BEB8FF]">
                Campus seller
              </p>

              <h1 className="mt-1 text-[27px] font-extrabold tracking-[-0.045em] sm:text-[32px]">
                {sellerName}
              </h1>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#C8C6E0]">
                <BadgeCheck size={13} />
                <span>CampusLoop marketplace member</span>
              </div>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[17px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2 text-[#C8C6E0]">
                <Package size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                  Active listings
                </span>
              </div>

              <p className="mt-1.5 text-[20px] font-extrabold">
                {activeCount}
              </p>
            </div>

            <div className="rounded-[17px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2 text-[#C8C6E0]">
                <Package size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                  Selling since
                </span>
              </div>

              <p className="mt-1.5 text-[13px] font-bold">
                {sellingSince ? getDateLabel(sellingSince) : "No listings yet"}
              </p>
            </div>
          </div>
        </section>

        {/* LISTINGS */}
        <section className="px-5 pt-7 sm:px-8">
          <div className="mb-5">
            <h2 className="text-[19px] font-extrabold tracking-[-0.035em] text-[#17233D]">
              {sellerName}'s listings
            </h2>

            <p className="mt-1 text-[11px] font-medium text-[#858796]">
              Currently active items from this seller.
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#D3CFC6] bg-white/60 px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE7FA] text-[#6546D9]">
                <Package size={20} />
              </div>

              <h3 className="mt-4 text-[16px] font-bold text-[#202540]">
                No active listings
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-[#858796]">
                This seller doesn't have any active marketplace items right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing, index) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/${listing.id}`}
                  className="group min-w-0"
                >
                  <article className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,32,68,0.07)]">
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

                      <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF9]/95 px-2.5 py-1.5 text-[9px] font-bold text-[#30354B] shadow-sm">
                        {getCategoryLabel(listing.category)}
                      </span>
                    </div>

                    <div className="px-3.5 pb-4 pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 line-clamp-2 text-[12px] font-bold leading-[17px] text-[#202540]">
                          {listing.title}
                        </h3>

                        <span className="shrink-0 text-[12px] font-extrabold text-[#5E4BD1]">
                          ₹{Number(listing.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-2 py-1 text-[9px] font-bold text-[#6650A5]">
                        {getConditionLabel(listing.condition)}
                      </span>

                      <div className="mt-2 flex items-center gap-2 text-[9px] text-[#858796]">
                        <span className="flex min-w-0 items-center gap-1 truncate">
                          <MapPin size={11} />
                          {listing.location}
                        </span>

                        <span className="shrink-0">•</span>

                        <span className="flex shrink-0 items-center gap-1">
                          <Eye size={11} />
                          {listing.view_count}
                        </span>
                      </div>

                      <p className="mt-1 text-[9px] text-[#A0A0AA]">
                        {getPostedAgo(listing.created_at)}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}