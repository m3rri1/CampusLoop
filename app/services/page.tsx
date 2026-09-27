"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Code2,
  Image as ImageIcon,
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
  const supabase = createClient();

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
        console.error("Error loading service providers:", profileError);
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
        activeCategory === "all" || service.category === activeCategory;

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
    <main className="min-h-screen bg-[#f6f7f9]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#101827] text-white">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-9 md:px-8 md:pb-24 md:pt-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-white/75">
              <Wrench className="h-3.5 w-3.5" />
              Student Services
            </div>

            <h1 className="mt-5 max-w-2xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] md:text-5xl">
              Skills, help and services from your campus.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Find students who can teach, design, edit, code, photograph,
              create notes and more.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/services/list"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#101827] transition hover:bg-white/90"
              >
                Offer a service
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/services/my-services"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.09]"
              >
                My services
              </Link>
            </div>
          </div>
        </div>

        {/* subtle decoration */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/[0.04]" />
      </section>

      {/* Floating search panel */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 md:-mt-12 md:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.10)] md:p-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services, skills or students..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8f9fb] pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
              />
            </div>

            {/* Category chips */}
            <div className="-mx-1 overflow-x-auto px-1">
              <div className="flex w-max gap-2">
                {categories.map((category) => {
                  const selected = activeCategory === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setActiveCategory(category.value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "bg-[#101827] text-white"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8 md:pb-12 md:pt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Campus marketplace
            </p>

            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-gray-900">
              Services
            </h2>
          </div>

          <div className="shrink-0 text-xs text-gray-500 md:text-sm">
            {loading
              ? "Loading..."
              : `${filteredServices.length} ${
                  filteredServices.length === 1 ? "result" : "results"
                }`}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-100" />

                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="mt-4 h-9 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          /* Empty */
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Search className="h-6 w-6 text-gray-400" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              No services yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              There are no services matching your search right now. Be one of
              the first students to offer your skills.
            </p>

            <Link
              href="/services/list"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101827] px-5 text-sm font-semibold text-white transition hover:bg-[#182235]"
            >
              Offer a service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Cards */
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const provider = providers[service.provider_id];
              const meta = categoryMeta[service.category] ?? categoryMeta.other;
              const CategoryIcon = meta.icon;
              const providerName = provider?.full_name || "PPSU Student";

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eef0f3]">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e4e7ec]">
                        <ImageIcon className="h-9 w-9 text-gray-300" />
                      </div>
                    )}

                    {/* category */}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm">
                      <CategoryIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </div>

                    {/* price */}
                    <div className="absolute right-3 top-3 rounded-full border border-white/70 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
                      {formatPricing(service)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-[15px] font-semibold text-gray-900">
                      {service.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">
                      {service.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2.5 border-t border-gray-100 pt-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#101827] text-[10px] font-semibold text-white">
                        {getInitials(providerName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-900">
                          {providerName}
                        </p>

                        <p className="truncate text-[11px] text-gray-400">
                          {service.location || "Campus / Online"}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-700" />
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Star className="h-3.5 w-3.5" />
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