"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, LogIn } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        setIsLoggedIn(!!user);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  function handleLogin() {
    router.push(`/login?redirect=/lost-found/${id}/claim`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!details.trim()) {
      setErrorMessage("Please enter some identifying details.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        setIsLoggedIn(false);
        throw new Error("Please log in before submitting a claim.");
      }

      // Check report
      const { data: report, error: reportError } = await supabase
        .from("lost_found_reports")
        .select("id, status")
        .eq("id", id)
        .single();

      if (reportError || !report) {
        throw new Error(
          "This Lost & Found report could not be found."
        );
      }

      if (report.status !== "active") {
        throw new Error(
          "This item is no longer available for new claims."
        );
      }

      // Submit claim
      const { error: claimError } = await supabase
        .from("lost_found_claims")
        .insert({
          report_id: id,
          claimant_id: user.id,
          identifying_details: details.trim(),
          status: "pending",
        });

      if (claimError) {
        if (claimError.code === "23505") {
          throw new Error(
            "You have already submitted a claim for this item."
          );
        }

        throw new Error(claimError.message);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Claim submission error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your claim."
      );
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // SUCCESS
  // -------------------------

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#4E3439] text-[#172044]">
        <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 py-7 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]"
            >
              <ArrowLeft size={16} />
              Back to Lost &amp; Found
            </Link>

            <div className="mt-16 rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] p-8 text-center shadow-[0_8px_30px_rgba(23,32,68,0.05)] sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E4F5EA] text-[#287A47]">
                <CheckCircle2 size={27} />
              </div>

              <h1 className="mt-5 text-[26px] font-bold tracking-[-0.04em]">
                Claim submitted
              </h1>

              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-[#6D7184]">
                Your claim has been submitted to the person who reported this
                item. They can review your identifying details and continue
                the verification process.
              </p>

              <Link
                href={`/lost-found/${id}`}
                className="mt-7 inline-flex h-11 items-center justify-center rounded-[14px] bg-[#23265B] px-6 text-[12px] font-bold text-white no-underline"
              >
                Back to item
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------
  // LOADING AUTH
  // -------------------------

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#4E3439] text-[#172044]">
        <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 py-7 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mt-20 rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#DDD6FF] border-t-[#5D48D2]" />

              <p className="mt-4 text-[13px] font-medium text-[#6D7184]">
                Checking your account...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------
  // MAIN PAGE
  // -------------------------

  return (
    <main className="min-h-screen bg-[#4E3439] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] px-5 pb-12 pt-6 sm:px-8">
        <div className="mx-auto max-w-2xl">

          {/* BACK */}
          <Link
            href={`/lost-found/${id}`}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]"
          >
            <ArrowLeft size={16} />
            Back to item
          </Link>

          {/* HEADER */}
          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">
              Lost &amp; Found
            </p>

            <h1 className="mt-2 text-[32px] font-bold tracking-[-0.05em] text-[#172044] sm:text-[38px]">
              Claim this item
            </h1>

            <p className="mt-2 max-w-xl text-[13px] leading-5 text-[#6D7184]">
              Tell the person who reported this item something only the real
              owner would know.
            </p>
          </div>

          {/* CARD */}
          <div className="mt-7 rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] p-6 shadow-[0_8px_30px_rgba(23,32,68,0.05)] sm:p-8">

            {/* VERIFICATION INFO */}
            <div className="rounded-[18px] border border-[#DDD6FF] bg-[#F6F3FF] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h2 className="text-[13px] font-bold text-[#172044]">
                    Verification required
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-[#68708A]">
                    Don&apos;t reveal sensitive information. Give identifying
                    details that can help the reporter verify that the item
                    belongs to you.
                  </p>
                </div>
              </div>
            </div>

            {/* NOT LOGGED IN */}
            {!isLoggedIn ? (
              <div className="mt-6 rounded-[18px] border border-[#E3DFD7] bg-[#FAF8F2] p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EEE9FF] text-[#5D48D2]">
                  <LogIn size={21} />
                </div>

                <h2 className="mt-4 text-[16px] font-bold text-[#172044]">
                  Log in to claim this item
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-[#6D7184]">
                  You need a CampusLoop account to submit a claim. Your claim
                  will be linked to your campus account.
                </p>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#23265B] px-6 text-[13px] font-bold text-white transition hover:bg-[#1D204F]"
                >
                  <LogIn size={16} />
                  Log in to CampusLoop
                </button>

                <p className="mt-3 text-[11px] text-[#858796]">
                  After logging in, you&apos;ll return to this claim page.
                </p>
              </div>
            ) : (
              <>
                {/* ERROR */}
                {errorMessage && (
                  <div className="mt-5 rounded-[14px] border border-[#F0C9C9] bg-[#FFF2F2] px-4 py-3">
                    <p className="text-[12px] font-medium leading-5 text-[#A33A3A]">
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="mt-7">

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold text-[#343A56]">
                      Identifying details
                    </span>

                    <textarea
                      required
                      value={details}
                      onChange={(event) => setDetails(event.target.value)}
                      rows={6}
                      disabled={loading}
                      placeholder="For example: mention a sticker, scratch, accessory, contents inside the item, or another detail only the owner would know."
                      className="w-full resize-none rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 py-3 text-[13px] leading-5 text-[#172044] outline-none placeholder:text-[#A0A0A8] focus:border-[#8C7BDD] disabled:opacity-60"
                    />
                  </label>

                  <p className="mt-2 text-[10px] leading-4 text-[#858796]">
                    These details will be shown to the person who reported the
                    item.
                  </p>

                  {/* BUTTONS */}
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">

                    <Link
                      href={`/lost-found/${id}`}
                      className="flex h-12 items-center justify-center rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-6 text-[13px] font-semibold text-[#4F5366] no-underline"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 items-center justify-center rounded-[14px] bg-[#23265B] px-7 text-[13px] font-bold text-white transition hover:bg-[#1D204F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Submitting..." : "Submit claim"}
                    </button>

                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}