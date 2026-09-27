"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "lab-equipment", label: "Lab equipment" },
  { value: "study", label: "Study" },
  { value: "books", label: "Books" },
  { value: "stationery", label: "Stationery" },
  { value: "other", label: "Other" },
];

const conditions = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export default function ListRentItemPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electronics");
  const [dailyRent, setDailyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [condition, setCondition] = useState("good");
  const [location, setLocation] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(file: File | null) {
    setError("");

    if (!file) {
      setImageFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDailyRentChange(value: string) {
    // Allow only whole numbers.
    const cleaned = value.replace(/\D/g, "");
    setDailyRent(cleaned);
  }

  function handleDepositChange(value: string) {
    // Allow only whole numbers.
    const cleaned = value.replace(/\D/g, "");
    setDeposit(cleaned);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter an item title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const rentValue = Number(dailyRent);
    const depositValue = Number(deposit);

    if (
      dailyRent.trim() === "" ||
      Number.isNaN(rentValue) ||
      rentValue < 0
    ) {
      setError("Please enter a valid daily rent.");
      return;
    }

    if (
      deposit.trim() === "" ||
      Number.isNaN(depositValue) ||
      depositValue < 0
    ) {
      setError("Please enter a valid refundable deposit.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter the item location.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.push("/login");
        return;
      }

      let imageUrl: string | null = null;

      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("rent")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("rent")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("borrow_items")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          daily_rent: rentValue,
          deposit: depositValue,
          condition,
          location: location.trim(),
          image_url: imageUrl,
          status: "available",
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/rent");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while listing the item."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[900px] bg-[#FBF9F4] pb-20">
        <section className="rounded-b-[30px] bg-[#20265F] px-5 pb-8 pt-7 text-white sm:px-8">
          <Link
            href="/rent"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#CFCBEE] transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Rent
          </Link>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.22em] text-[#BEB8FF]">
            Student marketplace
          </p>

          <h1 className="mt-2 text-[30px] font-bold tracking-[-0.05em]">
            List an item for rent
          </h1>

          <p className="mt-2 max-w-lg text-[12px] leading-5 text-[#C8C6E0]">
            Let other students rent something they need without buying it.
          </p>
        </section>

        <section className="px-5 pt-6 sm:px-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >
            {/* IMAGE */}
            <div className="rounded-[22px] border border-[#E3DFD7] bg-white p-4 sm:p-5">
              <div className="mb-3">
                <h2 className="text-[14px] font-bold text-[#202540]">
                  Item photo
                </h2>

                <p className="mt-1 text-[10px] font-medium text-[#8A8B95]">
                  Add a clear photo so students know what they are renting.
                </p>
              </div>

              {previewUrl ? (
                <div className="relative overflow-hidden rounded-[18px] border border-[#E4E0D8]">
                  <img
                    src={previewUrl}
                    alt="Item preview"
                    className="max-h-[320px] w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleImageChange(null)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#CFCBC2] bg-[#FAF8F2] text-center transition hover:border-[#8574D9] hover:bg-[#F8F6FF]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE7FA] text-[#6546D9]">
                    <ImagePlus size={21} />
                  </div>

                  <p className="mt-3 text-[12px] font-bold text-[#373B50]">
                    Add a photo
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-[#9696A0]">
                    JPG, PNG or WEBP · Max 5MB
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    autoComplete="off"
                    className="hidden"
                    onChange={(event) =>
                      handleImageChange(event.target.files?.[0] || null)
                    }
                  />
                </label>
              )}
            </div>

            {/* BASIC DETAILS */}
            <div className="rounded-[22px] border border-[#E3DFD7] bg-white p-4 sm:p-5">
              <h2 className="mb-4 text-[14px] font-bold text-[#202540]">
                Item details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                    Item title
                  </label>

                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Casio Scientific Calculator"
                    autoComplete="off"
                    className="h-11 w-full rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] px-3.5 text-[12px] font-medium text-[#202540] outline-none transition focus:border-[#8C7CE0]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the item, what is included, and anything the renter should know."
                    rows={4}
                    autoComplete="off"
                    className="w-full resize-none rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] px-3.5 py-3 text-[12px] font-medium leading-5 text-[#202540] outline-none transition focus:border-[#8C7CE0]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-11 w-full rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] px-3.5 text-[12px] font-semibold text-[#202540] outline-none focus:border-[#8C7CE0]"
                    >
                      {categories.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                      Condition
                    </label>

                    <select
                      value={condition}
                      onChange={(event) => setCondition(event.target.value)}
                      className="h-11 w-full rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] px-3.5 text-[12px] font-semibold text-[#202540] outline-none focus:border-[#8C7CE0]"
                    >
                      {conditions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                    Location
                  </label>

                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. PPSU Campus, Hostel A"
                    autoComplete="off"
                    className="h-11 w-full rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] px-3.5 text-[12px] font-medium text-[#202540] outline-none transition focus:border-[#8C7CE0]"
                  />
                </div>
              </div>
            </div>

            {/* PRICING */}
            <div className="rounded-[22px] border border-[#E3DFD7] bg-white p-4 sm:p-5">
              <h2 className="mb-4 text-[14px] font-bold text-[#202540]">
                Rental pricing
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                    Daily rent
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#7D7F8B]">
                      ₹
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={dailyRent}
                      onChange={(event) =>
                        handleDailyRentChange(event.target.value)
                      }
                      placeholder="20"
                      name="rental-daily-price"
                      id="rental-daily-price"
                      autoComplete="off"
                      className="h-11 w-full rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] pl-8 pr-3.5 text-[12px] font-semibold text-[#202540] outline-none focus:border-[#8C7CE0]"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-[#93939D]">
                    Amount charged per day.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#737584]">
                    Refundable deposit
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#7D7F8B]">
                      ₹
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={deposit}
                      onChange={(event) =>
                        handleDepositChange(event.target.value)
                      }
                      placeholder="200"
                      name="rental-deposit"
                      id="rental-deposit"
                      autoComplete="off"
                      className="h-11 w-full rounded-[13px] border border-[#E0DDD5] bg-[#FCFBF7] pl-8 pr-3.5 text-[12px] font-semibold text-[#202540] outline-none focus:border-[#8C7CE0]"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-[#93939D]">
                    Returned after the item is handed back safely.
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-[15px] border border-[#F0CACA] bg-[#FFF3F3] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/rent"
                className="flex h-11 items-center justify-center rounded-[13px] border border-[#DDD9D1] bg-white px-5 text-[11px] font-bold text-[#5C5E6A] transition hover:bg-[#F8F6F0]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#5E4BD1] px-6 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(94,75,209,0.22)] transition hover:bg-[#503EC0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2 size={14} className="animate-spin" />
                )}

                {loading ? "Listing item..." : "List item for rent"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}