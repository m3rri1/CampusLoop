"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
  { value: "tutoring", label: "Tutoring" },
  { value: "design", label: "Design" },
  { value: "video-editing", label: "Video editing" },
  { value: "photography", label: "Photography" },
  { value: "coding", label: "Coding" },
  { value: "notes", label: "Notes" },
  { value: "other", label: "Other" },
];

type PricingType = "free" | "fixed" | "negotiable";

type ServiceData = {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  pricing_type: PricingType;
  location: string | null;
  availability: string | null;
  tags: string[];
  image_url: string | null;
  status: "active" | "unavailable" | "removed";
};

export default function ListServicePage() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingUser, setCheckingUser] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tutoring");
  const [pricingType, setPricingType] =
    useState<PricingType>("fixed");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [tags, setTags] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] =
    useState<string | null>(null);

  const [serviceStatus, setServiceStatus] = useState<
    "active" | "unavailable" | "removed"
  >("active");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const params = new URLSearchParams(window.location.search);
    const queryEditId = params.get("edit");

    if (queryEditId) {
      setEditId(queryEditId);
      await loadServiceForEdit(user.id, queryEditId);
    }

    setCheckingUser(false);
  }

  async function loadServiceForEdit(
    currentUserId: string,
    serviceId: string
  ) {
    setLoadingEdit(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("student_services")
      .select(
        "id, provider_id, title, description, category, price, pricing_type, location, availability, tags, image_url, status"
      )
      .eq("id", serviceId)
      .eq("provider_id", currentUserId)
      .single();

    if (fetchError || !data) {
      console.error(
        "Error loading service for edit:",
        fetchError
      );
      setError("This service could not be loaded for editing.");
      setLoadingEdit(false);
      return;
    }

    const service = data as ServiceData;

    setTitle(service.title);
    setDescription(service.description);
    setCategory(service.category);
    setPricingType(service.pricing_type);

    setPrice(
      service.pricing_type === "fixed"
        ? String(service.price ?? "")
        : ""
    );

    setLocation(service.location ?? "");
    setAvailability(service.availability ?? "");
    setTags((service.tags ?? []).join(", "));
    setExistingImageUrl(service.image_url);
    setImagePreview(service.image_url);
    setServiceStatus(service.status);

    setLoadingEdit(false);
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);

    if (
      imagePreview &&
      imagePreview !== existingImageUrl
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    if (
      imagePreview &&
      imagePreview !== existingImageUrl
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  }

  function handlePriceChange(value: string) {
    setPrice(value.replace(/\D/g, ""));
  }

  function validate() {
    if (!title.trim()) {
      return "Please enter a service title.";
    }

    if (title.trim().length < 5) {
      return "Service title should be at least 5 characters.";
    }

    if (!description.trim()) {
      return "Please describe the service.";
    }

    if (description.trim().length < 20) {
      return "Please provide a little more detail about your service.";
    }

    if (pricingType === "fixed" && !price) {
      return "Please enter your price.";
    }

    if (pricingType === "fixed" && Number(price) < 1) {
      return "Price must be at least ₹1.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!userId) {
      setError("Please sign in before continuing.");
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | null = existingImageUrl;

      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("student-services")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("student-services")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8);

      const finalPrice =
        pricingType === "fixed"
          ? Number(price || 0)
          : 0;

      if (editId) {
        const { error: updateError } = await supabase
          .from("student_services")
          .update({
            title: title.trim(),
            description: description.trim(),
            category,
            price: finalPrice,
            pricing_type: pricingType,
            location: location.trim() || null,
            availability: availability.trim() || null,
            tags: parsedTags,
            image_url: imageUrl,
            status: serviceStatus,
          })
          .eq("id", editId)
          .eq("provider_id", userId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setSuccess("Your service has been updated.");

        setTimeout(() => {
          router.push(`/services/${editId}`);
        }, 700);
      } else {
        const { data, error: insertError } = await supabase
          .from("student_services")
          .insert({
            provider_id: userId,
            title: title.trim(),
            description: description.trim(),
            category,
            price: finalPrice,
            pricing_type: pricingType,
            location: location.trim() || null,
            availability: availability.trim() || null,
            tags: parsedTags,
            image_url: imageUrl,
            status: "active",
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        setSuccess("Your service has been listed.");

        if (data?.id) {
          setTimeout(() => {
            router.push(`/services/${data.id}`);
          }, 700);
        }
      }
    } catch (submitError) {
      console.error(
        "Error saving student service:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving your service."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingUser || loadingEdit) {
    return (
      <main className="min-h-screen bg-[#F5F3ED]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#5D48D2]" />
        </div>
      </main>
    );
  }

  const isEditing = Boolean(editId);

  return (
    <main className="min-h-screen bg-[#F5F3ED] pb-28 text-[#17151C]">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-b-[34px] bg-[linear-gradient(115deg,#202660_0%,#2F337B_48%,#4D43B3_100%)] text-white">
        <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute right-10 top-20 h-32 w-32 rounded-full border border-white/[0.06]" />

        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <Link
            href={
              isEditing
                ? "/services/my-services"
                : "/services"
            }
            className="inline-flex items-center gap-2 text-[12px] font-medium text-white/65 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEditing
              ? "Back to my services"
              : "Back to services"}
          </Link>

          <div className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold text-white/85">
              {isEditing ? (
                <Save className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}

              {isEditing
                ? "Edit service"
                : "Offer a service"}
            </div>

            <h1 className="mt-4 max-w-xl text-[31px] font-semibold leading-[1.08] tracking-[-0.035em] md:text-4xl">
              {isEditing
                ? "Edit your service."
                : "Offer your skills to campus."}
            </h1>

            <p className="mt-3 max-w-xl text-[12px] leading-5 text-white/65 md:text-sm md:leading-6">
              {isEditing
                ? "Keep your listing accurate and up to date."
                : "Share something you know, make or do with other students."}
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-4xl px-4 pt-5 md:px-8 md:pt-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* BASIC INFO */}
          <div className="rounded-[20px] border border-[#E1DED6] bg-white p-5 md:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9298A6]">
                Basic information
              </p>

              <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[#171821]">
                What do you offer?
              </h2>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#343741]">
                  Service title
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  maxLength={100}
                  placeholder="e.g. I can design posters and Instagram creatives"
                  className="h-12 w-full rounded-[13px] border border-[#E2E1DC] bg-[#FAFAF8] px-4 text-[13px] text-[#20222B] outline-none transition placeholder:text-[#A1A5B0] focus:border-[#BDB7EF] focus:bg-white"
                />

                <div className="mt-1.5 text-right text-[10px] text-[#A0A4AD]">
                  {title.length}/100
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#343741]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  maxLength={1000}
                  rows={5}
                  placeholder="Explain what you provide, what students receive, and anything they should know before contacting you."
                  className="w-full resize-none rounded-[13px] border border-[#E2E1DC] bg-[#FAFAF8] px-4 py-3 text-[13px] leading-5 text-[#20222B] outline-none transition placeholder:text-[#A1A5B0] focus:border-[#BDB7EF] focus:bg-white"
                />

                <div className="mt-1.5 text-right text-[10px] text-[#A0A4AD]">
                  {description.length}/1000
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2.5 block text-[12px] font-semibold text-[#343741]">
                  Category
                </label>

                <div className="flex flex-wrap gap-2">
                  {categories.map((item) => {
                    const selected = category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setCategory(item.value)
                        }
                        className={`rounded-full px-4 py-2.5 text-[12px] font-medium transition ${
                          selected
                            ? "bg-[#202660] text-white"
                            : "border border-[#E1DFD8] bg-[#FAF9F6] text-[#656A77] hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PRICING */}
          <div className="rounded-[20px] border border-[#E1DED6] bg-white p-5 md:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9298A6]">
                Pricing
              </p>

              <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[#171821]">
                How should students pay?
              </h2>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {[
                {
                  value: "free" as PricingType,
                  title: "Free",
                  description: "No charge",
                },
                {
                  value: "fixed" as PricingType,
                  title: "Fixed price",
                  description: "Set your price",
                },
                {
                  value: "negotiable" as PricingType,
                  title: "Negotiable",
                  description: "Discuss in chat",
                },
              ].map((option) => {
                const selected =
                  pricingType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setPricingType(option.value)
                    }
                    className={`rounded-[14px] border p-4 text-left transition ${
                      selected
                        ? "border-[#202660] bg-[#202660] text-white"
                        : "border-[#E1DFD8] bg-[#FAF9F6] text-[#242731] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold">
                        {option.title}
                      </span>

                      {selected && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>

                    <p
                      className={`mt-1 text-[11px] ${
                        selected
                          ? "text-white/60"
                          : "text-[#8A8F9A]"
                      }`}
                    >
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {pricingType === "fixed" && (
              <div className="mt-4">
                <label className="mb-2 block text-[12px] font-semibold text-[#343741]">
                  Price
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-[#777C89]">
                    ₹
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={price}
                    onChange={(event) =>
                      handlePriceChange(
                        event.target.value
                      )
                    }
                    placeholder="500"
                    className="h-12 w-full rounded-[13px] border border-[#E2E1DC] bg-[#FAFAF8] pl-8 pr-4 text-[13px] text-[#20222B] outline-none transition placeholder:text-[#A1A5B0] focus:border-[#BDB7EF] focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="rounded-[20px] border border-[#E1DED6] bg-white p-5 md:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9298A6]">
                Service details
              </p>

              <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[#171821]">
                Help students know what to expect.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Location */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#343741]">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  maxLength={100}
                  placeholder="e.g. PPSU Campus / Online"
                  className="h-12 w-full rounded-[13px] border border-[#E2E1DC] bg-[#FAFAF8] px-4 text-[13px] text-[#20222B] outline-none transition placeholder:text-[#A1A5B0] focus:border-[#BDB7EF] focus:bg-white"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#343741]">
                  Availability
                </label>

                <input
                  value={availability}
                  onChange={(event) =>
                    setAvailability(
                      event.target.value
                    )
                  }
                  maxLength={100}
                  placeholder="e.g. Weekday evenings"
                  className="h-12 w-full rounded-[13px] border border-[#E2E1DC] bg-[#FAFAF8] px-4 text-[13px] text-[#20222B] outline-none transition placeholder:text-[#A1A5B0] focus:border-[#BDB7EF] focus:bg-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mt-5">
              <label className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#343741]">
                <Tag className="h-3.5 w-3.5 text-[#777D89]" />
                Tags
              </label>

              <input
                value={tags}
                onChange={(event) =>
                  setTags(event.target.value)
                }
                placeholder="e.g. figma, instagram, poster, branding"
                className="h-12 w-full rounded-[13px] border border-[#E2E1DC] bg-[#FAFAF8] px-4 text-[13px] text-[#20222B] outline-none transition placeholder:text-[#A1A5B0] focus:border-[#BDB7EF] focus:bg-white"
              />

              <p className="mt-1.5 text-[10px] text-[#9A9FAA]">
                Separate tags with commas.
              </p>
            </div>
          </div>

          {/* IMAGE */}
          <div className="rounded-[20px] border border-[#E1DED6] bg-white p-5 md:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9298A6]">
                Cover image
              </p>

              <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[#171821]">
                {isEditing
                  ? "Update your cover image."
                  : "Add a photo to your listing."}
              </h2>

              <p className="mt-1 text-[11px] text-[#858A96]">
                PNG, JPG or WEBP · max 5 MB
              </p>
            </div>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-[16px] border border-[#E1DFD8] bg-[#ECEDE9]">
                <img
                  src={imagePreview}
                  alt="Service preview"
                  className="aspect-[16/9] w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D8D7D1] bg-[#FAF9F6] px-6 py-11 text-center transition hover:border-[#BBB6E9] hover:bg-[#F8F7FC]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EFEDFB]">
                  <Upload className="h-5 w-5 text-[#6856D8]" />
                </div>

                <p className="mt-4 text-[13px] font-semibold text-[#343741]">
                  Upload a cover image
                </p>

                <p className="mt-1 text-[11px] text-[#858A96]">
                  A clear image makes your listing easier to
                  discover.
                </p>

                <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#E0DED7] bg-white px-4 text-[11px] font-medium text-[#555A66]">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Choose image
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="flex items-center gap-2 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-[12px] text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <div className="sticky bottom-3 z-20 rounded-[18px] border border-[#DEDCD6] bg-white/95 p-3 shadow-[0_10px_30px_rgba(23,32,68,0.12)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="hidden min-w-0 sm:block">
                <p className="text-[12px] font-semibold text-[#292C35]">
                  {isEditing
                    ? "Ready to save your changes?"
                    : "Ready to publish?"}
                </p>

                <p className="mt-0.5 text-[10px] text-[#8B909C]">
                  {isEditing
                    ? "Your updated service will appear immediately."
                    : "Your service will be visible to campus students."}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#202660] px-6 text-[12px] font-semibold text-white transition hover:bg-[#292F76] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing
                      ? "Saving..."
                      : "Publishing..."}
                  </>
                ) : isEditing ? (
                  <>
                    Save changes
                    <Save className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Publish service
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}