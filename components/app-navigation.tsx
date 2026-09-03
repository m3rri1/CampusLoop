"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Search,
  UserRound,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function AppNavigation() {
  const pathname = usePathname();

  // No app navigation on auth pages
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const items = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: Package,
    },
    {
      href: "/lost-found",
      label: "Lost & Found",
      icon: Search,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: UserRound,
    },
  ];

  return (
    <>
      {/* TOP APP HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#E4E0D8] bg-[#FBF9F4]">
        <div className="mx-auto flex h-[72px] w-full max-w-[1100px] items-center justify-between px-5 sm:px-8">

          {/* BRAND */}
          <Link
            href="/"
            className="flex items-center no-underline"
          >
            
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold no-underline transition ${
                    active
                      ? "bg-[#23265B] text-white"
                      : "text-[#696C7C] hover:bg-[#F0EDE5] hover:text-[#23265B]"
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={active ? 2.2 : 1.7}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ACCOUNT */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="flex h-9 items-center gap-2 rounded-xl px-3.5 text-[11px] font-semibold text-[#55596B] no-underline hover:bg-[#F0EDE5]"
            >
              <LogIn size={14} />
              Log in
            </Link>

            <Link
              href="/signup"
              className="flex h-9 items-center gap-2 rounded-xl bg-[#23265B] px-4 text-[11px] font-bold text-white no-underline hover:bg-[#1D204F]"
            >
              <UserPlus size={14} />
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 md:hidden">
        <div className="mx-auto flex max-w-[430px] items-center justify-around rounded-[20px] border border-[#DEDAD1] bg-[#FFFDF9] px-1.5 py-1.5 shadow-[0_8px_30px_rgba(23,32,68,0.12)]">

          {items.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[68px] flex-col items-center justify-center gap-1 rounded-[13px] px-2 py-2 transition ${
                  active
                    ? "bg-[#23265B] text-white"
                    : "text-[#747686]"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={active ? 2.2 : 1.7}
                />

                <span className="text-[8px] font-semibold leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* MOBILE NAV SPACE */}
      <div className="h-[82px] md:hidden" />
    </>
  );
}