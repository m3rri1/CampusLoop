"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Student";

        setName(fullName);
      }

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        setName(
          session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Student"
        );
      } else {
        setName("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const navLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/lost-found", label: "Lost & Found" },
    { href: "/borrow", label: "Borrow" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F4]/90 px-5 py-2.5 backdrop-blur-md shadow-[0_1px_0_rgba(23,32,68,0.06)] sm:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setMobileOpen(false)}
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

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[11px] font-semibold text-[#696C7C] transition hover:bg-[#F0EDE5] hover:text-[#23265B]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="flex h-9 items-center rounded-full px-4 text-[11px] font-semibold text-[#4F5366] hover:bg-[#F0EDE5]"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="flex h-9 items-center rounded-full bg-[#23265B] px-4 text-[11px] font-bold text-white shadow-[0_3px_10px_rgba(35,38,91,0.25)] hover:bg-[#181D50]"
              >
                Create account
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link
                href="/profile"
                className="flex h-9 items-center gap-2 rounded-full border border-[#E1DDD4] bg-white px-3 hover:border-[#CFC8FF]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEE9FF] text-[9px] font-bold text-[#5D48D2]">
                  {name.charAt(0).toUpperCase()}
                </div>

                <span className="max-w-[100px] truncate text-[11px] font-semibold text-[#343A56]">
                  {name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#646779] transition hover:border-red-200 hover:text-red-600"
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </>
          )}

          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#171A35] transition hover:border-[#CFC8FF]"
          >
            <Bell size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white md:hidden"
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mt-3 rounded-[20px] border border-[#E7E2D8] bg-white p-3 shadow-[0_10px_35px_rgba(23,32,68,0.12)] md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-[14px] px-3 py-3 text-[13px] font-semibold text-[#45485B] hover:bg-[#F0EDE5]"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-[#EDE9E0]" />

            {!loading && !user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[14px] px-3 py-3 text-[13px] font-semibold text-[#45485B]"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[14px] bg-[#23265B] px-3 py-3 text-center text-[13px] font-bold text-white"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-[14px] px-3 py-3 text-[13px] font-semibold text-[#45485B]"
                >
                  <User size={16} />
                  My profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-[14px] px-3 py-3 text-left text-[13px] font-semibold text-red-600"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}