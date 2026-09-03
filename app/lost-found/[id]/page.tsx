"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Report = {
  id: string;
  title: string;
  description: string;
  type: "lost" | "found";
  category: string;
  location: string;
  specific_area: string | null;
  date_reported: string;
  approximate_time: string | null;
  image_url: string | null;
  status: "active" | "claimed" | "returned";
  created_at: string;
};

export default function LostFoundDetailPage() {
  const params = useParams();
 
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadReport() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("lost_found_reports")
          .select(
            `
              id,
              title,
              description,
              type,
              category,
              location,
              specific_area,
              date_reported,
              approximate_time,
              image_url,
              status,
              created_at
            `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Lost & Found detail error:", error);
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        setReport(data as Report);
      } catch (error) {
        console.error("Unexpected detail page error:", error);
        setErrorMessage("Something went wrong while loading this report.");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [id]);

  function formatDate(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /* LOADING */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#4E3439]">
        <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 py-7 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075]"
            >
              <ArrowLeft size={16} />
              Back to Lost &amp; Found
            </Link>

            <div className="mt-7 overflow-hidden rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9]">
              <div className="h-[280px] animate-pulse bg-[#E8E9DC]" />

              <div className="space-y-5 p-7">
                <div className="h-4 w-20 animate-pulse rounded bg-[#E8E4DB]" />
                <div className="h-9 w-48 animate-pulse rounded bg-[#E8E4DB]" />
                <div className="h-5 w-28 animate-pulse rounded bg-[#E8E4DB]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ERROR / NOT FOUND */
  if (!report) {
    return (
      <main className="min-h-screen bg-[#4E3439]">
        <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 py-7 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075]"
            >
              <ArrowLeft size={16} />
              Back to Lost &amp; Found
            </Link>

            <div className="mt-12 rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5D48D2]">
                <CheckCircle2 size={25} />
              </div>

              <h1 className="mt-5 text-[22px] font-bold text-[#172044]">
                Report not found
              </h1>

              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-[#6D7184]">
                {errorMessage ||
                  "This Lost & Found report could not be loaded."}
              </p>

              <Link
                href="/lost-found"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-[14px] bg-[#23265B] px-6 text-[12px] font-bold text-white"
              >
                Back to Lost &amp; Found
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isLost = report.type === "lost";

  const isUnavailable =
    report.status === "claimed" || report.status === "returned";

  return (
    <main className="min-h-screen bg-[#4E3439] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 pb-12 pt-6 sm:px-8">
        <div className="mx-auto max-w-3xl">

          {/* BACK */}
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]"
          >
            <ArrowLeft size={16} />
            Back to Lost &amp; Found
          </Link>

          {/* CARD */}
          <div className="mt-7 overflow-hidden rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] shadow-[0_8px_30px_rgba(23,32,68,0.05)]">

            {/* IMAGE */}
            <div className="relative flex h-[250px] w-full items-center justify-center bg-[#E8E9DC] sm:h-[320px]">

              {report.image_url ? (
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[13px] font-medium text-[#68705F]">
                  No photo
                </span>
              )}

              {/* TYPE */}
              <span
                className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  isLost
                    ? "bg-[#EEE9FF] text-[#5D48D2]"
                    : "bg-[#E4F5EA] text-[#287A47]"
                }`}
              >
                {report.type}
              </span>

              {/* STATUS */}
              {isUnavailable && (
                <span className="absolute right-4 top-4 rounded-full bg-[#23265B] px-3 py-1 text-[10px] font-bold text-white">
                  {report.status === "claimed" ? "Claimed" : "Returned"}
                </span>
              )}
            </div>

            {/* CONTENT */}
            <div className="p-6 sm:p-8">

              {/* TITLE */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6952D7]">
                  {report.type} item
                </p>

                <h1 className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-[#172044] sm:text-[38px]">
                  {report.title}
                </h1>

                <p className="mt-1 text-[13px] font-medium text-[#6952D7]">
                  {report.category}
                </p>
              </div>

              {/* INFO */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                {/* LOCATION */}
                <div className="rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] p-4">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-[#6952D7]"
                    />

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#777B8B]">
                        Location
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#172044]">
                        {report.location}
                      </p>

                      {report.specific_area && (
                        <p className="mt-1 text-[11px] text-[#777B8B]">
                          {report.specific_area}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* DATE */}
                <div className="rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] p-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={19}
                      className="mt-0.5 shrink-0 text-[#6952D7]"
                    />

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#777B8B]">
                        Date reported
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#172044]">
                        {formatDate(report.date_reported)}
                      </p>

                      {report.approximate_time && (
                        <p className="mt-1 text-[11px] text-[#777B8B]">
                          Around {report.approximate_time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-7 border-t border-[#E8E4DB] pt-7">
                <h2 className="text-[15px] font-bold text-[#172044]">
                  Description
                </h2>

                <div className="mt-3 rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] p-4">
                  <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#596075]">
                    {report.description}
                  </p>
                </div>
              </div>

              {/* VERIFICATION */}
              {!isUnavailable && (
                <div className="mt-6 rounded-[18px] border border-[#DDD6FF] bg-[#F6F3FF] p-4 sm:p-5">
                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <h3 className="text-[13px] font-bold text-[#172044]">
                        Safe handover verification
                      </h3>

                      <p className="mt-1 text-[11px] leading-5 text-[#68708A]">
                        If this is your item, submit a claim with details only
                        the real owner would know. A verification code will be
                        used before the item is handed over.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="mt-7">

                {!isUnavailable ? (
                  <Link
  href={`/lost-found/${report.id}/claim`}
  className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#23265B] px-5 text-[13px] font-bold text-white no-underline transition hover:bg-[#1D204F]"
>
  {isLost ? "This is my item" : "I think this is mine"}
</Link>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "48px",
                      minHeight: "48px",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "14px",
                      backgroundColor: "#E9E7E1",
                      color: "#777B8B",
                      fontSize: "13px",
                      fontWeight: "700",
                      boxSizing: "border-box",
                    }}
                  >
                    This item is no longer available
                  </div>
                )}

                <Link
                  href="/lost-found"
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "48px",
                    minHeight: "48px",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "12px",
                    padding: "0 20px",
                    border: "1px solid #DEDAD1",
                    borderRadius: "14px",
                    backgroundColor: "#FFFDF9",
                    color: "#4F5366",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: "48px",
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  Back to Lost &amp; Found
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}