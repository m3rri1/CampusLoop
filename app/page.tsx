"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronRight,
  Heart,
  Package,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();

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

      const fullName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        "";

      setName(fullName);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      const fullName =
        currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        "";

      setName(fullName);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const firstName = name ? name.split(" ")[0] : "";

  return (
    <main className="min-h-screen bg-[#4E3439] text-[#171A35]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-28">

        {/* HEADER */}
        {/* HEADER */}


        {/* HERO */}
        <section className="px-5 pt-10 sm:px-8 sm:pt-14">
          <div className="max-w-2xl">

            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6952D7]">
              {user
                ? firstName
                  ? `Welcome back, ${firstName}`
                  : "Welcome back"
                : "Your campus. Connected."}
            </p>

            <h1 className="mt-3 text-[40px] font-bold leading-[0.98] tracking-[-0.055em] sm:text-[52px]">
              Everything
              <br />
              around your
              <br />
              campus.
              <br />
              <span className="text-[#6654D9]">In one loop.</span>
            </h1>

            <p className="mt-5 max-w-[500px] text-[14px] leading-6 text-[#686A7C]">
              Buy and sell with students, borrow things you need,
              report lost items and connect with your campus community.
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-8 px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-3">

            <Link
              href="/marketplace"
              className="group rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-4 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[#6250D5]">
                  <Package size={19} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-[#8B8B98] transition group-hover:text-[#6250D5]"
                />
              </div>

              <h2 className="mt-4 text-[13px] font-bold">
                Marketplace
              </h2>

              <p className="mt-1 text-[10px] leading-4 text-[#77798A]">
                Buy & sell on campus
              </p>
            </Link>

            <Link
              href="/lost-found"
              className="group rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-4 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[#6250D5]">
                  <Search size={19} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-[#8B8B98] transition group-hover:text-[#6250D5]"
                />
              </div>

              <h2 className="mt-4 text-[13px] font-bold">
                Lost & Found
              </h2>

              <p className="mt-1 text-[10px] leading-4 text-[#77798A]">
                Find what you lost
              </p>
            </Link>

            <Link
              href="/borrow"
              className="group rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-4 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[#6250D5]">
                  <BookOpen size={19} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-[#8B8B98] transition group-hover:text-[#6250D5]"
                />
              </div>

              <h2 className="mt-4 text-[13px] font-bold">
                Borrow & Rent
              </h2>

              <p className="mt-1 text-[10px] leading-4 text-[#77798A]">
                Get things without buying
              </p>
            </Link>

            <Link
              href="/profile"
              className="group rounded-[18px] border border-[#E1DDD5] bg-[#FFFDF9] p-4 shadow-[0_5px_20px_rgba(23,32,68,0.04)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[#6250D5]">
                  <UserRound size={19} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-[#8B8B98] transition group-hover:text-[#6250D5]"
                />
              </div>

              <h2 className="mt-4 text-[13px] font-bold">
                My Profile
              </h2>

              <p className="mt-1 text-[10px] leading-4 text-[#77798A]">
                Account & activity
              </p>
            </Link>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mt-8 px-5 sm:px-8">
          <div className="rounded-[22px] border border-[#E1DDD5] bg-[#FFFDF9] p-5 shadow-[0_5px_20px_rgba(23,32,68,0.04)]">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEE9FF] text-[#6250D5]">
                <Search size={18} />
              </div>

              <div>
                <h2 className="text-[13px] font-bold">
                  What are you looking for?
                </h2>

                <p className="mt-0.5 text-[10px] text-[#858695]">
                  Search across your campus
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2">

              <Link
                href="/marketplace"
                className="flex items-center justify-between rounded-[15px] border border-[#E6E1D9] bg-[#FBF9F4] px-4 py-3"
              >
                <div>
                  <p className="text-[11px] font-bold">Marketplace</p>
                  <p className="mt-0.5 text-[9px] text-[#888997]">
                    Books, calculators, projects & more
                  </p>
                </div>

                <ChevronRight size={15} />
              </Link>

              <Link
                href="/borrow"
                className="flex items-center justify-between rounded-[15px] border border-[#E6E1D9] bg-[#FBF9F4] px-4 py-3"
              >
                <div>
                  <p className="text-[11px] font-bold">Borrow & Rent</p>
                  <p className="mt-0.5 text-[9px] text-[#888997]">
                    Get things without buying them
                  </p>
                </div>

                <ChevronRight size={15} />
              </Link>

              <Link
                href="/lost-found"
                className="flex items-center justify-between rounded-[15px] border border-[#E6E1D9] bg-[#FBF9F4] px-4 py-3"
              >
                <div>
                  <p className="text-[11px] font-bold">Lost & Found</p>
                  <p className="mt-0.5 text-[9px] text-[#888997]">
                    Find or report something
                  </p>
                </div>

                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="mt-6 px-5 sm:px-8">
          <div className="flex items-start gap-3 rounded-[18px] border border-[#DDD6FF] bg-[#F6F3FF] p-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#E9E3FF] text-[#5D48D2]">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-[11px] font-bold">
                Built for your campus
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#70738A]">
                CampusLoop keeps buying, borrowing and connecting
                between students in one place.
              </p>
            </div>
          </div>
        </section>

        {/* ACCOUNT CTA */}
        {!user && (
          <section className="mt-8 px-5 sm:px-8">
            <div className="rounded-[22px] bg-[#23265B] p-5 text-white">

              <div className="flex items-start justify-between">
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
                className="mt-5 flex h-11 items-center justify-center rounded-[13px] bg-white text-[12px] font-bold text-[#23265B]"
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