"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReportStatus = "active" | "claimed" | "returned" | string;
type ClaimStatus = "pending" | "approved" | "rejected" | "completed";

type Report = {
  id: string;
  title: string;
  description: string | null;
  type: "lost" | "found";
  category: string;
  location: string;
  specific_area: string | null;
  date_reported: string;
  approximate_time: string | null;
  image_url: string | null;
  status: ReportStatus;
  created_at: string;
};

type Claim = {
  id: string;
  report_id: string;
  claimant_id: string;
  identifying_details: string | null;
  status: ClaimStatus;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function MyReportsPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reports, setReports] = useState<Report[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [actionError, setActionError] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [justApproved, setJustApproved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        router.replace("/login?redirect=/lost-found/my-reports");
        return;
      }

      setCheckingAuth(false);
      await fetchData(user.id);
    }

    async function fetchData(userId: string) {
      setLoading(true);
      setError("");

      const { data: reportsData, error: reportsError } = await supabase
        .from("lost_found_reports")
        .select(
          "id, title, description, type, category, location, specific_area, date_reported, approximate_time, image_url, status, created_at"
        )
        .eq("reported_by", userId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (reportsError) {
        setError(reportsError.message);
        setLoading(false);
        return;
      }

      const reportList = (reportsData ?? []) as Report[];
      setReports(reportList);

      if (reportList.length === 0) {
        setClaims([]);
        setLoading(false);
        return;
      }

      const reportIds = reportList.map((r) => r.id);

      const { data: claimsData, error: claimsError } = await supabase
        .from("lost_found_claims")
        .select(
          "id, report_id, claimant_id, identifying_details, status, created_at, updated_at"
        )
        .in("report_id", reportIds)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (claimsError) {
        setError(claimsError.message);
        setLoading(false);
        return;
      }

      const claimList = (claimsData ?? []) as Claim[];
      setClaims(claimList);

      const claimantIds = Array.from(
        new Set(claimList.map((c) => c.claimant_id))
      );

      if (claimantIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", claimantIds);

        if (!isMounted) return;

        if (!profilesError && profilesData) {
          const map: Record<string, Profile> = {};
          (profilesData as Profile[]).forEach((p) => {
            map[p.id] = p;
          });
          setProfiles(map);
        }
      }

      setLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [supabase, router]);

  const claimsByReport = useMemo(() => {
    const map: Record<string, Claim[]> = {};
    claims.forEach((claim) => {
      if (!map[claim.report_id]) map[claim.report_id] = [];
      map[claim.report_id].push(claim);
    });
    return map;
  }, [claims]);

  function formatTime(date: string) {
    const created = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  async function handleReject(claim: Claim) {
    const key = claim.id;
    setActionError((prev) => ({ ...prev, [key]: "" }));
    setActionLoading((prev) => ({ ...prev, [key]: true }));

    const { error: updateError } = await supabase
      .from("lost_found_claims")
      .update({ status: "rejected" })
      .eq("id", claim.id);

    setActionLoading((prev) => ({ ...prev, [key]: false }));

    if (updateError) {
      setActionError((prev) => ({ ...prev, [key]: updateError.message }));
      return;
    }

    setClaims((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, status: "rejected" } : c))
    );
  }

  async function handleApprove(claim: Claim, report: Report) {
    const key = claim.id;

    if (report.status === "claimed" || report.status === "returned") {
      setActionError((prev) => ({
        ...prev,
        [key]: "This report has already been resolved.",
      }));
      return;
    }

    setActionError((prev) => ({ ...prev, [key]: "" }));
    setActionLoading((prev) => ({ ...prev, [key]: true }));

    const { error: claimUpdateError } = await supabase
      .from("lost_found_claims")
      .update({ status: "approved" })
      .eq("id", claim.id);

    if (claimUpdateError) {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
      setActionError((prev) => ({ ...prev, [key]: claimUpdateError.message }));
      return;
    }

    const { error: reportUpdateError } = await supabase
      .from("lost_found_reports")
      .update({ status: "claimed" })
      .eq("id", report.id);

    setActionLoading((prev) => ({ ...prev, [key]: false }));

    if (reportUpdateError) {
      setActionError((prev) => ({
        ...prev,
        [key]: `Claim approved, but could not update report status: ${reportUpdateError.message}`,
      }));
      // still reflect the claim approval locally
      setClaims((prev) =>
        prev.map((c) => (c.id === claim.id ? { ...c, status: "approved" } : c))
      );
      return;
    }

    setClaims((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, status: "approved" } : c))
    );
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: "claimed" } : r))
    );
    setJustApproved((prev) => ({ ...prev, [claim.id]: true }));
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-12">
          <p className="text-sm text-[#77768A]">Checking your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-24">
        <div className="mx-auto max-w-5xl">

          {/* HERO PANEL */}
          <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-8 pt-9 text-white sm:px-8 sm:pb-10 sm:pt-11">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#C2661A]/25 blur-3xl"
            />

            <Link
              href="/lost-found"
              className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C8C6E0] hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Lost &amp; Found
            </Link>

            <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#F3C89A]">
              Lost &amp; Found
            </p>

            <h1 className="relative mt-2 text-[28px] font-bold tracking-[-0.05em] sm:text-[36px]">
              My Lost &amp; Found
            </h1>

            <p className="relative mt-2 max-w-md text-[12.5px] leading-5 text-[#C8C6E0]">
              Manage reports and review claim requests.
            </p>
          </section>

          <div className="px-5 pt-6 sm:px-8">

            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[220px] items-center justify-center rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9]">
                <div className="text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
                  <p className="mt-4 text-[12px] font-semibold text-[#172044]">
                    Loading your reports...
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-[20px] border border-[#F0CACA] bg-[#FFF4F4] p-6">
                <p className="text-[13px] font-bold text-[#9F3939]">
                  Could not load your reports
                </p>
                <p className="mt-2 break-words text-[11px] leading-5 text-[#A85B5B]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-[12px] bg-[#292B68] px-4 py-2 text-[11px] font-bold text-white"
                >
                  Try again
                </button>
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && reports.length === 0 && (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                  <ShieldAlert size={19} />
                </div>
                <h2 className="mt-4 text-[14px] font-bold">
                  You haven&apos;t posted any Lost &amp; Found reports yet.
                </h2>
                <Link
                  href="/lost-found/report"
                  className="mt-4 rounded-[12px] bg-[#292B68] px-4 py-2 text-[11px] font-bold text-white"
                >
                  Report an item
                </Link>
              </div>
            )}

            {/* REPORTS */}
            {!loading && !error && reports.length > 0 && (
              <div className="space-y-4">
                {reports.map((report) => {
                  const reportClaims = claimsByReport[report.id] ?? [];

                  return (
                    <div
                      key={report.id}
                      className="overflow-hidden rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] shadow-[0_5px_20px_rgba(23,32,68,0.04)]"
                    >
                      {/* REPORT CARD */}
                      <div className="flex gap-3.5 p-4 sm:p-5">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-[#E9EBDD]">
                          {report.image_url ? (
                            <Image
                              src={report.image_url}
                              alt={report.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] text-[#72758A]">
                              No photo
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] ${
                                report.type === "lost"
                                  ? "bg-[#EEE9FF] text-[#5D48D2]"
                                  : "bg-[#FFE9D6] text-[#C2661A]"
                              }`}
                            >
                              {report.type}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] ${
                                report.status === "claimed"
                                  ? "bg-[#EAF6ED] text-[#287A47]"
                                  : report.status === "returned"
                                  ? "bg-[#E9EBF5] text-[#4B5188]"
                                  : "bg-[#F1EFE7] text-[#6D7184]"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>

                          <h3 className="mt-1.5 truncate text-[14px] font-bold text-[#172044]">
                            {report.title}
                          </h3>

                          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-[#6D7184]">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-semibold text-[#5D48D2]">
                            <Users size={12} />
                            {reportClaims.length}{" "}
                            {reportClaims.length === 1 ? "claim" : "claims"}
                          </div>
                        </div>
                      </div>

                      {/* INCOMING CLAIMS */}
                      {reportClaims.length > 0 && (
                        <div className="border-t border-[#EEEAE2] bg-[#FAF8F3] p-4 sm:p-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858796]">
                            Incoming claims
                          </p>

                          <div className="mt-3 space-y-3">
                            {reportClaims.map((claim) => {
                              const claimant = profiles[claim.claimant_id];
                              const claimantName =
                                claimant?.full_name || "CampusLoop student";

                              const isPending = claim.status === "pending";
                              const isBusy = !!actionLoading[claim.id];
                              const errMsg = actionError[claim.id];
                              const approvedJustNow = !!justApproved[claim.id];

                              return (
                                <div
                                  key={claim.id}
                                  className="rounded-[16px] border border-[#E5E1D9] bg-white p-4"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[12.5px] font-bold text-[#172044]">
                                        {claimantName}
                                      </p>
                                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#858796]">
                                        <Clock size={10} />
                                        {formatTime(claim.created_at)}
                                      </div>
                                    </div>

                                    <span
                                      className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] ${
                                        claim.status === "approved"
                                          ? "bg-[#EAF6ED] text-[#287A47]"
                                          : claim.status === "rejected"
                                          ? "bg-[#FFF0F0] text-[#A33A3A]"
                                          : claim.status === "completed"
                                          ? "bg-[#E9EBF5] text-[#4B5188]"
                                          : "bg-[#FFF6E5] text-[#A5730F]"
                                      }`}
                                    >
                                      {claim.status}
                                    </span>
                                  </div>

                                  {claim.identifying_details && (
                                    <p className="mt-2.5 text-[11.5px] leading-5 text-[#4A4D63]">
                                      {claim.identifying_details}
                                    </p>
                                  )}

                                  {errMsg && (
                                    <p className="mt-2.5 rounded-[10px] border border-[#F0CACA] bg-[#FFF4F4] px-3 py-2 text-[10.5px] leading-4 text-[#A85B5B]">
                                      {errMsg}
                                    </p>
                                  )}

                                  {isPending && !approvedJustNow && (
                                    <div className="mt-3 flex gap-2">
                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => handleReject(claim)}
                                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-[#F0CACA] bg-white text-[11px] font-bold text-[#A33A3A] transition hover:bg-[#FFF4F4] disabled:opacity-50"
                                      >
                                        <XCircle size={13} />
                                        Reject
                                      </button>

                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => handleApprove(claim, report)}
                                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#292B68] text-[11px] font-bold text-white transition hover:bg-[#202252] disabled:opacity-50"
                                      >
                                        <CheckCircle2 size={13} />
                                        {isBusy ? "Saving..." : "Approve"}
                                      </button>
                                    </div>
                                  )}

                                  {claim.status === "rejected" && (
                                    <p className="mt-3 text-[11px] font-semibold text-[#A33A3A]">
                                      Claim rejected
                                    </p>
                                  )}

                                  {(claim.status === "approved" ||
                                    approvedJustNow) && (
                                    <div className="mt-3">
                                      <p className="text-[11px] font-semibold text-[#287A47]">
                                        Claim approved
                                      </p>
                                      <Link
                                        href="/chat"
                                        className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded-[12px] bg-[#292B68] text-[11px] font-bold text-white"
                                      >
                                        <MessageCircle size={13} />
                                        Open chat
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}