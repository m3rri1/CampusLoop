"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Bell, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("We couldn't complete sign in. Please try again.");
    }
  }, [searchParams]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#171A35]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-[#FBF9F4] px-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-[#E5E0D8] py-4">
          <Link href="/" className="flex items-center" aria-label="CampusLoop home">
            <Image src="/logo.png" alt="CampusLoop" width={120} height={76} className="h-11 w-auto object-contain" priority />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DEDAD1] bg-[#FFFDF9]">
            <Bell size={16} strokeWidth={1.6} />
          </div>
        </header>

        <section className="pt-12 sm:pt-16">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#6654D9]">Welcome back</p>
          <h1 className="text-[40px] font-bold leading-[0.98] tracking-[-0.055em] sm:text-[48px]">
            Back to your <span className="text-[#6654D9]">campus loop.</span>
          </h1>
          <p className="mt-5 max-w-[390px] text-[14px] leading-6 text-[#696979]">
            Sign in to buy, sell, find lost things and connect with students around your campus.
          </p>
        </section>

        <section className="mt-9">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768A]">College email</label>
              <input id="email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-[52px] w-full rounded-[14px] border border-[#DCD9D0] bg-[#FFFDF9] px-4 text-[14px] outline-none placeholder:text-[#AAA8A0] focus:border-[#6654D9] focus:ring-2 focus:ring-[#6654D9]/10" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768A]">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-[#6654D9]">Forgot password?</Link>
              </div>
              <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-[52px] w-full rounded-[14px] border border-[#DCD9D0] bg-[#FFFDF9] px-4 text-[14px] outline-none placeholder:text-[#AAA8A0] focus:border-[#6654D9] focus:ring-2 focus:ring-[#6654D9]/10" />
            </div>

            {error && <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className="flex h-[54px] w-full items-center justify-between rounded-[14px] bg-[#20265F] px-5 text-[13px] font-semibold text-white transition hover:bg-[#181D50] disabled:opacity-60">
              <span>{loading ? "Signing in..." : "Sign in to CampusLoop"}</span>
              {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowUpRight size={18} />}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4"><div className="h-px flex-1 bg-[#DEDAD2]" /><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#AAA8A0]">or</span><div className="h-px flex-1 bg-[#DEDAD2]" /></div>

          <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] border border-[#D8D5CC] bg-[#FFFDF9] text-[13px] font-semibold text-[#25263A] transition hover:bg-white disabled:opacity-60">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[12px] font-bold shadow-sm">G</span>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>
        </section>

        <div className="mt-auto border-t border-[#DEDAD2] py-7 text-center">
          <p className="text-[12px] text-[#77768A]">New to CampusLoop? <Link href="/signup" className="font-semibold text-[#6654D9]">Create an account</Link></p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.15em] text-[#AAA8A0]"><Check size={11} />Built for your campus</div>
        </div>
      </div>
    </main>
  );
}
