"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut, Mail, Search, ShieldCheck, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const actions = [
  { href: "/marketplace", title: "My marketplace", description: "Browse campus listings", icon: User },
  { href: "/lost-found", title: "Lost & Found", description: "View reports and claims", icon: Search },
  { href: "/borrow", title: "Borrow", description: "Find things to borrow", icon: ShieldCheck },
];

export default function ProfilePage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-12">
          <p className="text-sm text-[#77768A]">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] pb-28 sm:px-8">
          <div className="mx-auto max-w-xl px-5 py-12 sm:px-0">
            <div className="rounded-[26px] border border-[#E3DFD7] bg-[#FFFDF9] p-7 text-center shadow-[0_8px_30px_rgba(23,32,68,0.05)] sm:p-9">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#EEE9FF] text-[#5D48D2]">
                <User size={26} />
              </div>

              <h1 className="mt-6 text-[26px] font-bold tracking-[-0.05em]">Your account</h1>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-[#747789]">
                Sign in to manage your profile, listings, reports and campus activity.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Link
                  href="/login?redirect=%2Fprofile"
                  className="flex h-12 items-center justify-center rounded-[14px] border border-[#DEDAD1] text-[12px] font-bold text-[#45485B]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex h-12 items-center justify-center rounded-[14px] bg-[#20265F] text-[12px] font-bold text-white"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || "CampusLoop Student";
  const email = user.email || "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] pb-28">
        <div className="mx-auto max-w-4xl">

          {/* HERO PANEL */}
          <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-9 pt-9 text-white sm:px-8 sm:pb-11 sm:pt-11">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#5D48D2]/30 blur-3xl"
            />

            <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-[#BEB8FF]">
              Account
            </p>
            <h1 className="relative mt-2 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">
              Your profile
            </h1>

            <div className="relative mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white/10 text-[20px] font-bold text-white backdrop-blur">
                {initials || "CL"}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-bold">{name}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#C8C6E0]">
                  <Mail size={13} />
                  <span className="truncate">{email}</span>
                </div>
              </div>
            </div>

            <div className="relative mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-[#DCD6FF] backdrop-blur">
              <ShieldCheck size={14} />
              Verified session
            </div>
          </section>

          <section className="px-5 pt-6 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-[18px] border border-[#E5E1D9] bg-[#FFFDF9] p-4 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,32,68,0.08)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#EEE9FF] text-[#6952D7]">
                        <Icon size={16} />
                      </div>
                      <ArrowRight size={15} className="text-[#9A9CAA] transition group-hover:translate-x-0.5" />
                    </div>
                    <h3 className="mt-5 text-[13px] font-bold">{action.title}</h3>
                    <p className="mt-1 text-[11px] leading-4 text-[#7B7E8E]">{action.description}</p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] sm:p-6">
              <div className="flex items-start gap-3 rounded-[17px] border border-[#E5E1D9] bg-[#FAF8F3] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-[#6952D7]">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858796]">Email</p>
                  <p className="mt-1 break-all text-[13px] font-semibold">{email}</p>
                </div>
              </div>

              <Link
                href="/settings"
                className="mt-3 flex h-12 w-full items-center justify-center rounded-[14px] border border-[#E1DDD4] bg-white text-[12px] font-bold text-[#23265B] transition hover:border-[#CFC8FF]"
              >
                Account settings
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#F0C9C9] bg-[#FFF5F5] text-[12px] font-bold text-[#A33A3A] transition hover:bg-[#FFEDED] disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : <><LogOut size={15} /> Log out</>}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}