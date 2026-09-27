"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
  Wrench,
  XCircle,
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
  updated_at: string;
};

const categoryLabels: Record<string, string> = {
  tutoring: "Tutoring",
  design: "Design",
  "video-editing": "Video editing",
  photography: "Photography",
  coding: "Coding",
  notes: "Notes",
  other: "Other",
};

const tabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unavailable", label: "Unavailable" },
  { value: "removed", label: "Removed" },
];

function formatPricing(service: Service) {
  if (service.pricing_type === "free") return "Free";
  if (service.pricing_type === "negotiable") return "Negotiable";

  return `₹${Number(service.price || 0).toLocaleString("en-IN")}`;
}

function getStatusMeta(status: Service["status"]) {
  if (status === "active") {
    return {
      label: "Active",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
    };
  }

  if (status === "unavailable") {
    return {
      label: "Unavailable",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: XCircle,
    };
  }

  return {
    label: "Removed",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: Trash2,
  };
}

export default function MyServicesPage() {
  const supabase = createClient();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setServices([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("student_services")
      .select(
        "id, provider_id, title, description, category, price, pricing_type, location, availability, tags, image_url, status, created_at, updated_at"
      )
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading my services:", error);
      setServices([]);
    } else {
      setServices((data ?? []) as Service[]);
    }

    setLoading(false);
  }

  async function updateStatus(
    serviceId: string,
    status: Service["status"]
  ) {
    setWorkingId(serviceId);
    setMenuOpen(null);

    const { error } = await supabase
      .from("student_services")
      .update({ status })
      .eq("id", serviceId);

    if (error) {
      console.error("Error updating service:", error);
      setWorkingId(null);
      return;
    }

    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status,
              updated_at: new Date().toISOString(),
            }
          : service
      )
    );

    setWorkingId(null);
  }

  async function removeService(serviceId: string) {
    const confirmed = window.confirm(
      "Remove this service from your listings?"
    );

    if (!confirmed) return;

    await updateStatus(serviceId, "removed");
  }

  const filteredServices = useMemo(() => {
    if (activeTab === "all") return services;

    return services.filter((service) => service.status === activeTab);
  }, [services, activeTab]);

  const counts = useMemo(() => {
    return {
      all: services.length,
      active: services.filter((service) => service.status === "active")
        .length,
      unavailable: services.filter(
        (service) => service.status === "unavailable"
      ).length,
      removed: services.filter((service) => service.status === "removed")
        .length,
    };
  }, [services]);

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-24">
      {/* Header */}
      <section className="bg-[#101827] text-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-7 md:px-8 md:pb-12 md:pt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-white/75">
                <Wrench className="h-3.5 w-3.5" />
                Provider dashboard
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                My services
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                Manage the services you offer to students across campus.
              </p>
            </div>

            <Link
              href="/services/list"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#101827] transition hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Offer a service
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-8">
        {/* Tabs */}
        <div className="overflow-x-auto">
          <div className="flex w-max gap-2">
            {tabs.map((tab) => {
              const selected = activeTab === tab.value;
              const count =
                counts[tab.value as keyof typeof counts] ?? 0;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? "bg-[#101827] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      selected
                        ? "bg-white/10 text-white/80"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-40 animate-pulse bg-gray-100" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
                  <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          /* Empty */
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Wrench className="h-6 w-6 text-gray-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              {services.length === 0
                ? "You haven't listed a service yet"
                : "No services in this category"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {services.length === 0
                ? "Offer your skills to other students and make them discoverable through CampusLoop."
                : "There are no services matching the selected status."}
            </p>

            {services.length === 0 && (
              <Link
                href="/services/list"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#101827] px-5 text-sm font-semibold text-white transition hover:bg-[#182235]"
              >
                Create your first service
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredServices.map((service) => {
              const statusMeta = getStatusMeta(service.status);
              const StatusIcon = statusMeta.icon;

              return (
                <div
                  key={service.id}
                  className="relative overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full shrink-0 md:w-56">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-gray-100 md:aspect-auto md:h-full md:min-h-[190px] md:rounded-l-2xl md:rounded-tr-none">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[180px] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Wrench className="h-9 w-9 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 p-5 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusMeta.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusMeta.label}
                            </span>

                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                              {categoryLabels[service.category] ||
                                "Other"}
                            </span>
                          </div>

                          <h2 className="mt-3 line-clamp-1 text-lg font-semibold tracking-tight text-gray-900">
                            {service.title}
                          </h2>

                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
                            {service.description}
                          </p>
                        </div>

                        {/* Menu */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuOpen(
                                menuOpen === service.id ? null : service.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>

                          {menuOpen === service.id && (
                            <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                              <Link
                                href={`/services/list?edit=${service.id}`}
                                onClick={() => setMenuOpen(null)}
                                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit service
                              </Link>

                              {service.status !== "active" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(service.id, "active")
                                  }
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Make active
                                </button>
                              )}

                              {service.status === "active" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      service.id,
                                      "unavailable"
                                    )
                                  }
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Mark unavailable
                                </button>
                              )}

                              {service.status !== "removed" && (
                                <button
                                  type="button"
                                  onClick={() => removeService(service.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove listing
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-[#f8f9fb] px-3.5 py-3">
                          <p className="text-[11px] text-gray-400">
                            Price
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-gray-900">
                            {formatPricing(service)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#f8f9fb] px-3.5 py-3">
                          <p className="text-[11px] text-gray-400">
                            Location
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                            {service.location || "Campus / Online"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#f8f9fb] px-3.5 py-3">
                          <p className="text-[11px] text-gray-400">
                            Availability
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                            {service.availability || "Contact me"}
                          </p>
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="mt-5 flex flex-col gap-2.5 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-400">
                          Listed{" "}
                          {new Date(
                            service.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Link
                            href={`/services/${service.id}`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>

                          <Link
                            href={`/services/list?edit=${service.id}`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#101827] px-3.5 text-xs font-semibold text-white transition hover:bg-[#182235]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {workingId === service.id && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}