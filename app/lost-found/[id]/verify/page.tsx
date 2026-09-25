"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ClaimStatus = "pending" | "approved" | "rejected" | "completed";

type Claim = {
  id: string;
  report_id: string;
  claimant_id: string;
  status: ClaimStatus;
};

type Report = {
  id: string;
  title: string;
  image_url: string | null;
  reported_by: string;
  status: "active" | "claimed" | "returned";
  category: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

type VerificationStatus = {
  reporter_confirmed: boolean;
  claimant_confirmed: boolean;
  verified_at: string | null;
};

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(false);

  const isReporter =
    !!userId &&
    !!report &&
    userId === report.reported_by;

  const isClaimant =
    !!userId &&
    !!claim &&
    userId === claim.claimant_id;

  async function loadVerificationStatus(claimId: string) {
    const { data, error: statusError } = await supabase.rpc(
      "get_lost_found_verification_status",
      {
        p_claim_id: claimId,
      }
    );

    if (statusError) {
      throw new Error(statusError.message);
    }

    const status = data?.[0];

    if (!status) {
      throw new Error("Verification record could not be found.");
    }

    setVerificationStatus({
      reporter_confirmed: status.reporter_confirmed,
      claimant_confirmed: status.claimant_confirmed,
      verified_at: status.verified_at,
    });

    return status;
  }

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(
          `/login?redirect=/lost-found/${reportId}/verify`
        );
        return;
      }

      setUserId(user.id);

      const { data: reportData, error: reportError } = await supabase
        .from("lost_found_reports")
        .select(
          "id, title, image_url, reported_by, status, category"
        )
        .eq("id", reportId)
        .single();

      if (reportError || !reportData) {
        throw new Error("This Lost & Found report could not be found.");
      }

      const reportRecord = reportData as Report;
      setReport(reportRecord);

      const { data: claimData, error: claimError } = await supabase
        .from("lost_found_claims")
        .select("id, report_id, claimant_id, status")
        .eq("report_id", reportId)
        .in("status", ["approved", "completed"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (claimError) {
        throw new Error(claimError.message);
      }

      if (!claimData) {
        throw new Error(
          "There is no approved claim for this item."
        );
      }

      const claimRecord = claimData as Claim;
      setClaim(claimRecord);

      const partnerId =
        user.id === reportRecord.reported_by
          ? claimRecord.claimant_id
          : reportRecord.reported_by;

      const { data: partnerData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", partnerId)
        .maybeSingle();

      setPartner((partnerData as Profile | null) ?? null);

      // Reporter gets the actual code.
      if (user.id === reportRecord.reported_by) {
        const {
          data: reporterVerification,
          error: reporterVerificationError,
        } = await supabase.rpc(
          "get_lost_found_verification_for_reporter",
          {
            p_claim_id: claimRecord.id,
          }
        );

        if (reporterVerificationError) {
          throw new Error(
            reporterVerificationError.message
          );
        }

        const verification = reporterVerification?.[0];

        if (!verification) {
          throw new Error(
            "Verification record could not be found."
          );
        }

        setVerificationCode(verification.verification_code);

        setVerificationStatus({
          reporter_confirmed: verification.reporter_confirmed,
          claimant_confirmed: verification.claimant_confirmed,
          verified_at: verification.verified_at,
        });
      } else {
        // Claimant only gets verification status.
        await loadVerificationStatus(claimRecord.id);
      }
    } catch (error) {
      console.error("Secure handover error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not load secure handover."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!reportId) return;

    loadPage();
  }, [reportId]);

  // Keep the reporter screen updated when claimant enters the code.
  useEffect(() => {
    if (!claim || !isReporter || completed) return;

    const interval = window.setInterval(async () => {
      try {
        await loadVerificationStatus(claim.id);
      } catch {
        // Keep the current UI state if a background refresh fails.
      }
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [claim, isReporter, completed]);

  // Keep the claimant screen updated as well.
  useEffect(() => {
    if (!claim || !isClaimant || completed) return;

    const interval = window.setInterval(async () => {
      try {
        await loadVerificationStatus(claim.id);
      } catch {
        // Ignore temporary background refresh errors.
      }
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [claim, isClaimant, completed]);

  async function verifyCode() {
    if (!claim) return;

    const code = codeInput.trim().toUpperCase();

    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const { data, error: verifyError } =
        await supabase.rpc("verify_lost_found_claim", {
          p_claim_id: claim.id,
          p_code: code,
        });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      if (!data) {
        throw new Error("The verification code could not be confirmed.");
      }

      await loadVerificationStatus(claim.id);
      setCodeInput("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not verify the code."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function completeHandover() {
    if (!claim) return;

    setActionLoading(true);
    setError("");

    try {
      const { data, error: completeError } =
        await supabase.rpc(
          "complete_lost_found_handover",
          {
            p_claim_id: claim.id,
          }
        );

      if (completeError) {
        throw new Error(completeError.message);
      }

      if (!data) {
        throw new Error("Could not complete the handover.");
      }

      setCompleted(true);

      await loadVerificationStatus(claim.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not complete the handover."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(verificationCode);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FBF9F4] px-5 py-8">
          <div className="flex min-h-[75vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
              <p className="mt-4 text-[11px] font-semibold text-[#777A8B]">
                Loading secure handover...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!report || !claim) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FBF9F4] px-5 py-7">
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#596075]"
          >
            <ArrowLeft size={15} />
            Back to Lost &amp; Found
          </Link>

          <div className="mt-10 rounded-[20px] border border-[#F0CACA] bg-[#FFF4F4] p-5">
            <p className="text-[13px] font-bold text-[#9F3939]">
              Secure handover unavailable
            </p>

            <p className="mt-2 text-[11px] leading-5 text-[#A85B5B]">
              {error || "The approved claim could not be loaded."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const claimantVerified =
    verificationStatus?.claimant_confirmed ?? false;

  const handoverCompleted =
    verificationStatus?.reporter_confirmed &&
    verificationStatus?.claimant_confirmed;

  /*
   * FINAL SUCCESS STATE
   */
  if (completed || handoverCompleted) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FBF9F4] px-5 pb-10">
          <div className="pt-6">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#596075]"
            >
              <ArrowLeft size={15} />
              Back to chat
            </Link>
          </div>

          <div className="mt-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#E4F5EA] text-[#287A47]">
              <CheckCircle2 size={38} strokeWidth={2} />
            </div>

            <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.24em] text-[#6952D7]">
              Handover completed
            </p>

            <h1 className="mt-2 text-[30px] font-bold tracking-[-0.055em]">
              Item returned.
            </h1>

            <p className="mx-auto mt-2 max-w-[290px] text-[12px] leading-5 text-[#6D7184]">
              {report.title} has been successfully handed over to its owner.
            </p>
          </div>

          <div className="mt-8 rounded-[20px] border border-[#D7EBDD] bg-[#F2FBF4] p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DDF1E2] text-[#287A47]">
                  <Check size={15} />
                </div>
                <p className="text-[11px] font-semibold text-[#365642]">
                  Claim approved
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DDF1E2] text-[#287A47]">
                  <Check size={15} />
                </div>
                <p className="text-[11px] font-semibold text-[#365642]">
                  Claimant verified
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DDF1E2] text-[#287A47]">
                  <Check size={15} />
                </div>
                <p className="text-[11px] font-semibold text-[#365642]">
                  Handover confirmed
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/chat"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-[14px] bg-[#23265B] text-[12px] font-bold text-white"
          >
            Back to chat
          </Link>

          <Link
            href="/lost-found"
            className="mt-3 flex h-12 w-full items-center justify-center rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] text-[12px] font-semibold text-[#4F5366]"
          >
            Go to Lost &amp; Found
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FBF9F4] px-5 pb-24">
        {/* HEADER */}
        <div className="pt-6">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#596075]"
          >
            <ArrowLeft size={15} />
            Back to chat
          </Link>
        </div>

        {/* TITLE */}
        <section className="mt-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">
            Secure handover
          </p>

          <h1 className="mt-2 text-[30px] font-bold leading-[1.05] tracking-[-0.055em]">
            {isReporter
              ? "Handover this item"
              : "Verify and receive item"}
          </h1>

          <p className="mt-2.5 text-[12px] leading-5 text-[#6D7184]">
            {isReporter
              ? `Show the verification code to ${
                  partner?.full_name || "the claimant"
                } when you meet on campus.`
              : "Ask the person holding the item for their CampusLoop verification code."}
          </p>
        </section>

        {/* ITEM CARD */}
        <section className="mt-6 rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#E9EBDD]">
              {report.image_url ? (
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PackageCheck
                  size={21}
                  className="text-[#6952D7]"
                />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[14px] font-bold text-[#172044]">
                {report.title}
              </h2>

              <p className="mt-1 text-[10px] text-[#777A8B]">
                {report.category}
              </p>

              <div className="mt-2 inline-flex rounded-full bg-[#EAF6ED] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#287A47]">
                Claim approved
              </div>
            </div>
          </div>
        </section>

        {/* PROGRESS */}
        <section className="mt-4 rounded-[20px] border border-[#DDD6FF] bg-[#F6F3FF] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-[12px] font-bold text-[#172044]">
                Safe handover
              </p>
              <p className="mt-0.5 text-[10px] text-[#68708A]">
                Verify before the item changes hands.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6952D7] text-white">
                <Check size={13} />
              </div>
              <p className="text-[10.5px] font-semibold text-[#3D4160]">
                Claim approved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  claimantVerified
                    ? "bg-[#287A47] text-white"
                    : "border border-[#9A91CE] bg-white text-[#6952D7]"
                }`}
              >
                {claimantVerified ? (
                  <Check size={13} />
                ) : (
                  <span className="text-[10px] font-bold">2</span>
                )}
              </div>

              <p
                className={`text-[10.5px] font-semibold ${
                  claimantVerified
                    ? "text-[#287A47]"
                    : "text-[#3D4160]"
                }`}
              >
                {claimantVerified
                  ? "Claimant verified"
                  : "Verify the item"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  verificationStatus?.reporter_confirmed
                    ? "bg-[#287A47] text-white"
                    : "border border-[#D7D2E8] bg-white text-[#858796]"
                }`}
              >
                {verificationStatus?.reporter_confirmed ? (
                  <Check size={13} />
                ) : (
                  <span className="text-[10px] font-bold">3</span>
                )}
              </div>

              <p className="text-[10.5px] font-semibold text-[#3D4160]">
                Confirm handover
              </p>
            </div>
          </div>
        </section>

        {/* REPORTER VIEW */}
        {isReporter && (
          <>
            <section className="mt-4 rounded-[20px] border border-[#DDD6FF] bg-[#F3F0FF] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#E8E1FF] text-[#5D48D2]">
                  <KeyRound size={18} />
                </div>

                <div>
                  <h2 className="text-[13px] font-bold text-[#172044]">
                    Verification code
                  </h2>

                  <p className="mt-1 text-[10.5px] leading-5 text-[#68708A]">
                    Show this code to the claimant when you meet.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[16px] bg-white p-4 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#858796]">
                  Your code
                </p>

                <p className="mt-2 font-mono text-[24px] font-bold tracking-[0.14em] text-[#292B68]">
                  {verificationCode}
                </p>

                <button
                  type="button"
                  onClick={copyCode}
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#5D48D2]"
                >
                  <Copy size={13} />
                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>
            </section>

            {claimantVerified ? (
              <section className="mt-4 rounded-[18px] border border-[#CFE8D6] bg-[#EFFAF2] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DDF1E2] text-[#287A47]">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-[12px] font-bold text-[#287A47]">
                      Claimant verified
                    </p>

                    <p className="mt-1 text-[10.5px] leading-5 text-[#5E7C67]">
                      The claimant entered the correct code. Confirm the item
                      handover once you have physically handed it over.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={completeHandover}
                  disabled={actionLoading}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#23265B] text-[12px] font-bold text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  {actionLoading
                    ? "Completing..."
                    : "Confirm item handed over"}
                </button>
              </section>
            ) : (
              <section className="mt-4 rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] p-4">
                <p className="text-center text-[10.5px] leading-5 text-[#777A8B]">
                  Waiting for the claimant to verify the code...
                </p>

                <div className="mx-auto mt-3 h-2 max-w-[180px] overflow-hidden rounded-full bg-[#E8E4F2]">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-[#6952D7]" />
                </div>
              </section>
            )}
          </>
        )}

        {/* CLAIMANT VIEW */}
        {isClaimant && !isReporter && (
          <>
            {!claimantVerified ? (
              <section className="mt-4 rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[#5D48D2]">
                    <KeyRound size={18} />
                  </div>

                  <div>
                    <h2 className="text-[13px] font-bold text-[#172044]">
                      Enter verification code
                    </h2>

                    <p className="mt-1 text-[10.5px] leading-5 text-[#6D7184]">
                      Ask the person holding the item to show you their
                      CampusLoop code.
                    </p>
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-[#777A8B]">
                    Verification code
                  </span>

                  <input
                    value={codeInput}
                    onChange={(event) =>
                      setCodeInput(
                        event.target.value.toUpperCase()
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        verifyCode();
                      }
                    }}
                    placeholder="CL-XXXXXXXX"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    className="h-13 w-full rounded-[14px] border border-[#DCD6F1] bg-[#FBF9FF] px-4 font-mono text-[18px] tracking-[0.12em] text-[#292B68] outline-none placeholder:text-[#B2AFC2] focus:border-[#8C7BDD] focus:ring-2 focus:ring-[#6952D7]/10"
                  />
                </label>

                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={
                    actionLoading || !codeInput.trim()
                  }
                  className="mt-3 flex h-12 w-full items-center justify-center rounded-[14px] bg-[#23265B] text-[12px] font-bold text-white disabled:opacity-40"
                >
                  {actionLoading
                    ? "Checking..."
                    : "Verify code"}
                </button>
              </section>
            ) : (
              <section className="mt-4 rounded-[20px] border border-[#CFE8D6] bg-[#EFFAF2] p-5">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#DDF1E2] text-[#287A47]">
                    <CheckCircle2 size={28} />
                  </div>

                  <h2 className="mt-4 text-[18px] font-bold text-[#287A47]">
                    Claimant verified!
                  </h2>

                  <p className="mx-auto mt-2 max-w-[260px] text-[11px] leading-5 text-[#5E7C67]">
                    The code matches. The person who reported the item can now
                    confirm the handover.
                  </p>
                </div>

                <Link
                  href="/chat"
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-[13px] border border-[#C8DED0] bg-white text-[11px] font-bold text-[#287A47]"
                >
                  Back to chat
                </Link>
              </section>
            )}
          </>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3">
            <p className="text-[11px] leading-5 text-[#A33A3A]">
              {error}
            </p>
          </div>
        )}

        {/* SAFETY NOTE */}
        <div className="mt-5 flex items-start gap-2.5 rounded-[16px] border border-[#E5DFD2] bg-[#FFF9E9] p-3.5">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-[#B27716]"
          />

          <p className="text-[10px] leading-5 text-[#78653F]">
            Meet in a safe campus location. Never post your verification code
            publicly or send it in the chat.
          </p>
        </div>
      </div>
    </main>
  );
}