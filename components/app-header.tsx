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
  const [supabase] = useState(() => createClient());

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
  }, [supabase]);

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const navLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/lost-found", label: "Lost & Found" },
    { href: "/borrow", label: "Borrow" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F4]/90 px-5 py-2.5 backdrop-blur-md shadow-[0_1px_0_rgba(23,32,68,0.06)] sm:px-8">
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
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[11px] font-semibold no-underline transition ${
                  active
                    ? "bg-[#23265B] text-white shadow-[0_3px_10px_rgba(35,38,91,0.25)]"
                    : "text-[#696C7C] hover:bg-[#F0EDE5] hover:text-[#23265B]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/profile"
              aria-label="Profile"
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                pathname.startsWith("/profile")
                  ? "border-[#CFC8FF] bg-[#F0ECFF] text-[#5D48D2]"
                  : "border-[#E1DDD4] bg-white text-[#171A35] hover:border-[#CFC8FF]"
              }`}
            >
              <UserRound size={16} strokeWidth={1.9} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex h-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white px-4 text-[11px] font-semibold text-[#23265B] transition hover:border-[#CFC8FF]"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#171A35] transition hover:border-[#CFC8FF]"
          >
            <Bell size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}