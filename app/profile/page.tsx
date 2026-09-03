"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut, Mail, ShieldCheck, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const actions = [
  { href: "/marketplace", title: "My marketplace", description: "Browse campus listings", icon: "marketplace" },
  { href: "/lost-found", title: "Lost & Found", description: "View reports and claims", icon: "search" },
  { href: "/borrow", title: "Borrow", description: "Find things to borrow", icon: "borrow" },
];

export default function ProfilePage() {
  const supabase = createClient();
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
    return <main className="min-h-screen bg-[#EEECE5]"><div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-12"><p className="text-sm text-[#77768A]">Loading profile...</p></div></main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 pb-28 sm:px-8">
          <div className="mx-auto max-w-xl py-10">
            <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#596075]">← Back home</Link>
            <div className="mt-12 rounded-[26px] border border-[#E3DFD7] bg-[#FFFDF9] p-7 text-center shadow-[0_8px_30px_rgba(23,32,68,0.05)] sm:p-9">
              <Image src="/logo.png" alt="CampusLoop" width={120} height={76} className="mx-auto h-12 w-auto object-contain" />
              <h1 className="mt-7 text-[28px] font-bold tracking-[-0.05em]">Your account</h1>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-[#747789]">Sign in to manage your profile, listings, reports and campus activity.</p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <Link href="/login?redirect=%2Fprofile" className="flex h-12 items-center justify-center rounded-[14px] border border-[#DEDAD1] text-[12px] font-bold text-[#45485B]">Log in</Link>
                <Link href="/signup" className="flex h-12 items-center justify-center rounded-[14px] bg-[#20265F] text-[12px] font-bold text-white">Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || "CampusLoop Student";
  const email = user.email || "";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] pb-28">
        <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#596075] hover:text-[#5141A9]">← Home</Link>
            <Link href="/" className="flex items-center"><Image src="/logo.png" alt="CampusLoop" width={100} height={64} className="h-9 w-auto object-contain" /></Link>
          </div>

          <section className="mt-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">Account</p>
            <h1 className="mt-2 text-[34px] font-bold tracking-[-0.055em] sm:text-[44px]">Your profile</h1>
            <p className="mt-2 text-[13px] text-[#6D7184]">Your CampusLoop identity and shortcuts.</p>
          </section>

          <section className="mt-7 overflow-hidden rounded-[26px] border border-[#E3DFD7] bg-[#FFFDF9] shadow-[0_8px_30px_rgba(23,32,68,0.05)]">
            <div className="flex flex-col gap-5 border-b border-[#E8E4DB] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#EEE9FF] text-[20px] font-bold text-[#5D48D2]">{initials || "CL"}</div>
                <div className="min-w-0">
                  <h2 className="truncate text-[19px] font-bold">{name}</h2>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#77768A]"><Mail size={13} /> <span className="truncate">{email}</span></div>
                </div>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EAF6ED] px-3 py-2 text-[10px] font-bold text-[#287A47]"><ShieldCheck size={14} /> Verified session</div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
              {actions.map((action) => (
                <Link key={action.href} href={action.href} className="group rounded-[18px] border border-[#E5E1D9] bg-[#FAF8F3] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_7px_20px_rgba(23,32,68,0.06)]">
                  <div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-[#6952D7]"><User size={16} /></div><ArrowRight size={15} className="text-[#9A9CAA] transition group-hover:translate-x-0.5" /></div>
                  <h3 className="mt-5 text-[13px] font-bold">{action.title}</h3>
                  <p className="mt-1 text-[11px] leading-4 text-[#7B7E8E]">{action.description}</p>
                </Link>
              ))}
            </div>

            <div className="border-t border-[#E8E4DB] p-5 sm:p-7">
              <div className="rounded-[17px] border border-[#E5E1D9] bg-[#FAF8F3] p-4">
                <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-[#6952D7]"><Mail size={16} /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858796]">Email</p><p className="mt-1 break-all text-[13px] font-semibold">{email}</p></div></div>
              </div>

              <button onClick={handleLogout} disabled={loggingOut} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#F0C9C9] bg-[#FFF5F5] text-[12px] font-bold text-[#A33A3A] transition hover:bg-[#FFEDED] disabled:opacity-60">
                {loggingOut ? "Logging out..." : <><LogOut size={15} /> Log out</>}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
