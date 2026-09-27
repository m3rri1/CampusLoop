"use client";



import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Package,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";



type RentItem = {

  id: string;

  owner_id: string;

  title: string;

  description: string;

  category: string;

  daily_rent: number;

  deposit: number;

  condition: string;

  location: string;

  image_url: string | null;

  status: string;

  created_at: string;

};



type Profile = {

  id: string;

  full_name: string | null;

};



function getCategoryLabel(category: string) {

  const labels: Record<string, string> = {

    electronics: "Electronics",

    "lab-equipment": "Lab equipment",

    study: "Study",

    books: "Books",

    stationery: "Stationery",

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



function getToday() {

  const today = new Date();



  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");



  return `${year}-${month}-${day}`;

}



function getRentalDays(startDate: string, endDate: string) {

  if (!startDate || !endDate) return 0;



  const start = new Date(`${startDate}T00:00:00`);

  const end = new Date(`${endDate}T00:00:00`);



  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {

    return 0;

  }



  const difference =

    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);



  return difference >= 0 ? Math.floor(difference) + 1 : 0;

}



export default function RentItemDetailPage() {

  const params = useParams();

  const id = params.id as string;



  const router = useRouter();

  const [supabase] = useState(() => createClient());



  const today = useMemo(() => getToday(), []);



  const [item, setItem] = useState<RentItem | null>(null);

  const [owner, setOwner] = useState<Profile | null>(null);



  const [startDate, setStartDate] = useState(today);

  const [endDate, setEndDate] = useState(today);



  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);



  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);
  const [rentConversationId, setRentConversationId] = useState<string | null>(null);



  useEffect(() => {

    let mounted = true;



    async function loadItem() {

      setLoading(true);

      setError("");



      const { data: itemData, error: itemError } = await supabase

        .from("borrow_items")

        .select(

          "id, owner_id, title, description, category, daily_rent, deposit, condition, location, image_url, status, created_at"

        )

        .eq("id", id)

        .maybeSingle();



      if (itemError) {

        if (mounted) {

          setError(itemError.message);

          setLoading(false);

        }

        return;

      }



      if (!itemData) {

        if (mounted) {

          setError("This rental item could not be found.");

          setLoading(false);

        }

        return;

      }



      if (!mounted) return;



      setItem(itemData as RentItem);



      const { data: ownerData } = await supabase

        .from("profiles")

        .select("id, full_name")

        .eq("id", itemData.owner_id)

        .maybeSingle();



      if (mounted && ownerData) {

        setOwner(ownerData as Profile);

      }



      if (mounted) {

        setLoading(false);

      }

    }



    if (id) {

      loadItem();

    }



    return () => {

      mounted = false;

    };

  }, [id, supabase]);



  const rentalDays = useMemo(

    () => getRentalDays(startDate, endDate),

    [startDate, endDate]

  );



  const totalRent = item ? rentalDays * Number(item.daily_rent) : 0;

  const deposit = item ? Number(item.deposit) : 0;

  const totalAmount = totalRent + deposit;



  function handleStartDateChange(value: string) {

    setStartDate(value);



    if (endDate < value) {

      setEndDate(value);

    }



    setError("");

    setSuccess(false);

  }



  function handleEndDateChange(value: string) {

    setEndDate(value);

    setError("");

    setSuccess(false);

  }



  async function handleRequestRental() {

    if (!item) return;



    setError("");

    setSuccess(false);



    if (!startDate || !endDate) {

      setError("Please choose your rental dates.");

      return;

    }



    const days = getRentalDays(startDate, endDate);



    if (days < 1) {

      setError("End date must be the same as or after the start date.");

      return;

    }



    const {

      data: { user },

    } = await supabase.auth.getUser();



    if (!user) {

      router.push(`/login?redirect=/rent/${item.id}`);

      return;

    }



    if (user.id === item.owner_id) {

      setError("You cannot rent your own item.");

      return;

    }



    setSubmitting(true);



    // Re-check that the item is still available.

    const { data: currentItem, error: currentItemError } = await supabase

      .from("borrow_items")

      .select("id, owner_id, daily_rent, deposit, status")

      .eq("id", item.id)

      .maybeSingle();



    if (currentItemError) {

      setError(currentItemError.message);

      setSubmitting(false);

      return;

    }



    if (!currentItem) {

      setError("This rental item is no longer available.");

      setSubmitting(false);

      return;

    }



    if (currentItem.status !== "available") {

      setError("This item is no longer available to rent.");

      setSubmitting(false);

      return;

    }



    // Prevent the same user from creating another open request

    // for the same item.

    const { data: existingRequest, error: existingError } =

      await supabase

        .from("rent_requests")

        .select("id, status")

        .eq("item_id", item.id)

        .eq("renter_id", user.id)

        .in("status", ["pending", "approved", "active"])

        .limit(1)

        .maybeSingle();



    if (existingError) {

      setError(existingError.message);

      setSubmitting(false);

      return;

    }



    if (existingRequest) {

      setError(

        "You already have an active request for this rental item."

      );

      setSubmitting(false);

      return;

    }



    const currentDailyRent = Number(currentItem.daily_rent);

    const currentDeposit = Number(currentItem.deposit);



    const calculatedTotalRent = days * currentDailyRent;

    const calculatedTotalAmount =

      calculatedTotalRent + currentDeposit;



    const { data: requestData, error: insertError } = await supabase

      .from("rent_requests")

      .insert({

        item_id: item.id,

        renter_id: user.id,

        owner_id: currentItem.owner_id,

        start_date: startDate,

        end_date: endDate,

        days,

        daily_rent: currentDailyRent,

        deposit: currentDeposit,

        total_rent: calculatedTotalRent,

        total_amount: calculatedTotalAmount,

      })
      .select("id")
      .single();



    if (insertError || !requestData) {
      setError(insertError?.message || "Could not create your rental request.");
      setSubmitting(false);
      return;
    }

    const { data: rentConversation, error: conversationError } =
      await supabase
        .from("rent_conversations")
        .select("id")
        .eq("request_id", requestData.id)
        .maybeSingle();

    if (conversationError || !rentConversation) {
      setError(
        conversationError?.message ||
          "Rental request was sent, but the chat could not be created."
      );
      setSubmitting(false);
      return;
    }

    setRentConversationId(rentConversation.id);
    setSuccess(true);
    setSubmitting(false);

  }



  if (loading) {

    return (

      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">

        <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-5 py-6 sm:px-8">

          <div className="flex min-h-[70vh] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />



              <p className="mt-4 text-[11px] font-semibold text-[#777A8B]">

                Loading rental item...

              </p>

            </div>

          </div>

        </div>

      </main>

    );

  }



  if (error && !item) {

    return (

      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">

        <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-5 py-6 sm:px-8">

          <Link

            href="/rent"

            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870]"

          >

            <ArrowLeft size={15} />

            Rent

          </Link>



          <div className="mt-8 rounded-[24px] border border-[#E3DFD7] bg-white px-6 py-16 text-center">

            <h1 className="text-[18px] font-bold text-[#202540]">

              Rental item unavailable

            </h1>



            <p className="mt-2 text-[11px] text-[#858796]">

              {error}

            </p>

          </div>

        </div>

      </main>

    );

  }



  if (!item) return null;



  const ownerName = owner?.full_name || "Campus student";

  const ownerInitial = ownerName.charAt(0).toUpperCase();



  return (

    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">

      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8">

        {/* TOP BAR */}

        <div className="mb-4 sm:mb-6">

          <Link

            href="/rent"

            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870] transition hover:border-[#CFC5F4] hover:text-[#6546D9]"

          >

            <ArrowLeft size={15} strokeWidth={1.8} />

            Rent

          </Link>

        </div>



        {/* MAIN */}

        <div className="overflow-hidden rounded-[26px] border border-[#E7E5E0] bg-white shadow-[0_8px_35px_rgba(23,35,61,0.06)] lg:grid lg:grid-cols-[1.05fr_0.95fr]">

          {/* IMAGE */}

          <div className="relative aspect-[1/0.9] min-h-[300px] overflow-hidden bg-[#EDEBF0] sm:aspect-[1.2/1] lg:aspect-auto lg:min-h-[680px]">

            {item.image_url ? (

              <img

                src={item.image_url}

                alt={item.title}

                className="absolute inset-0 h-full w-full object-cover"

              />

            ) : (

              <div className="flex h-full items-center justify-center bg-[#E8E5DC] text-[12px] font-semibold text-[#777A8B]">

                <div className="text-center">

                  <Package

                    size={30}

                    className="mx-auto mb-2 text-[#8A8D9A]"

                  />

                  No image available

                </div>

              </div>

            )}



            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#17233D] shadow-sm backdrop-blur-sm">

              {getCategoryLabel(item.category)}

            </span>



            <div className="absolute bottom-4 left-4 rounded-[14px] bg-[#20265F]/92 px-4 py-3 text-white shadow-sm backdrop-blur-sm">

              <p className="text-[9px] font-medium text-[#D9D7EE]">

                Rental price

              </p>



              <p className="mt-0.5 text-[22px] font-extrabold tracking-[-0.03em]">

                ₹{Number(item.daily_rent).toLocaleString("en-IN")}

                <span className="ml-1 text-[11px] font-semibold text-[#D9D7EE]">

                  / day

                </span>

              </p>

            </div>

          </div>



          {/* DETAILS */}

          <div className="flex flex-col p-5 sm:p-7 lg:p-9">

            <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#6546D9]">

              Campus rental

            </p>



            <h1 className="mt-2 text-[25px] font-extrabold leading-[1.12] tracking-[-0.04em] text-[#17233D] sm:text-[30px]">

              {item.title}

            </h1>



            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-[#737C8F]">

              <MapPin

                size={14}

                className="text-[#6546D9]"

                strokeWidth={1.8}

              />



              <span>{item.location}</span>



              <span className="text-[#D2D4D9]">•</span>



              <span>{getPostedAgo(item.created_at)}</span>

            </div>



            <span className="mt-4 w-fit rounded-full border border-[#D9E7DF] bg-[#F0F8F4] px-3 py-1.5 text-[11px] font-bold text-[#39735A]">

              {getConditionLabel(item.condition)}

            </span>



            <div className="my-6 h-px bg-[#ECECE8]" />



            {/* DESCRIPTION */}

            <section>

              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">

                Description

              </h2>



              <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-6 text-[#697286]">

                {item.description}

              </p>

            </section>



            <div className="my-6 h-px bg-[#ECECE8]" />



            {/* OWNER */}

            <section>

              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">

                Owner

              </h2>



              <div className="flex items-center gap-3 rounded-2xl border border-[#E8E8E5] bg-[#FAFAF8] p-3.5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8E3FF] text-[14px] font-extrabold text-[#6546D9]">

                  {ownerInitial}

                </div>



                <div className="min-w-0">

                  <div className="flex items-center gap-1.5">

                    <p className="truncate text-[13px] font-bold text-[#17233D]">

                      {ownerName}

                    </p>



                    <BadgeCheck

                      size={14}

                      className="shrink-0 text-[#6546D9]"

                      strokeWidth={2}

                    />

                  </div>



                  <p className="mt-1 text-[10px] text-[#9298A4]">

                    CampusLoop rental owner

                  </p>

                </div>

              </div>

            </section>



            <div className="my-6 h-px bg-[#ECECE8]" />



            {/* RENTAL DATES */}

            <section>

              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">

                Choose rental dates

              </h2>



              <div className="mt-3 grid grid-cols-2 gap-3">

                <label className="block">

                  <span className="mb-1.5 block text-[10px] font-bold text-[#777A8B]">

                    Start date

                  </span>



                  <div className="relative">

                    <CalendarDays

                      size={14}

                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6546D9]"

                    />



                    <input

                      type="date"

                      min={today}

                      value={startDate}

                      onChange={(event) =>

                        handleStartDateChange(event.target.value)

                      }

                      className="h-11 w-full rounded-[13px] border border-[#E0DDD6] bg-white pl-9 pr-2 text-[11px] font-semibold text-[#35394E] outline-none transition focus:border-[#BEB4F5] focus:ring-2 focus:ring-[#EEE9FF]"

                    />

                  </div>

                </label>



                <label className="block">

                  <span className="mb-1.5 block text-[10px] font-bold text-[#777A8B]">

                    End date

                  </span>



                  <div className="relative">

                    <CalendarDays

                      size={14}

                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6546D9]"

                    />



                    <input

                      type="date"

                      min={startDate || today}

                      value={endDate}

                      onChange={(event) =>

                        handleEndDateChange(event.target.value)

                      }

                      className="h-11 w-full rounded-[13px] border border-[#E0DDD6] bg-white pl-9 pr-2 text-[11px] font-semibold text-[#35394E] outline-none transition focus:border-[#BEB4F5] focus:ring-2 focus:ring-[#EEE9FF]"

                    />

                  </div>

                </label>

              </div>

            </section>



            {/* PRICE BREAKDOWN */}

            <div className="mt-4 rounded-[18px] border border-[#E5E1D9] bg-[#FAF8F3] p-4">

              <div className="flex items-center justify-between text-[11px] text-[#707486]">

                <span>

                  ₹{Number(item.daily_rent).toLocaleString("en-IN")} ×{" "}

                  {rentalDays || 0}{" "}

                  {rentalDays === 1 ? "day" : "days"}

                </span>



                <span className="font-bold text-[#303448]">

                  ₹{totalRent.toLocaleString("en-IN")}

                </span>

              </div>



              <div className="mt-2 flex items-center justify-between text-[11px] text-[#707486]">

                <span>Refundable deposit</span>



                <span className="font-bold text-[#303448]">

                  ₹{deposit.toLocaleString("en-IN")}

                </span>

              </div>



              <div className="my-3 h-px bg-[#E5E1D9]" />



              <div className="flex items-center justify-between">

                <span className="text-[12px] font-extrabold text-[#17233D]">

                  Total

                </span>



                <span className="text-[18px] font-extrabold tracking-[-0.02em] text-[#6546D9]">

                  ₹{totalAmount.toLocaleString("en-IN")}

                </span>

              </div>

            </div>



            {/* ERROR */}

            {error && (

              <div className="mt-4 rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-3.5 py-3 text-[11px] leading-5 text-[#A33A3A]">

                {error}

              </div>

            )}



            {/* SUCCESS */}

            {success ? (
              <div className="mt-5 rounded-[18px] border border-[#CDE8D9] bg-[#F1FAF5] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#3C8660]"
                  />

                  <div>
                    <p className="text-[12px] font-extrabold text-[#2E684B]">
                      Rental request sent
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-[#5D796B]">
                      The owner has received your request. Chat with them to
                      arrange the pickup time and campus meeting point.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Link
                    href={rentConversationId
                      ? `/chat?type=rent&conversation=${rentConversationId}`
                      : "/chat"}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-[13px] bg-[#6546D9] px-4 text-[10px] font-bold text-white shadow-[0_7px_18px_rgba(101,70,217,0.18)]"
                  >
                    <MessageCircle size={14} />
                    Chat with owner
                  </Link>

                  <Link
                    href="/rent/my-rentals"
                    className="flex h-11 items-center justify-center rounded-[13px] border border-[#DCD8D0] bg-white px-4 text-[10px] font-bold text-[#525665]"
                  >
                    My rentals
                  </Link>
                </div>

                <Link
                  href="/rent"
                  className="mt-3 inline-flex text-[10px] font-semibold text-[#6B6E7C] hover:text-[#5D48D2]"
                >
                  Back to rentals
                </Link>
              </div>            ) : (

              <button

                type="button"

                onClick={handleRequestRental}

                disabled={submitting || rentalDays < 1}

                className="mt-5 w-full rounded-2xl bg-[#6546D9] py-3.5 text-[13px] font-extrabold text-white shadow-[0_8px_22px_rgba(101,70,217,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#5839C8] disabled:cursor-not-allowed disabled:opacity-50"

              >

                {submitting ? "Sending request..." : "Request to rent"}

              </button>

            )}



            <p className="mt-2.5 text-center text-[10px] font-medium leading-4 text-[#969BA6]">

              The deposit is refundable after the item is returned according to

              the rental agreement.

            </p>

          </div>

        </div>

      </div>

    </main>

  );

}