"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image_url: string | null;
  status: "active" | "sold" | "removed";
  created_at: string;
};

type Tab = "all" | "active" | "sold" | "removed";

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

export default function MyListingsPage() {
  const [supabase] = useState(() => createClient());

  const [listings, setListings] = useState<Listing[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadListings() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login?redirect=/marketplace/my-listings";
        return;
      }

      const { data, error: listingError } = await supabase
        .from("marketplace_listings")
        .select(
          "id, title, description, price, category, condition, location, image_url, status, created_at"
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (listingError) {
        setError(listingError.message);
      } else {
        setListings((data ?? []) as Listing[]);
      }

      setLoading(false);
    }

    loadListings();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function updateStatus(
    listingId: string,
    status: "active" | "sold" | "removed"
  ) {
    setActionId(listingId);
    setError("");

    const { data, error: updateError } = await supabase
      .from("marketplace_listings")
      .update({ status })
      .eq("id", listingId)
      .select(
        "id, title, description, price, category, condition, location, image_url, status, created_at"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      setActionId(null);
      return;
    }

    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId ? (data as Listing) : listing
      )
    );

    setActionId(null);
  }

  async function handleRemove(listing: Listing) {
    const confirmed = window.confirm(
      `Remove "${listing.title}" from the marketplace?`
    );

    if (!confirmed) return;

    await updateStatus(listing.id, "removed");
  }

  const visibleListings =
    tab === "all"
      ? listings
      : listings.filter((listing) => listing.status === tab);

  const counts = {
    all: listings.length,
    active: listings.filter((listing) => listing.status === "active").length,
    sold: listings.filter((listing) => listing.status === "sold").length,
    removed: listings.filter((listing) => listing.status === "removed").length,
  };

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1000px] bg-[#FBF9F4] pb-28">
        {/* HEADER */}
        <header className="border-b border-[#E4E0D8] bg-[#FBF9F4] px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/marketplace"
                aria-label="Back to marketplace"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#555A6D] transition hover:border-[#CFC8FF]"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6952D7]">
                  Campus marketplace
                </p>

                <h1 className="mt-0.5 text-[21px] font-bold tracking-[-0.04em] text-[#171A35]">
                  My listings
                </h1>
              </div>
            </div>

            <Link
              href="/marketplace/sell"
              className="flex items-center gap-1.5 rounded-full bg-[#20265F] px-3.5 py-2.5 text-[10px] font-bold text-white shadow-[0_5px_14px_rgba(32,38,95,0.14)] transition hover:bg-[#191E53]"
            >
              <Plus size={13} />
              Sell item
            </Link>
          </div>
        </header>

        <section className="px-5 py-6 sm:px-8 sm:py-9">
          <div className="mx-auto max-w-4xl">
            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-[16px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
                {error}
              </div>
            )}

            {/* FILTER TABS */}
            <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
              {(
                [
                  ["all", "All"],
                  ["active", "Active"],
                  ["sold", "Sold"],
                  ["removed", "Removed"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-bold transition ${
                    tab === value
                      ? "bg-[#20265F] text-white"
                      : "border border-[#DEDAD1] bg-white text-[#656877] hover:border-[#CFC8FF]"
                  }`}
                >
                  {label}

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                      tab === value
                        ? "bg-white/15 text-white"
                        : "bg-[#F0EDF7] text-[#6952D7]"
                    }`}
                  >
                    {counts[value]}
                  </span>
                </button>
              ))}
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[160px] animate-pulse rounded-[22px] border border-[#E4E0D8] bg-white"
                  />
                ))}
              </div>
            ) : visibleListings.length === 0 ? (
              /* EMPTY STATE */
              <div className="rounded-[24px] border border-dashed border-[#D3CFC6] bg-white/70 px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEE9FF] text-[#5D48D2]">
                  <Package size={23} />
                </div>

                <h2 className="mt-4 text-[15px] font-bold text-[#202540]">
                  {tab === "all"
                    ? "You haven't listed anything yet"
                    : `No ${tab} listings`}
                </h2>

                <p className="mx-auto mt-1.5 max-w-[300px] text-[11px] leading-5 text-[#858796]">
                  {tab === "all"
                    ? "List calculators, books, electronics, clothes and other useful campus items."
                    : "Listings with this status will appear here."}
                </p>

                {tab === "all" && (
                  <Link
                    href="/marketplace/sell"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#20265F] px-4 py-2.5 text-[11px] font-bold text-white"
                  >
                    <Plus size={14} />
                    Create listing
                  </Link>
                )}
              </div>
            ) : (
              /* LISTINGS */
              <div className="space-y-3">
                {visibleListings.map((listing) => {
                  const busy = actionId === listing.id;

                  return (
                    <article
                      key={listing.id}
                      className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-white shadow-[0_5px_20px_rgba(23,32,68,0.04)]"
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                        {/* IMAGE */}
                        <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-[17px] bg-[#F0ECE4] sm:h-[145px] sm:w-[145px]">
                          {listing.image_url ? (
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#8A8B95]">
                              <Package size={25} />
                            </div>
                          )}

                          <span
                            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${
                              listing.status === "active"
                                ? "bg-[#EAF6ED] text-[#287A47]"
                                : listing.status === "sold"
                                  ? "bg-[#EEE9FF] text-[#5D48D2]"
                                  : "bg-[#F0EEEC] text-[#797873]"
                            }`}
                          >
                            {listing.status}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6952D7]">
                                {getCategoryLabel(listing.category)}
                              </p>

                              <h2 className="mt-1 text-[16px] font-bold leading-5 text-[#202540]">
                                {listing.title}
                              </h2>
                            </div>

                            <p className="shrink-0 text-[17px] font-extrabold text-[#5E4BD1]">
                              ₹
                              {Number(listing.price).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <p className="mt-2 line-clamp-2 text-[10.5px] leading-5 text-[#777A8B]">
                            {listing.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#EEE7FA] px-2 py-1 text-[8px] font-bold text-[#6650A5]">
                              {getConditionLabel(listing.condition)}
                            </span>

                            <span className="text-[9px] text-[#9698A4]">
                              {listing.location}
                            </span>

                            <span className="text-[#D2D0CA]">•</span>

                            <span className="text-[9px] text-[#9698A4]">
                              {getPostedAgo(listing.created_at)}
                            </span>
                          </div>

                          {/* ACTIONS */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              href={`/marketplace/${listing.id}`}
                              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#DEDAD2] bg-[#FAF9F6] px-3 py-2 text-[9px] font-bold text-[#4F5364] transition hover:border-[#CFC8FF] hover:text-[#5D48D2]"
                            >
                              <Eye size={13} />
                              View
                            </Link>

                            {listing.status !== "removed" && (
                              <Link
                                href={`/marketplace/sell?edit=${listing.id}`}
                                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#DED8FA] bg-[#F5F2FF] px-3 py-2 text-[9px] font-bold text-[#5D48D2] transition hover:bg-[#EEE9FF]"
                              >
                                <Edit3 size={13} />
                                Edit
                              </Link>
                            )}

                            {listing.status === "active" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(listing.id, "sold")
                                }
                                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#D9E8DE] bg-[#F2F9F4] px-3 py-2 text-[9px] font-bold text-[#347450] transition hover:bg-[#EAF6ED] disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2
                                    size={13}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Check size={13} />
                                )}
                                Mark sold
                              </button>
                            )}

                            {listing.status === "sold" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(listing.id, "active")
                                }
                                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#DED8FA] bg-[#F5F2FF] px-3 py-2 text-[9px] font-bold text-[#5D48D2] transition hover:bg-[#EEE9FF] disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2
                                    size={13}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <RotateCcw size={13} />
                                )}
                                Relist
                              </button>
                            )}

                            {listing.status === "active" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleRemove(listing)}
                                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#F0D5D5] bg-[#FFF6F6] px-3 py-2 text-[9px] font-bold text-[#A33A3A] transition hover:bg-[#FFF0F0] disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                Remove
                              </button>
                            )}

                            {listing.status === "removed" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(listing.id, "active")
                                }
                                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#D9E8DE] bg-[#F2F9F4] px-3 py-2 text-[9px] font-bold text-[#347450] transition hover:bg-[#EAF6ED] disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2
                                    size={13}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <RotateCcw size={13} />
                                )}
                                Restore
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}