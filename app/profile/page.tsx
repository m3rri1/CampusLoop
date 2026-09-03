"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-10">
          <p className="text-sm text-[#77768A]">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto flex min-h-screen max-w-[1280px] items-center justify-center bg-[#FBF9F4] px-5">
          <div className="w-full max-w-md rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEE9FF] text-[#5D48D2]">
              <User size={24} />
            </div>

            <h1 className="mt-5 text-[24px] font-bold tracking-[-0.04em]">
              You're not signed in
            </h1>

            <p className="mt-2 text-[13px] leading-5 text-[#747789]">
              Sign in to access your CampusLoop profile.
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href="/login"
                className="flex h-11 flex-1 items-center justify-center rounded-[13px] border border-[#DEDAD1] text-[12px] font-bold text-[#45485B]"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="flex h-11 flex-1 items-center justify-center rounded-[13px] bg-[#20265F] text-[12px] font-bold text-white"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "CampusLoop Student";

  const email = user.email || "";

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4]">

        <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>

          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">
              Account
            </p>

            <h1 className="mt-2 text-[34px] font-bold tracking-[-0.05em] sm:text-[42px]">
              Your profile
            </h1>

            <p className="mt-2 text-[13px] text-[#6D7184]">
              Manage your CampusLoop account.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] shadow-[0_8px_30px_rgba(23,32,68,0.05)]">

            {/* Profile header */}
            <div className="border-b border-[#E8E4DB] p-6 sm:p-8">
              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#EEE9FF] text-[22px] font-bold text-[#5D48D2]">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-[18px] font-bold">
                    {name}
                  </h2>

                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#77768A]">
                    <Mail size={13} />
                    {email}
                  </div>
                </div>

              </div>
            </div>

            {/* Account info */}
            <div className="p-6 sm:p-8">

              <div className="space-y-4">

                <div className="flex items-center gap-4 rounded-[16px] border border-[#E5E1D9] bg-[#FAF8F3] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-[#6952D7]">
                    <User size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858796]">
                      Full name
                    </p>
                    <p className="mt-1 text-[13px] font-semibold">
                      {name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[16px] border border-[#E5E1D9] bg-[#FAF8F3] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-[#6952D7]">
                    <Mail size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858796]">
                      Email
                    </p>
                    <p className="mt-1 text-[13px] font-semibold">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[16px] border border-[#E5E1D9] bg-[#FAF8F3] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-[#287A47]">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858796]">
                      Account status
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#287A47]">
                      Signed in
                    </p>
                  </div>
                </div>

              </div>

              <button
                onClick={handleLogout}
                className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-[13px] border border-[#F0C9C9] bg-[#FFF5F5] text-[12px] font-bold text-[#A33A3A] hover:bg-[#FFEDED]"
              >
                <LogOut size={15} />
                Log out
              </button>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}