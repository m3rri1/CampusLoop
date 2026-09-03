"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Search, UserRound, Plus } from "lucide-react";

export default function AppNavigation() {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Package },
    { href: "/lost-found", label: "Lost & Found", icon: Search },
    { href: "/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <>
      {/* MOBILE LOST & FOUND ACTIONS */}
      {pathname === "/lost-found" && (
        <div className="fixed bottom-[88px] left-1/2 z-40 flex w-[calc(100%-40px)] max-w-[430px] -translate-x-1/2 gap-2 md:hidden">
          <Link
            href="/lost-found/report?type=lost"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[#23265B] text-[11px] font-bold text-white shadow-[0_6px_20px_rgba(35,38,91,0.2)]"
          >
            <Plus size={14} />
            Report lost
          </Link>

          <Link
            href="/lost-found/report?type=found"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-[#D8D2C8] bg-[#FFFDF9] text-[11px] font-bold text-[#23265B] shadow-[0_6px_20px_rgba(23,32,68,0.08)]"
          >
            <Plus size={14} />
            Report found
          </Link>
        </div>
      )}

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
                  active ? "bg-[#23265B] text-white" : "text-[#747686]"
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.7} />
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
