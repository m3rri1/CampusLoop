"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Heart,
  BookOpen,
  ChevronRight,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const quickFilters = [
  { href: "/marketplace?category=Electronics", label: "Electronics" },
  { href: "/marketplace?category=Books", label: "Books" },
  { href: "/lost-found?type=lost", label: "Lost items" },
  { href: "/borrow", label: "Borrow gear" },
  { href: "/lost-found?type=found", label: "Found items" },
];

export default function HomePage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user);
      setName(
        user?.user_metadata?.full_name || user?.user_metadata?.name || ""
      );
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setName(
        currentUser?.user_metadata?.full_name ||
          currentUser?.user_metadata?.name ||
          ""
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const firstName = name ? name.split(" ")[0] : "";

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#171A35]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">

        {/* HERO PANEL — full-bleed color block, not a floating card */}
        <section className="relative overflow-hidden rounded-b-[32px] bg-[#20265F] px-5 pb-8 pt-9 text-white sm:px-8 sm:pb-12 sm:pt-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#6654D9]/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#8C7BFF]/20 blur-3xl"
          />

          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#BEB8FF]">
              {user
                ? firstName
                  ? `Welcome back, ${firstName}`
                  : "Welcome back"
                : "Your campus. Connected."}
            </p>

            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold text-[#DCD6FF]">
              <Sparkles size={11} />
              PPSU
            </span>
          </div>

          <h1 className="relative mt-3 text-[36px] font-bold leading-[0.98] tracking-[-0.05em] sm:text-[48px]">
            Everything around
            <br />
            your campus,
            <br />
            <span className="text-[#B3A7FF]">in one loop.</span>
          </h1>

          <p className="relative mt-4 max-w-[440px] text-[13px] leading-5 text-[#C8C6E0]">
            Buy and sell with students, borrow things you need, report
            lost items and connect with your campus community.
          </p>

          {/* SEARCH — a real input sitting in the hero, not a card explaining search */}
          <div className="relative mt-6 flex h-12 items-center gap-3 rounded-[15px] bg-white px-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <Search size={17} className="shrink-0 text-[#6952D7]" />
            <input
              placeholder="Search marketplace, lost items..."
              readOnly
              onClick={() => (window.location.href = "/marketplace")}
              className="w-full cursor-pointer bg-transparent text-[13px] text-[#171A35] outline-none placeholder:text-[#9C9AB0]"
            />
          </div>
        </section>

        {/* QUICK FILTER RAIL — tactile pills, not a card */}
        <section className="mt-5 px-5 sm:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickFilters.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="shrink-0 rounded-full border border-[#E1DDD4] bg-[#FFFDF9] px-4 py-2 text-[10.5px] font-semibold text-[#4A4D63] transition hover:border-[#C8C1EE] hover:text-[#5D48D2]"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </section>

        {/* BENTO GRID — one featured card, three smaller ones. Not a uniform 2x2. */}
        <section className="mt-6 px-5 sm:px-8">

          {/* Featured: Marketplace */}
          <Link
            href="/marketplace"
            className="group flex items-center justify-between rounded-[22px] border border-[#E1DDD5] bg-gradient-to-br from-[#F6F3FF] to-[#FFFDF9] p-5 shadow-[0_5px_20px_rgba(23,32,68,0.05)] transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#5D48D2] text-white">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold">Marketplace</h2>
                <p className="mt-0.5 text-[11px] leading-4 text-[#6D7184]">
                  Buy & sell with verified students on campus
                </p>
              </div>
            </div>

            <ArrowUpRight
              size={20}
              className="shrink-0 text-[#8B8B98] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#5D48D2]"
            />
          </Link>

          {/* Three smaller cards */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Link
              href="/lost-found"
              className="group flex flex-col rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-3.5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#FFE9D6] text-[#C2661A]">
                <Search size={16} />
              </div>
              <h3 className="mt-2.5 text-[11.5px] font-bold leading-tight">
                Lost &amp; Found
              </h3>
              <p className="mt-0.5 text-[9px] leading-3 text-[#8B8D9A]">
                Find what you lost
              </p>
            </Link>

            <Link
              href="/borrow"
              className="group flex flex-col rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-3.5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#DAF3E4] text-[#1F8A4C]">
                <BookOpen size={16} />
              </div>
              <h3 className="mt-2.5 text-[11.5px] font-bold leading-tight">
                Borrow
              </h3>
              <p className="mt-0.5 text-[9px] leading-3 text-[#8B8D9A]">
                No buying needed
              </p>
            </Link>

            <Link
              href="/profile"
              className="group flex flex-col rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-3.5 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#FDE2ED] text-[#C23D74]">
                <UserRound size={16} />
              </div>
              <h3 className="mt-2.5 text-[11.5px] font-bold leading-tight">
                Profile
              </h3>
              <p className="mt-0.5 text-[9px] leading-3 text-[#8B8D9A]">
                Your activity
              </p>
            </Link>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="mt-6 px-5 sm:px-8">
          <div className="flex items-start gap-3 rounded-[18px] border border-[#DDD6FF] bg-[#F6F3FF] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold">Built for your campus</p>
              <p className="mt-1 text-[10px] leading-4 text-[#70738A]">
                CampusLoop keeps buying, borrowing and connecting
                between students in one place.
              </p>
            </div>
          </div>
        </section>

        {/* ACCOUNT CTA */}
        {!user && (
          <section className="mt-6 px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-[24px] bg-[#23265B] p-5 text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5"
              />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BEB8FF]">
                    New here?
                  </p>
                  <h2 className="mt-2 text-[20px] font-bold tracking-[-0.03em]">
                    Join your campus loop.
                  </h2>
                </div>
                <Heart size={19} className="text-[#BEB8FF]" />
              </div>

              <Link
                href="/signup"
                className="relative mt-5 flex h-11 items-center justify-center rounded-[13px] bg-white text-[12px] font-bold text-[#23265B]"
              >
                Create account
              </Link>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}