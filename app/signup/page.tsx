"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bell, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your college email to confirm your account."
    );
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#171a35]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#dedbd2] py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#20265f] text-sm font-bold text-white">
              CL
            </div>

            <div>
              <div className="text-[15px] font-semibold tracking-[-0.02em]">
                CampusLoop
              </div>

              <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#77768a]">
                Campus community
              </div>
            </div>
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dedbd2] bg-[#faf8f2]">
            <Bell size={16} strokeWidth={1.6} />
          </div>
        </header>

        {/* Intro */}
        <section className="pt-16">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#6654d9]">
            Join CampusLoop
          </p>

          <h1 className="max-w-[350px] text-[42px] font-bold leading-[0.98] tracking-[-0.055em]">
            Your campus,
            <br />
            <span className="text-[#6654d9]">in one loop.</span>
          </h1>

          <p className="mt-5 max-w-[315px] text-[14px] leading-6 text-[#696979]">
            Create your account and connect with students, listings and
            everything happening around your campus.
          </p>
        </section>

        {/* Form */}
        <section className="mt-10">
          <form onSubmit={handleSignup} className="space-y-5">

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768a]"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-[52px] w-full rounded-[14px] border border-[#dcd9d0] bg-[#faf8f2] px-4 text-[14px] outline-none placeholder:text-[#aaa8a0] focus:border-[#6654d9] focus:ring-2 focus:ring-[#6654d9]/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768a]"
              >
                College email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[52px] w-full rounded-[14px] border border-[#dcd9d0] bg-[#faf8f2] px-4 text-[14px] outline-none placeholder:text-[#aaa8a0] focus:border-[#6654d9] focus:ring-2 focus:ring-[#6654d9]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77768a]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="h-[52px] w-full rounded-[14px] border border-[#dcd9d0] bg-[#faf8f2] px-4 text-[14px] outline-none placeholder:text-[#aaa8a0] focus:border-[#6654d9] focus:ring-2 focus:ring-[#6654d9]/10"
              />
            </div>

            {error && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-600">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] leading-5 text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-[54px] w-full items-center justify-between rounded-[14px] bg-[#20265f] px-5 text-[13px] font-semibold text-white transition hover:bg-[#181d50] disabled:opacity-60"
            >
              <span>
                {loading ? "Creating account..." : "Create my account"}
              </span>

              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ArrowUpRight size={18} />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#dedbd2]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#aaa8a0]">
              or
            </span>

            <div className="h-px flex-1 bg-[#dedbd2]" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] border border-[#d8d5cc] bg-[#faf8f2] text-[13px] font-semibold text-[#25263a] transition hover:bg-white disabled:opacity-60"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[12px] font-bold shadow-sm">
              G
            </span>

            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>
        </section>

        {/* Bottom */}
        <div className="mt-auto border-t border-[#dedbd2] py-7 text-center">
          <p className="text-[12px] text-[#77768a]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#6654d9]"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.15em] text-[#aaa8a0]">
            <Check size={11} />
            Built for your campus
          </div>
        </div>
      </div>
    </main>
  );
}