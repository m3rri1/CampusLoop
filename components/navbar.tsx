"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

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

  return (
    <header className="sticky top-0 z-50 border-b border-[#E3DFD7] bg-[#FBF9F4]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#20265F] text-sm font-bold text-white">
            CL
          </div>

          <div>
            <div className="text-[15px] font-bold tracking-[-0.02em] text-[#171A35]">
              CampusLoop
            </div>
            <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#77768A]">
              Campus community
            </div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/marketplace"
            className="text-[12px] font-semibold text-[#55586B] transition hover:text-[#6654D9]"
          >
            Marketplace
          </Link>

          <Link
            href="/borrow"
            className="text-[12px] font-semibold text-[#55586B] transition hover:text-[#6654D9]"
          >
            Borrow
          </Link>

          <Link
            href="/lost-found"
            className="text-[12px] font-semibold text-[#55586B] transition hover:text-[#6654D9]"
          >
            Lost &amp; Found
          </Link>

          <Link
            href="/chat"
            className="text-[12px] font-semibold text-[#55586B] transition hover:text-[#6654D9]"
          >
            Chat
          </Link>
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="flex h-10 items-center rounded-[12px] px-4 text-[12px] font-semibold text-[#4F5366] hover:bg-[#F1EEE7]"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="flex h-10 items-center rounded-[12px] bg-[#20265F] px-4 text-[12px] font-bold text-white hover:bg-[#181D50]"
              >
                Create account
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link
                href="/profile"
                className="flex h-10 items-center gap-2 rounded-[12px] border border-[#DEDAD1] bg-[#FFFDF9] px-3 hover:border-[#C8C1EE]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEE9FF] text-[10px] font-bold text-[#5D48D2]">
                  {name.charAt(0).toUpperCase()}
                </div>

                <span className="max-w-[100px] truncate text-[12px] font-semibold text-[#343A56]">
                  {name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#DEDAD1] bg-[#FFFDF9] text-[#646779] hover:text-red-600"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#DEDAD1] bg-[#FFFDF9] md:hidden"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#E3DFD7] bg-[#FBF9F4] px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-1">

            <Link
              href="/marketplace"
              onClick={() => setMobileOpen(false)}
              className="rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#45485B] hover:bg-[#F1EEE7]"
            >
              Marketplace
            </Link>

            <Link
              href="/borrow"
              onClick={() => setMobileOpen(false)}
              className="rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#45485B] hover:bg-[#F1EEE7]"
            >
              Borrow
            </Link>

            <Link
              href="/lost-found"
              onClick={() => setMobileOpen(false)}
              className="rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#45485B] hover:bg-[#F1EEE7]"
            >
              Lost &amp; Found
            </Link>

            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#45485B] hover:bg-[#F1EEE7]"
            >
              Chat
            </Link>

            <div className="my-3 h-px bg-[#E3DFD7]" />

            {!loading && !user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#45485B]"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[12px] bg-[#20265F] px-3 py-3 text-center text-[13px] font-bold text-white"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#45485B]"
                >
                  <User size={16} />
                  My profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-[12px] px-3 py-3 text-left text-[13px] font-semibold text-red-600"
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