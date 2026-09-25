"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type HeaderNotification = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

export default function AppHeader() {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>(
    []
  );

  const [supabase] = useState(() => createClient());

  // =========================================================
  // AUTH USER
  // =========================================================

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

  // =========================================================
  // UNREAD NOTIFICATION COUNT + REALTIME
  // =========================================================

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let mounted = true;

    async function loadUnreadCount() {
      const { data, error } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!error && mounted) {
        setUnreadCount(data?.length ?? 0);
      }
    }

    loadUnreadCount();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // =========================================================
  // LOAD POPUP NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!user || !showNotifications) {
      return;
    }

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, href, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error) {
        setNotifications((data ?? []) as HeaderNotification[]);
      }
    }

    loadNotifications();
  }, [user, showNotifications, supabase]);

  // =========================================================
  // HIDE HEADER ON AUTH PAGES
  // =========================================================

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
          {/* PROFILE */}
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

          {/* NOTIFICATIONS */}
          {user && (
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() =>
                  setShowNotifications((current) => !current)
                }
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#171A35] transition hover:border-[#CFC8FF]"
              >
                <Bell size={16} strokeWidth={1.8} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#5D48D2] px-1 text-[9px] font-bold leading-none text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION POPUP */}
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-2xl border border-[#E3DED5] bg-white shadow-[0_12px_35px_rgba(23,32,68,0.14)]">
                  {/* POPUP HEADER */}
                  <div className="flex items-center justify-between border-b border-[#EEEAE3] px-4 py-3">
                    <div>
                      <p className="text-[12px] font-bold text-[#171A35]">
                        Notifications
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#858694]">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <Link
                      href="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-[9px] font-semibold text-[#5D48D2]"
                    >
                      View all
                    </Link>
                  </div>

                  {/* NO NOTIFICATIONS */}
                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <Bell
                        size={20}
                        className="mx-auto text-[#AAA7B2]"
                        strokeWidth={1.7}
                      />

                      <p className="mt-3 text-[11px] font-semibold text-[#4E5163]">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    /* NOTIFICATION LIST */
                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.href ?? "/notifications"}
                          onClick={async () => {
                            if (!notification.is_read) {
                              const { error } = await supabase
                                .from("notifications")
                                .update({ is_read: true })
                                .eq("id", notification.id);

                              if (!error) {
                                setUnreadCount((current) =>
                                  Math.max(0, current - 1)
                                );

                                setNotifications((current) =>
                                  current.map((item) =>
                                    item.id === notification.id
                                      ? {
                                          ...item,
                                          is_read: true,
                                        }
                                      : item
                                  )
                                );
                              }
                            }

                            setShowNotifications(false);
                          }}
                          className={`block border-b border-[#F0ECE5] px-4 py-3 transition hover:bg-[#FAF8F3] ${
                            !notification.is_read
                              ? "bg-[#F7F4FF]"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex gap-3">
                            {!notification.is_read ? (
                              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#5D48D2]" />
                            ) : (
                              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" />
                            )}

                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-[#252842]">
                                {notification.title}
                              </p>

                              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#777A8B]">
                                {notification.body}
                              </p>

                              <p className="mt-1.5 text-[8px] text-[#A0A0AA]">
                                {new Date(
                                  notification.created_at
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}