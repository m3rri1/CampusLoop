"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Code2,
  Image as ImageIcon,
  MapPin,
  Palette,
  Search,
  Star,
  Video,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Service = {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category:
    | "tutoring"
    | "design"
    | "video-editing"
    | "photography"
    | "coding"
    | "notes"
    | "other";
  price: number;
  pricing_type: "free" | "fixed" | "negotiable";
  location: string | null;
  availability: string | null;
  tags: string[];
  image_url: string | null;
  status: "active" | "unavailable" | "removed";
  created_at: string;
};

type Provider = {
  id: string;
  full_name: string | null;
};

const categories = [
  { value: "all", label: "All" },
  { value: "tutoring", label: "Tutoring" },
  { value: "design", label: "Design" },
  { value: "video-editing", label: "Video" },
  { value: "photography", label: "Photography" },
  { value: "coding", label: "Coding" },
  { value: "notes", label: "Notes" },
  { value: "other", label: "Other" },
];

const categoryMeta: Record<
  string,
  {
    label: string;
    icon: typeof BookOpen;
  }
> = {
  tutoring: {
    label: "Tutoring",
    icon: BookOpen,
  },
  design: {
    label: "Design",
    icon: Palette,
  },
  "video-editing": {
    label: "Video editing",
    icon: Video,
  },
  photography: {
    label: "Photography",
    icon: Camera,
  },
  coding: {
    label: "Coding",
    icon: Code2,
  },
  notes: {
    label: "Notes",
    icon: BookOpen,
  },
  other: {
    label: "Other",
    icon: Wrench,
  },
};

