"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setReady(Boolean(data.session));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && (event === "PASSWORD_RECOVERY" || session)) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSaved(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#171A35]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-[#FBF9F4] px-5 sm:px-8">
        <header className="flex items-center border-b border-[#E5E0D8] py-4">
          <Link href="/login" className="flex items-center" aria-label="CampusLoop home">
            <Image src="/logo.png" alt="CampusLoop" width={120} height={76} className="h-11 w-auto object-contain" priority />
          </Link>
        </header>

        <section className="pt-14 sm:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6654D9]">New password</p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1] tracking-[-0.055em]">Choose a new password.</h1>
          <p className="mt-4 text-[14px] leading-6 text-[#696979]">Use a password you don't use elsewhere. You'll be signed out after it is changed.</p>
        </section>

        <section className="mt-9">
          {saved ? (
            <div className="rounded-[22px] border border-[#DDE8DF] bg-[#F4FAF5] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#DFF1E3] text-[#287A47]"><Check size={21} /></div>
              <h2 className="mt-5 text-[18px] font-bold">Password updated</h2>
              <p className="mt-2 text-[13px] leading-5 text-[#68708A]">Your password has been changed. Sign in again to continue using CampusLoop.</p>
              <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-[13px] bg-[#20265F] px-5 text-[12px] font-bold text-white">Sign in</Link>
            </div>
          ) : !ready ? (
            <div className="rounded-[22px] border border-[#E3DFD7] bg-[#FFFDF9] p-6 text-[13px] leading-5 text-[#68708A]">This password reset link is invalid or has expired. Request a new link from the sign-in page.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768A]">New password</label>
                <input id="password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-[52px] w-full rounded-[14px] border border-[#DCD9D0] bg-[#FFFDF9] px-4 text-[14px] outline-none placeholder:text-[#AAA8A0] focus:border-[#6654D9] focus:ring-2 focus:ring-[#6654D9]/10" />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768A]">Confirm password</label>
                <input id="confirm" type="password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Enter it again" className="h-[52px] w-full rounded-[14px] border border-[#DCD9D0] bg-[#FFFDF9] px-4 text-[14px] outline-none placeholder:text-[#AAA8A0] focus:border-[#6654D9] focus:ring-2 focus:ring-[#6654D9]/10" />
              </div>
              {error && <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="flex h-[54px] w-full items-center justify-between rounded-[14px] bg-[#20265F] px-5 text-[13px] font-semibold text-white hover:bg-[#181D50] disabled:opacity-60">
                <span>{loading ? "Updating password..." : "Update password"}</span>
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
