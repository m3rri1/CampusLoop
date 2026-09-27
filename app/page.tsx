"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Heart,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MarketplaceItem = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

type RentItem = {
  id: string;
  title: string;
  daily_rent: number;
  category: string;
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

type LostFoundItem = {
  id: string;
  title: string;
  type: "lost" | "found";
  category: string;
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

type ServiceItem = {
  id: string;
  title: string;
  category: string;
  price: number;
  pricing_type: "free" | "fixed" | "negotiable";
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

function formatAgo(dateString: string) {
  const created = new Date(dateString).getTime();
  const now = Date.now();

  const minutes = Math.max(0, Math.floor((now - created) / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function servicePrice(item: ServiceItem) {
  if (item.pricing_type === "free") return "Free";
  if (item.pricing_type === "negotiable") return "Negotiable";
  return formatPrice(Number(item.price));
}

const quickActions = [
  {
    href: "/marketplace",
    label: "Marketplace",
    sub: "Buy & sell",
    icon: ShoppingBag,
    wrapper: "border-[#DDD5FF] bg-[#F4F1FF]",
    iconClass: "bg-[#E8E1FF] text-[#5D48D2]",
  },
  {
    href: "/rent",
    label: "Rent",
    sub: "Borrow & share",
    icon: CalendarDays,
    wrapper: "border-[#D8E9FA] bg-[#F1F8FF]",
    iconClass: "bg-[#E3F1FF] text-[#2C6AA0]",
  },
  {
    href: "/lost-found",
    label: "Lost & Found",
    sub: "Find & return",
    icon: Search,
    wrapper: "border-[#F3DFC8] bg-[#FFF6EA]",
    iconClass: "bg-[#FFE8D1] text-[#C56A16]",
  },
  {
    href: "/services",
    label: "Services",
    sub: "Student skills",
    icon: Wrench,
    wrapper: "border-[#D6EBDD] bg-[#F0FAF4]",
    iconClass: "bg-[#E1F4E8] text-[#25804E]",
  },
];

export default function HomePage() {
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");

  const [marketplaceItems, setMarketplaceItems] = useState<
    MarketplaceItem[]
  >([]);

  const [rentItems, setRentItems] = useState<RentItem[]>([]);
  const [lostFoundItems, setLostFoundItems] = useState<
    LostFoundItem[]
  >([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHome() {
      setLoading(true);
      setError("");

      const { data: authData } =
        await supabase.auth.getUser();

      const currentUser = authData.user;

      if (!mounted) return;

      setUser(currentUser);

      const fullName =
        currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        "";

      setName(fullName);

      const [
        marketplaceResult,
        rentResult,
        lostFoundResult,
        servicesResult,
      ] = await Promise.all([
        supabase
          .from("marketplace_listings")
          .select(
            "id, title, price, category, location, image_url, status, created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(8),

        supabase
          .from("borrow_items")
          .select(
            "id, title, daily_rent, category, location, image_url, status, created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(6),

        supabase
          .from("lost_found_reports")
          .select(
            "id, title, type, category, location, image_url, status, created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(6),

        supabase
          .from("student_services")
          .select(
            "id, title, category, price, pricing_type, location, image_url, status, created_at"
          )
          .eq("status", "active")
          .order("created_at", {
            ascending: false,
          })
          .limit(6),
      ]);

      if (!mounted) return;

      const errors = [
        marketplaceResult.error,
        rentResult.error,
        lostFoundResult.error,
        servicesResult.error,
      ].filter(Boolean);

      if (errors.length) {
        setError(
          "Some campus content could not be loaded."
        );
      }

      setMarketplaceItems(
        (marketplaceResult.data ??
          []) as MarketplaceItem[]
      );

      setRentItems(
        (rentResult.data ?? []) as RentItem[]
      );

      setLostFoundItems(
        (lostFoundResult.data ??
          []) as LostFoundItem[]
      );

      setServiceItems(
        (servicesResult.data ??
          []) as ServiceItem[]
      );

      setLoading(false);
    }

    loadHome();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const firstName = name
    ? name.split(" ")[0]
    : "there";

  const filteredMarketplace = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return marketplaceItems.slice(0, 6);
    }

    return marketplaceItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [marketplaceItems, search]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return serviceItems.slice(0, 4);
    }

    return serviceItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      )
      .slice(0, 4);
  }, [serviceItems, search]);

  return (
    <main className="min-h-screen bg-[#E9E5DE] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-[linear-gradient(115deg,#202660_0%,#2F337B_48%,#4D43B3_100%)] text-white">

          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7568D8]/20 blur-3xl"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-[#8A80E8]/10 blur-3xl"
          />

          <div className="relative px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10">

            <div className="mx-auto max-w-6xl">

              <div className="flex items-start justify-between gap-5">

                <div className="min-w-0">

                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#DAD4FF]">
                    {user ? "Welcome back" : "Welcome to CampusLoop"}
                    {user && name
                      ? `, ${firstName}`
                      : ""}
                  </p>

                  <h1 className="mt-2 max-w-[720px] text-[31px] font-bold leading-[0.98] tracking-[-0.06em] sm:text-[43px]">
                    Everything around your campus,
                    <span className="block text-[#B8ACFF]">
                      in one loop.
                    </span>
                  </h1>

                  <p className="mt-3 max-w-[560px] text-[11px] leading-5 text-[#E3DEFF] sm:text-[13px]">
                    Buy and sell with students, borrow
                    things you need, report lost items and
                    connect with your campus community.
                  </p>

                </div>

                <span className="hidden shrink-0 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[8px] font-bold uppercase tracking-[0.15em] text-[#E8E4FF] sm:block">
                  PPSU community
                </span>

              </div>

              {/* SEARCH */}
              <div className="relative mt-6 flex h-[52px] items-center gap-3 rounded-[16px] bg-white px-4 shadow-[0_12px_30px_rgba(18,16,65,0.22)]">

                <Search
                  size={18}
                  strokeWidth={1.9}
                  className="shrink-0 text-[#5D48D2]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search marketplace, services, places..."
                  className="w-full min-w-0 bg-transparent text-[12px] text-[#172044] outline-none placeholder:text-[#999BA7]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="shrink-0 text-[9px] font-bold text-[#5D48D2]"
                  >
                    Clear
                  </button>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="mt-7 px-5 sm:px-8">

          <div className="mx-auto max-w-6xl">

            <div className="flex items-end justify-between">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8D8F99]">
                  Quick access
                </p>

                <h2 className="mt-1 text-[20px] font-bold tracking-[-0.04em]">
                  Go straight to it
                </h2>

              </div>

              <span className="hidden text-[9px] text-[#A0A1A7] sm:block">
                Everything you need on campus
              </span>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group min-h-[132px] rounded-[20px] border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,32,68,0.08)] ${item.wrapper}`}
                  >

                    <div className="flex items-start justify-between gap-2">

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${item.iconClass}`}
                      >
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                        />
                      </div>

                      <ChevronRight
                        size={17}
                        className="mt-1 text-[#8D909D] transition group-hover:translate-x-0.5"
                      />

                    </div>

                    <p className="mt-5 text-[13px] font-bold tracking-[-0.01em]">
                      {item.label}
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#858894]">
                      {item.sub}
                    </p>

                  </Link>
                );
              })}

            </div>
          </div>
        </section>

        {/* MARKETPLACE */}
        <section className="mt-8 px-5 sm:px-8">

          <div className="mx-auto max-w-6xl rounded-[25px] border border-[#E3DBFA] bg-[#F7F3FF] p-4 sm:p-5">

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8D8F99]">
                  Marketplace
                </p>

                <h2 className="mt-1 text-[20px] font-bold tracking-[-0.04em]">
                  {search
                    ? "Search results"
                    : "Fresh on campus"}
                </h2>

              </div>

              <Link
                href="/marketplace"
                className="shrink-0 text-[10px] font-bold text-[#5D48D2]"
              >
                See all
              </Link>

            </div>

            {loading ? (

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className="overflow-hidden rounded-[18px] border border-[#E8E3DA] bg-white"
                    >
                      <div className="aspect-square animate-pulse bg-[#EEEAE4]" />

                      <div className="space-y-2 p-3">
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#EEEAE4]" />
                        <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#F2EFE9]" />
                      </div>
                    </div>
                  )
                )}

              </div>

            ) : filteredMarketplace.length > 0 ? (

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                {filteredMarketplace.map(
                  (item) => (
                    <Link
                      key={item.id}
                      href={`/marketplace/${item.id}`}
                      className="group overflow-hidden rounded-[18px] border border-[#E1DDD5] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,32,68,0.07)]"
                    >

                      <div className="relative aspect-square overflow-hidden bg-[#EEE9FF]">

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#5D48D2]">
                            <Package size={27} />
                          </div>
                        )}

                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-1 text-[7px] font-bold text-[#555A6D] backdrop-blur">
                          {formatAgo(item.created_at)}
                        </span>

                        <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6D7184] backdrop-blur">
                          <Heart
                            size={12}
                            strokeWidth={1.7}
                          />
                        </span>

                      </div>

                      <div className="p-3">

                        <p className="line-clamp-1 text-[11px] font-bold text-[#172044]">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[13px] font-black text-[#5D48D2]">
                          {formatPrice(
                            Number(item.price)
                          )}
                        </p>

                        <div className="mt-2 flex items-center gap-1 text-[8px] text-[#858796]">

                          <MapPin size={9} />

                          <span className="truncate">
                            {item.location}
                          </span>

                        </div>

                      </div>

                    </Link>
                  )
                )}

              </div>

            ) : (

              <div className="mt-4 rounded-[18px] border border-dashed border-[#DAD5CB] bg-white px-5 py-10 text-center">

                <Package
                  size={21}
                  className="mx-auto text-[#A0A1A7]"
                />

                <p className="mt-2 text-[12px] font-bold">
                  Nothing found
                </p>

                <p className="mt-1 text-[10px] text-[#858796]">
                  Try another search.
                </p>

              </div>

            )}

          </div>
        </section>

        {/* CAMPUS BOARD */}
        <section className="mt-8 px-5 sm:px-8">

          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">

            {/* RENT */}
            <div className="rounded-[22px] border border-[#D8E9FA] bg-[#F2F8FF] p-4 sm:p-5">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8D8F99]">
                    Borrow & rent
                  </p>

                  <h2 className="mt-1 text-[18px] font-bold tracking-[-0.035em]">
                    Useful stuff nearby
                  </h2>

                </div>

                <Link
                  href="/rent"
                  className="text-[10px] font-bold text-[#5D48D2]"
                >
                  See all
                </Link>

              </div>

              <div className="mt-4 space-y-2">

                {rentItems
                  .slice(0, 3)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={`/rent/${item.id}`}
                      className="flex items-center gap-3 rounded-[15px] bg-[#FBFAF7] p-2.5 transition hover:bg-white"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#E7F2FF] text-[#2C6AA0]">

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen size={18} />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[11px] font-bold">
                          {item.title}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[#858796]">
                          {item.location}
                        </p>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-[10px] font-black text-[#2C6AA0]">
                          {formatPrice(
                            Number(item.daily_rent)
                          )}
                        </p>

                        <p className="text-[8px] text-[#858796]">
                          / day
                        </p>

                      </div>

                    </Link>
                  ))}

                {!loading &&
                  rentItems.length === 0 && (
                    <div className="rounded-[14px] bg-[#FBFAF7] px-4 py-7 text-center text-[10px] text-[#858796]">
                      No rental items posted yet.
                    </div>
                  )}

              </div>

            </div>

            {/* LOST & FOUND */}
            <div className="rounded-[22px] border border-[#F1DEC8] bg-[#FFF7EC] p-4 sm:p-5">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8D8F99]">
                    Lost & found
                  </p>

                  <h2 className="mt-1 text-[18px] font-bold tracking-[-0.035em]">
                    Help someone find it
                  </h2>

                </div>

                <Link
                  href="/lost-found"
                  className="text-[10px] font-bold text-[#5D48D2]"
                >
                  See all
                </Link>

              </div>

              <div className="mt-4 space-y-2">

                {lostFoundItems
                  .slice(0, 3)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={`/lost-found/${item.id}`}
                      className="flex items-center gap-3 rounded-[15px] bg-[#FBFAF7] p-2.5 transition hover:bg-white"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#FFF0DF] text-[#C56A16]">

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Search size={18} />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2">

                          <p className="truncate text-[11px] font-bold">
                            {item.title}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[7px] font-bold uppercase ${
                              item.type === "lost"
                                ? "bg-[#FFE4E1] text-[#B14B42]"
                                : "bg-[#E8F7EF] text-[#25804E]"
                            }`}
                          >
                            {item.type}
                          </span>

                        </div>

                        <p className="mt-0.5 truncate text-[9px] text-[#858796]">
                          {item.location}
                        </p>

                      </div>

                      <span className="shrink-0 text-[8px] text-[#9B9DA8]">
                        {formatAgo(item.created_at)}
                      </span>

                    </Link>
                  ))}

                {!loading &&
                  lostFoundItems.length === 0 && (
                    <div className="rounded-[14px] bg-[#FBFAF7] px-4 py-7 text-center text-[10px] text-[#858796]">
                      No Lost & Found reports yet.
                    </div>
                  )}

              </div>

            </div>

          </div>
        </section>

        {/* SERVICES */}
        <section className="mt-8 px-5 sm:px-8">

          <div className="mx-auto max-w-6xl rounded-[24px] border border-[#D8EBDD] bg-[#F1FAF5] p-4 sm:p-5">

            <div className="flex items-end justify-between">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8D8F99]">
                  Student services
                </p>

                <h2 className="mt-1 text-[19px] font-bold tracking-[-0.035em]">
                  Skills from students
                </h2>

              </div>

              <Link
                href="/services"
                className="text-[10px] font-bold text-[#5D48D2]"
              >
                Explore
              </Link>

            </div>

            {filteredServices.length > 0 ? (

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {filteredServices.map(
                  (item) => (
                    <Link
                      key={item.id}
                      href={`/services/${item.id}`}
                      className="group flex items-center gap-3 rounded-[17px] border border-[#D8EBDD] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(23,32,68,0.05)]"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#E8F7EF] text-[#25804E]">

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Wrench size={18} />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[11px] font-bold">
                          {item.title}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[#858796]">
                          {item.category}
                          {item.location
                            ? ` · ${item.location}`
                            : ""}
                        </p>

                      </div>

                      <p className="shrink-0 text-[9px] font-black text-[#25804E]">
                        {servicePrice(item)}
                      </p>

                    </Link>
                  )
                )}

              </div>

            ) : !loading ? (

              <div className="mt-4 rounded-[18px] border border-dashed border-[#DAD5CB] bg-white px-5 py-8 text-center">

                <Wrench
                  size={20}
                  className="mx-auto text-[#9B9DA8]"
                />

                <p className="mt-2 text-[12px] font-bold">
                  No services listed yet
                </p>

                <Link
                  href="/services/list"
                  className="mt-3 inline-flex rounded-full bg-[#292B68] px-4 py-2 text-[10px] font-bold text-white"
                >
                  Offer a service
                </Link>

              </div>

            ) : null}

          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 px-5 sm:px-8">
          <div
            className="mx-auto max-w-6xl overflow-hidden rounded-[23px] p-5 shadow-[0_12px_30px_rgba(73,58,170,0.18)] sm:p-6"
            style={{
              background:
                "linear-gradient(115deg, #202660 0%, #34348C 48%, #5D48D2 100%)",
            }}
          >

            <div className="flex items-start justify-between gap-5">

              <div className="min-w-0">

                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#C9C2FF]">
                  CampusLoop
                </p>

                <h2 className="mt-1.5 text-[20px] font-bold tracking-[-0.035em] text-white">
                  Add something to the loop.
                </h2>

                <p className="mt-1.5 max-w-md text-[10px] leading-4 text-[#D6D1F3] sm:text-[11px]">
                  Sell an old item, list something to rent, offer a
                  skill, or report something you found.
                </p>

              </div>

              <Sparkles
                size={21}
                className="shrink-0 text-[#C8C1FF]"
              />

            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">

              {/* CREATE POST */}
              <Link
                href="/create"
                className="flex h-10 w-full items-center justify-center rounded-[12px] px-5 text-[10px] font-bold sm:w-auto"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#20265F",
                }}
              >
                <CirclePlus
                  size={14}
                  className="mr-2 shrink-0"
                  style={{ color: "#20265F" }}
                />
                Create a post
              </Link>

              {/* SELL ITEM */}
              <Link
                href="/marketplace/sell"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] px-5 text-[10px] font-bold sm:w-auto"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  color: "#FFFFFF",
                }}
              >
                Sell an item
                <ArrowUpRight size={13} />
              </Link>

            </div>

          </div>
        </section>

        {error && (
          <p className="mx-auto mt-4 max-w-6xl px-5 text-center text-[9px] text-[#8B8D9A] sm:px-8">
            {error}
          </p>
        )}

      </div>
    </main>
  );
}