"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Lock, LogOut, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-[#23265B]" : "bg-[#E1DDD4]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyClaims, setNotifyClaims] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

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
    return () => {
      mounted = false;
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
          <p className="text-sm text-[#77768A]">Loading settings...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] pb-28">
          <div className="mx-auto max-w-xl px-5 py-12">
            <div className="rounded-[26px] border border-[#E3DFD7] bg-[#FFFDF9] p-8 text-center shadow-[0_8px_30px_rgba(23,32,68,0.05)]">
              <p className="text-[14px] font-semibold text-[#45485B]">
                Sign in to manage your settings.
              </p>
              <Link
                href="/login?redirect=%2Fsettings"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-[13px] bg-[#20265F] px-6 text-[12px] font-bold text-white"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const email = user.email || "";

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] pb-28">
        <div className="mx-auto max-w-2xl">

          {/* HERO PANEL */}
          <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-8 pt-9 text-white sm:px-8 sm:pb-10 sm:pt-11">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#5D48D2]/30 blur-3xl"
            />

            <Link
              href="/profile"
              className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C8C6E0] hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to profile
            </Link>

            <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#BEB8FF]">
              Account
            </p>
            <h1 className="relative mt-2 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">
              Settings
            </h1>
          </section>

          <section className="px-5 pt-6 sm:px-8">

            {/* ACCOUNT INFO */}
            <div className="rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] sm:p-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#858796]">
                <User size={13} />
                Account
              </div>

              <div className="mt-3 rounded-[14px] border border-[#E5E1D9] bg-[#FAF8F3] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#858796]">Email</p>
                <p className="mt-1 truncate text-[13px] font-semibold">{email}</p>
              </div>

              <button
                type="button"
                className="mt-2.5 flex w-full items-center justify-between rounded-[14px] border border-[#E5E1D9] bg-[#FAF8F3] px-4 py-3 text-left transition hover:border-[#CFC8FF]"
              >
                <div className="flex items-center gap-2.5">
                  <Lock size={15} className="text-[#6952D7]" />
                  <span className="text-[13px] font-semibold">Change password</span>
                </div>
              </button>
            </div>

            {/* NOTIFICATIONS */}
            <div className="mt-4 rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] sm:p-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#858796]">
                <Bell size={13} />
                Notifications
              </div>

              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-[14px] border border-[#E5E1D9] bg-[#FAF8F3] px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-semibold">Messages</p>
                    <p className="text-[10.5px] text-[#858796]">Chat and reply notifications</p>
                  </div>
                  <Toggle checked={notifyMessages} onChange={() => setNotifyMessages((v) => !v)} />
                </div>

                <div className="flex items-center justify-between rounded-[14px] border border-[#E5E1D9] bg-[#FAF8F3] px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-semibold">Lost &amp; Found claims</p>
                    <p className="text-[10.5px] text-[#858796]">Updates on your reports</p>
                  </div>
                  <Toggle checked={notifyClaims} onChange={() => setNotifyClaims((v) => !v)} />
                </div>

                <div className="flex items-center justify-between rounded-[14px] border border-[#E5E1D9] bg-[#FAF8F3] px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-semibold">Campus updates</p>
                    <p className="text-[10.5px] text-[#858796]">Tips, news and announcements</p>
                  </div>
                  <Toggle checked={notifyMarketing} onChange={() => setNotifyMarketing((v) => !v)} />
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="mt-4 rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] sm:p-6">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#DEDAD1] bg-white text-[12px] font-bold text-[#45485B] transition hover:bg-[#F0EDE5] disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : <><LogOut size={15} /> Log out</>}
              </button>

              <button
                type="button"
                className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#F0C9C9] bg-[#FFF5F5] text-[12px] font-bold text-[#A33A3A] transition hover:bg-[#FFEDED]"
              >
                <Trash2 size={15} />
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}