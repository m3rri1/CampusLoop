"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const categories = [
  { value: "books", label: "Books" },
  { value: "electronics", label: "Electronics" },
  { value: "stationery", label: "Stationery" },
  { value: "clothing", label: "Clothing" },
  { value: "other", label: "Other" },
] as const;

const conditions = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like new" },
  { value: "used", label: "Used" },
] as const;

type ExistingListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image_url: string | null;
};

export default function SellMarketplacePage() {
  const [supabase] = useState(() => createClient());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadExistingListing() {
      const editId = new URLSearchParams(window.location.search).get(
        "edit"
      );

      if (!editId) {
        return;
      }

      setEditingId(editId);
      setLoadingListing(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/login?redirect=/marketplace/sell?edit=${editId}`;
        return;
      }

      const { data, error: listingError } = await supabase
        .from("marketplace_listings")
        .select(
          "id, title, description, price, category, condition, location, image_url"
        )
        .eq("id", editId)
        .eq("seller_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (listingError) {
        setError(listingError.message);
        setLoadingListing(false);
        return;
      }

      if (!data) {
        setError("Listing not found or you do not own this listing.");
        setLoadingListing(false);
        return;
      }

      const listing = data as ExistingListing;

      setTitle(listing.title);
      setPrice(String(listing.price));
      setCategory(listing.category);
      setCondition(listing.condition);
      setLocation(listing.location);
      setDescription(listing.description);
      setImagePreview(listing.image_url);

      setLoadingListing(false);
    }

    loadExistingListing();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  function handleImageChange(file: File | undefined) {
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

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!price || !/^\d+$/.test(price)) {
  setError("Please enter a valid price.");
  return;
}

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!condition) {
      setError("Please select the item's condition.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter a pickup location.");
      return;
    }

    if (!description.trim()) {
      setError("Please add a description.");
      return;
    }

    if (!editingId && !imageFile) {
      setError("Please upload a photo of the item.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login?redirect=/marketplace/sell";
        return;
      }

      let imageUrl = imagePreview;

      // Upload a new image only when the user selected one.
      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("marketplace")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("marketplace")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // EDIT EXISTING LISTING
      if (editingId) {
        console.log("PRICE BEING SAVED:", price, Number(price));
        const { error: updateError } = await supabase
          .from("marketplace_listings")
          .update({
            title: title.trim(),
            description: description.trim(),
            price: Number(price),
            category,
            condition,
            location: location.trim(),
            image_url: imageUrl,
          })
          .eq("id", editingId)
          .eq("seller_id", user.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        window.location.href = "/marketplace/my-listings";
        return;
      }

      // CREATE NEW LISTING
      const { error: listingError } = await supabase
        .from("marketplace_listings")
        .insert({
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          condition,
          location: location.trim(),
          image_url: imageUrl,
          status: "active",
        });

      if (listingError) {
        throw new Error(listingError.message);
      }

      window.location.href = "/marketplace";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the listing."
      );
      setLoading(false);
    }
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[900px] bg-[#FBF9F4] pb-28">
        {/* HEADER */}
        <div className="border-b border-[#E4E0D8] bg-[#FBF9F4] px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <Link
              href="/marketplace/my-listings"
              aria-label="Back to my listings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#555A6D] transition hover:border-[#CFC8FF]"
            >
              <ArrowLeft size={16} />
            </Link>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6952D7]">
                Campus marketplace
              </p>

              <h1 className="mt-0.5 text-[21px] font-bold tracking-[-0.04em] text-[#171A35]">
                {editingId ? "Edit listing" : "Sell something"}
              </h1>
            </div>
          </div>
        </div>

        {/* LOADING EXISTING LISTING */}
        {loadingListing ? (
          <section className="flex min-h-[70vh] items-center justify-center px-5">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
              <p className="mt-4 text-[11px] font-semibold text-[#777A8B]">
                Loading listing...
              </p>
            </div>
          </section>
        ) : (
          <section className="px-5 py-6 sm:px-8 sm:py-9">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-3xl space-y-5"
            >
              {/* ERROR */}
              {error && (
                <div className="rounded-[16px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
                  {error}
                </div>
              )}

              {/* PHOTO */}
              <section className="rounded-[22px] border border-[#E4E0D8] bg-white p-5 shadow-[0_5px_22px_rgba(23,32,68,0.04)] sm:p-6">
                <div className="mb-4">
                  <h2 className="text-[14px] font-bold text-[#202540]">
                    Item photo
                  </h2>

                  <p className="mt-1 text-[10px] text-[#858796]">
                    {editingId
                      ? "Keep the current photo or upload a new one."
                      : "Upload a clear photo so buyers know what they're getting."}
                  </p>
                </div>

                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-[18px] border border-[#E2DED6] bg-[#F7F4EE]">
                    <img
                      src={imagePreview}
                      alt="Listing preview"
                      className="h-[260px] w-full object-cover sm:h-[330px]"
                    />

                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#4D5161] shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[210px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-[#CFC9BF] bg-[#FAF8F3] transition hover:border-[#B8AFF0] hover:bg-[#F8F5FF]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                      <ImagePlus size={22} />
                    </div>

                    <p className="mt-3 text-[12px] font-bold text-[#34384D]">
                      Add item photo
                    </p>

                    <p className="mt-1 text-[10px] text-[#8B8D99]">
                      JPG, PNG or WEBP · max 5 MB
                    </p>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0])
                  }
                />
              </section>

              {/* DETAILS */}
              <section className="rounded-[22px] border border-[#E4E0D8] bg-white p-5 shadow-[0_5px_22px_rgba(23,32,68,0.04)] sm:p-6">
                <h2 className="text-[14px] font-bold text-[#202540]">
                  Listing details
                </h2>

                <div className="mt-5 space-y-4">
                  {/* TITLE */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A8B]">
                      Title
                    </label>

                    <input
                      value={title}
                      onChange={(event) =>
                        setTitle(event.target.value)
                      }
                      placeholder="e.g. Casio FX-991ES Calculator"
                      className="mt-1.5 h-11 w-full rounded-[13px] border border-[#DDD9D1] bg-[#FAF9F6] px-3.5 text-[12px] text-[#202540] outline-none placeholder:text-[#AAAAB3] focus:border-[#9183E8] focus:bg-white"
                    />
                  </div>

                  {/* PRICE */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A8B]">
                      Price
                    </label>

                    <div className="mt-1.5 flex items-center overflow-hidden rounded-[13px] border border-[#DDD9D1] bg-[#FAF9F6] focus-within:border-[#9183E8] focus-within:bg-white">
                      <span className="pl-3.5 text-[12px] font-bold text-[#5D48D2]">
                        ₹
                      </span>

                      <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={price}
  onChange={(event) => {
    const value = event.target.value.replace(/\D/g, "");
    setPrice(value);
  }}
  placeholder="450"
  className="h-11 w-full bg-transparent px-2 text-[12px] text-[#202540] outline-none placeholder:text-[#AAAAB3]"
/>
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A8B]">
                      Category
                    </label>

                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {categories.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setCategory(item.value)
                          }
                          className={`rounded-[12px] border px-3 py-3 text-[10px] font-bold transition ${
                            category === item.value
                              ? "border-[#8F82E4] bg-[#EEE9FF] text-[#5D48D2]"
                              : "border-[#DDD9D1] bg-[#FAF9F6] text-[#5F6271] hover:border-[#CFC8FF]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CONDITION */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A8B]">
                      Condition
                    </label>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {conditions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setCondition(item.value)
                          }
                          className={`rounded-[12px] border px-3 py-3 text-[10px] font-bold transition ${
                            condition === item.value
                              ? "border-[#8F82E4] bg-[#EEE9FF] text-[#5D48D2]"
                              : "border-[#DDD9D1] bg-[#FAF9F6] text-[#5F6271] hover:border-[#CFC8FF]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A8B]">
                      Pickup location
                    </label>

                    <input
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="e.g. Central Library"
                      className="mt-1.5 h-11 w-full rounded-[13px] border border-[#DDD9D1] bg-[#FAF9F6] px-3.5 text-[12px] text-[#202540] outline-none placeholder:text-[#AAAAB3] focus:border-[#9183E8] focus:bg-white"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A8B]">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Describe the item's condition, what's included, and anything buyers should know."
                      rows={5}
                      className="mt-1.5 w-full resize-none rounded-[13px] border border-[#DDD9D1] bg-[#FAF9F6] px-3.5 py-3 text-[12px] leading-5 text-[#202540] outline-none placeholder:text-[#AAAAB3] focus:border-[#9183E8] focus:bg-white"
                    />
                  </div>
                </div>
              </section>

              {/* SUBMIT */}
              <div className="rounded-[22px] border border-[#E4E0D8] bg-white p-5 shadow-[0_5px_22px_rgba(23,32,68,0.04)] sm:p-6">
                <div className="rounded-[16px] bg-[#F8F6F0] px-4 py-3.5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#EEE9FF] text-[#5D48D2]">
                      <Upload size={15} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-[#3D4051]">
                        Keep exchanges on campus
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-[#858796]">
                        Meet in a safe campus location and keep your
                        personal contact details private.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#20265F] text-[12px] font-bold text-white shadow-[0_8px_22px_rgba(32,38,95,0.18)] transition hover:bg-[#191E53] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      {editingId ? "Saving..." : "Publishing..."}
                    </>
                  ) : editingId ? (
                    "Save changes"
                  ) : (
                    "Publish listing"
                  )}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}