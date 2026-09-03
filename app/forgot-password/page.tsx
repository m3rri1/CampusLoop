"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#171A35]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-[#FBF9F4] px-5 sm:px-8">
        <header className="flex items-center border-b border-[#E5E0D8] py-4">
          <Link href="/login" className="flex items-center gap-2 text-[12px] font-semibold text-[#596075]">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </header>

        <section className="pt-14 sm:pt-20">
          <Image src="/logo.png" alt="CampusLoop" width={120} height={76} className="h-11 w-auto object-contain" priority />
          <p className="mt-9 text-[10px] font-bold uppercase tracking-[0.24em] text-[#6654D9]">Account recovery</p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1] tracking-[-0.055em] sm:text-[44px]">Reset your password.</h1>
          <p className="mt-4 max-w-[380px] text-[14px] leading-6 text-[#696979]">Enter the email connected to your CampusLoop account and we'll send you a secure reset link.</p>
        </section>

        <section className="mt-9">
          {sent ? (
            <div className="rounded-[22px] border border-[#DDE8DF] bg-[#F4FAF5] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#DFF1E3] text-[#287A47]"><Check size={21} /></div>
              <h2 className="mt-5 text-[18px] font-bold">Check your email</h2>
              <p className="mt-2 text-[13px] leading-5 text-[#68708A]">If an account exists for <span className="font-semibold">{email}</span>, you'll receive a password reset link shortly.</p>
              <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-[13px] bg-[#20265F] px-5 text-[12px] font-bold text-white">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768A]">College email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" className="h-[52px] w-full rounded-[14px] border border-[#DCD9D0] bg-[#FFFDF9] px-4 text-[14px] outline-none placeholder:text-[#AAA8A0] focus:border-[#6654D9] focus:ring-2 focus:ring-[#6654D9]/10" />
              </div>
              {error && <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="flex h-[54px] w-full items-center justify-between rounded-[14px] bg-[#20265F] px-5 text-[13px] font-semibold text-white hover:bg-[#181D50] disabled:opacity-60">
                <span>{loading ? "Sending link..." : "Send reset link"}</span>
                {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowUpRight size={18} />}
              </button>
            </form>
          )}
        </section>

        <div className="mt-auto border-t border-[#DEDAD2] py-7 text-center text-[9px] font-semibold uppercase tracking-[0.15em] text-[#AAA8A0]">CampusLoop · Your campus, in one loop.</div>
      </div>
    </main>
  );
}
