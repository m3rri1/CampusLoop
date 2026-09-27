"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Code2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Palette,
  Tag,
  Video,
  Wrench,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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

function formatPricing(service: Service) {
  if (service.pricing_type === "free") return "Free";
  if (service.pricing_type === "negotiable") return "Negotiable";

  return `₹${Number(service.price || 0).toLocaleString("en-IN")}`;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "S";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ServiceDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  async function loadService() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);

    const { data: serviceData, error: serviceError } = await supabase
      .from("student_services")
      .select(
        "id, provider_id, title, description, category, price, pricing_type, location, availability, tags, image_url, status, created_at"
      )
      .eq("id", id)
      .single();

    if (serviceError || !serviceData) {
      console.error("Error loading service:", serviceError);
      setError("This service could not be found.");
      setLoading(false);
      return;
    }

    const serviceRow = serviceData as Service;
    setService(serviceRow);

    const { data: providerData, error: providerError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", serviceRow.provider_id)
      .single();

    if (providerError) {
      console.error("Error loading provider:", providerError);
    } else {
      setProvider(providerData as Provider);
    }

    setLoading(false);
  }

async function startChat() {
  if (!service) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push(`/login?redirect=/services/${service.id}`);
    return;
  }

  if (user.id === service.provider_id) {
    return;
  }

  const { data: conversationId, error: conversationError } =
    await supabase.rpc("get_or_create_service_conversation", {
      p_service_id: service.id,
    });

  if (conversationError) {
    console.error(
      "Error creating service conversation:",
      conversationError
    );
    setError(conversationError.message);
    return;
  }

  if (!conversationId) {
    setError("Could not open the service conversation.");
    return;
  }

  router.push(
    `/chat?type=services&conversation=${conversationId}`
  );
}

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f9]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-[#f6f7f9] px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">
              Service not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error || "This listing may have been removed."}
            </p>

            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#101827] px-5 py-3 text-sm font-semibold text-white"
            >
              Browse services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const meta = categoryMeta[service.category] ?? categoryMeta.other;
  const CategoryIcon = meta.icon;
  const providerName = provider?.full_name || "PPSU Student";
  const isOwner = currentUserId === service.provider_id;

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-24">
      {/* Top */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ImageIcon className="h-14 w-14 text-gray-300" />
                </div>
              )}

              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                <CategoryIcon className="h-4 w-4" />
                {meta.label}
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold leading-tight tracking-tight text-gray-900 md:text-3xl">
                    {service.title}
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {service.description}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatPricing(service)}
                </div>
              </div>

              {/* Provider */}
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101827] text-sm font-semibold text-white">
                  {getInitials(providerName)}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {providerName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Student service provider
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8f9fb] p-3.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </div>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {service.location || "Campus / Online"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8f9fb] p-3.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Availability
                  </div>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {service.availability || "Contact provider"}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {service.tags?.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Tag className="h-3.5 w-3.5" />
                    Skills & tags
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="mt-6">
                {isOwner ? (
                  <Link
                    href="/services/my-services"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#101827] text-sm font-semibold text-white transition hover:bg-[#182235]"
                  >
                    Manage my services
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={startChat}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#101827] text-sm font-semibold text-white transition hover:bg-[#182235]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with provider
                  </button>
                )}
              </div>

              {!isOwner && (
                <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                  Discuss availability, pricing and requirements directly with
                  the student.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}