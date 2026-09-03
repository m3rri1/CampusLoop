"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Authentication pages have their own header.
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E0D8] bg-[#FBF9F4]/95 px-5 py-3 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center"
          aria-label="CampusLoop home"
        >
          <Image
            src="/logo.png"
            alt="CampusLoop"
            width={120}
            height={76}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">

          {user ? (
            <Link
              href="/profile"
              aria-label="Profile"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                pathname.startsWith("/profile")
                  ? "border-[#CFC8FF] bg-[#F0ECFF] text-[#5D48D2]"
                  : "border-[#DEDAD1] bg-[#FFFDF9] text-[#171A35] hover:bg-white"
              }`}
            >
              <UserRound size={17} strokeWidth={1.8} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center justify-center rounded-full border border-[#DEDAD1] bg-[#FFFDF9] px-4 text-[11px] font-semibold text-[#23265B] transition hover:bg-white"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DEDAD1] bg-[#FFFDF9] text-[#171A35] transition hover:bg-white"
          >
            <Bell size={17} strokeWidth={1.7} />
          </button>

        </div>
      </div>
    </header>
  );
}