function getInitials(name: string | null | undefined) {
  if (!name) return "S";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatPricing(service: Service) {
  if (service.pricing_type === "free") {
    return "Free";
  }

  if (service.pricing_type === "negotiable") {
    return "Negotiable";
  }

  return `₹${Number(service.price || 0).toLocaleString("en-IN")}`;
}

export default function ServicesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("student_services")
      .select(
        "id, provider_id, title, description, category, price, pricing_type, location, availability, tags, image_url, status, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading student services:", error);
      setServices([]);
      setLoading(false);
      return;
    }

    const serviceRows = (data ?? []) as Service[];

    setServices(serviceRows);

    const providerIds = [
      ...new Set(serviceRows.map((service) => service.provider_id)),
    ];

    if (providerIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", providerIds);

      if (profileError) {
        console.error(
          "Error loading service providers:",
          profileError
        );
      } else {
        const providerMap: Record<string, Provider> = {};

        for (const profile of profileRows ?? []) {
          providerMap[profile.id] = profile as Provider;
        }

        setProviders(providerMap);
      }
    } else {
      setProviders({});
    }

    setLoading(false);
  }

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "all" ||
        service.category === activeCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      const providerName =
        providers[service.provider_id]?.full_name?.toLowerCase() ?? "";

      const searchableText = [
        service.title,
        service.description,
        service.location ?? "",
        service.availability ?? "",
        ...(service.tags ?? []),
        providerName,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [services, providers, search, activeCategory]);

  return (
    <main className="min-h-screen bg-[#F5F3ED] text-[#17151C]">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-b-[38px] bg-[linear-gradient(135deg,#202660_0%,#292D74_46%,#4C43A8_100%)] text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute right-[-5px] top-[72px] h-40 w-40 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute left-[52%] top-[48%] h-36 w-36 rounded-full bg-[#8A80E8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-7 pt-7 md:px-8 md:pb-10 md:pt-10">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold text-white/85">
              <Wrench className="h-3.5 w-3.5" />
              Student Services
            </div>

            <Link
              href="/services/my-services"
              className="inline-flex h-9 items-center rounded-full border border-white/15 bg-white/[0.08] px-4 text-[11px] font-semibold text-white transition hover:bg-white/[0.13]"
            >
              My services
            </Link>
          </div>

          {/* Heading */}
          <div className="mt-5 max-w-2xl">
            <h1 className="max-w-xl text-[31px] font-semibold leading-[1.08] tracking-[-0.035em] md:text-5xl">
              Skills, help and
              <br />
              services from your campus.
            </h1>

            <p className="mt-3 max-w-xl text-[12px] leading-5 text-white/68 md:text-sm md:leading-6">
              Find students who can teach, design, edit, code,
              photograph, create notes and more.
            </p>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#6D5BD0]" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services, skills or students..."
              className="h-12 w-full rounded-[14px] border border-transparent bg-white pl-11 pr-4 text-sm text-[#252733] outline-none placeholder:text-[#9EA2AF] focus:border-[#DDD7FF]"
            />
          </div>

          {/* Hero bottom action */}
          <div className="mt-3">
            <Link
              href="/services/list"
              className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-white/15 bg-white/[0.08] px-4 text-[12px] font-semibold text-white transition hover:bg-white/[0.13]"
            >
              Offer a service
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="relative z-10 px-5 pt-5 md:px-8 md:pt-7">
        <div className="mx-auto max-w-6xl">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex w-max gap-2">
              {categories.map((category) => {
                const selected = activeCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                    className={`rounded-full px-4 py-2.5 text-[13px] font-medium transition ${
                      selected
                        ? "bg-[#202660] text-white shadow-sm"
                        : "border border-[#DFDDD6] bg-[#FAF9F6] text-[#666B78] hover:bg-white"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-6xl px-5 pb-28 pt-7 md:px-8 md:pb-14 md:pt-9">
        {/* Heading */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8E95A5]">
              Campus services
            </p>

            <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.025em] text-[#171821]">
              Services
            </h2>
          </div>

          <div className="pb-1 text-[11px] text-[#858A96] md:text-sm">
            {loading
              ? "Loading..."
              : `${filteredServices.length} ${
                  filteredServices.length === 1
                    ? "result"
                    : "results"
                }`}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[20px] border border-[#E2E0D9] bg-white"
              >
                <div className="aspect-[1.25] animate-pulse bg-[#E9E9E5]" />

                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#EFF0F1]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#EFF0F1]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#EFF0F1]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="mt-5 rounded-[20px] border border-[#E1DFD8] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EEFB]">
              <Search className="h-6 w-6 text-[#6A58D8]" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#171821]">
              No services found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#727887]">
              Try another search or category, or offer your own
              service to students around campus.
            </p>

            <Link
              href="/services/list"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#202660] px-5 text-sm font-semibold text-white transition hover:bg-[#292F76]"
            >
              Offer a service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const provider = providers[service.provider_id];

              const meta =
                categoryMeta[service.category] ?? categoryMeta.other;

              const CategoryIcon = meta.icon;

              const providerName =
                provider?.full_name || "PPSU Student";

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group overflow-hidden rounded-[20px] border border-[#E1DFD8] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,32,68,0.10)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[1.25] overflow-hidden bg-[#E8E9E6]">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#E7E8E4]">
                        <ImageIcon className="h-8 w-8 text-[#BBBFB9]" />
                      </div>
                    )}

                    {/* Category */}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#454A55] shadow-sm">
                      <CategoryIcon className="h-3 w-3" />
                      {meta.label}
                    </div>

                    {/* Price */}
                    <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-[#1F2330] shadow-sm">
                      {formatPricing(service)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-[15px] font-semibold text-[#171821]">
                      {service.title}
                    </h3>

                    <p className="mt-1.5 line-clamp-2 min-h-[38px] text-[11px] leading-[18px] text-[#747A87]">
                      {service.description}
                    </p>

                    {/* Provider */}
                    <div className="mt-3.5 flex items-center gap-2.5 border-t border-[#EFEEE9] pt-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#202660] text-[10px] font-semibold text-white">
                        {getInitials(providerName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-[#2A2D35]">
                          {providerName}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9A9FAA]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {service.location || "Campus / Online"}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-[#C3C6CD] transition group-hover:translate-x-0.5 group-hover:text-[#555A67]" />
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#9DA1AA]">
                      <Star className="h-3 w-3" />
                      Student service
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}