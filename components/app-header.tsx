"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  MessageCircle,
  UserRound,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type HeaderNotification = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/rent", label: "Rent" },
  { href: "/lost-found", label: "Lost & Found" },
  { href: "/services", label: "Services" },
  { href: "/chat", label: "Chat" },
];

function getInitials(user: User | null) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return user?.email?.slice(0, 2).toUpperCase() || "CL";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getDisplayName(user: User | null) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student"
  );
}

function formatNotificationDate(date: string) {
  const parsed = new Date(date);
  const now = new Date();

  const sameDay =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate();

  if (sameDay) {
    return parsed.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function AppHeader() {
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<User | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>(
    []
  );

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(currentUser);
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

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setChatCount(0);
      return;
    }

    const currentUser = user;
    let mounted = true;

    async function loadNotificationCount() {
      const { data, error } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("is_read", false);

      if (!error && mounted) {
        setNotificationCount(data?.length ?? 0);
      }
    }

    async function loadChatCount() {
      const { data, error } = await supabase.rpc("get_unread_chat_count");

      if (!error && mounted) {
        setChatCount(Number(data ?? 0));
      }
    }

    loadNotificationCount();
    loadChatCount();

    const notificationChannel = supabase
      .channel(`header-notifications-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          loadNotificationCount();
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel(`header-chat-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          loadChatCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "marketplace_messages",
        },
        () => {
          loadChatCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rent_messages",
        },
        () => {
          loadChatCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_messages",
        },
        () => {
          loadChatCount();
        }
      )
      .subscribe();

    const refreshChatCount = () => {
      loadChatCount();
    };

    window.addEventListener("chat-unread-refresh", refreshChatCount);

    return () => {
      mounted = false;
      window.removeEventListener("chat-unread-refresh", refreshChatCount);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [user, supabase]);

  useEffect(() => {
    if (!user || !showNotifications) {
      return;
    }

    const currentUser = user;

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, href, is_read, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error) {
        setNotifications((data ?? []) as HeaderNotification[]);
      }
    }

    loadNotifications();
  }, [user, showNotifications, supabase]);

  useEffect(() => {
    function closeMenus(event: MouseEvent) {
      const target = event.target as Node;

      if (!(target instanceof Node)) return;

      const element = event.target as HTMLElement;

      if (!element.closest("[data-header-menu]")) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", closeMenus);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
    };
  }, []);

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const firstName = getDisplayName(user).split(" ")[0];
  const initials = getInitials(user);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E3DA] bg-[#FBF9F4]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[64px] w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:h-[70px] lg:px-8">
        <Link
          href="/"
          aria-label="CampusLoop home"
          className="flex shrink-0 items-center"
        >
         <Image
  src="/logo.png"
  alt="CampusLoop"
  width={220}
  height={100}
  className="h-[54px] w-[170px] object-contain object-left"
  priority
/>
        </Link>

        <nav className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="flex items-center rounded-full border border-[#E6E1D8] bg-white/80 p-1">
            {navLinks.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              const isChat = item.href === "/chat";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold transition ${
                    active
                      ? "bg-[#20265F] text-white shadow-[0_4px_14px_rgba(32,38,95,0.16)]"
                      : "text-[#666A7B] hover:bg-[#F5F2EC] hover:text-[#20265F]"
                  }`}
                >
                  {item.label}

                  {isChat && chatCount > 0 && (
                    <span
                      className={`flex min-w-[16px] items-center justify-center rounded-full px-1 text-[8px] font-black leading-4 ${
                        active
                          ? "bg-white text-[#5D48D2]"
                          : "bg-[#5D48D2] text-white"
                      }`}
                    >
                      {chatCount > 99 ? "99+" : chatCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 md:hidden" />

        <div className="flex shrink-0 items-center gap-2" data-header-menu>
          {user && (
            <span className="hidden max-w-[110px] truncate text-[10px] font-bold text-[#676A7A] lg:block">
              Hi, {firstName}
            </span>
          )}

          {user && (
            <Link
              href="/chat"
              aria-label="Chat"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition md:hidden ${
                pathname.startsWith("/chat")
                  ? "border-[#CFC8FF] bg-[#F0ECFF] text-[#5D48D2]"
                  : "border-[#E1DDD4] bg-white text-[#3D4257] hover:border-[#CFC8FF]"
              }`}
            >
              <MessageCircle size={17} strokeWidth={1.9} />

              {chatCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-[17px] items-center justify-center rounded-full bg-[#5D48D2] px-1 text-[8px] font-black leading-[17px] text-white ring-2 ring-[#FBF9F4]">
                  {chatCount > 99 ? "99+" : chatCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications((current) => !current);
                  setShowProfileMenu(false);
                }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  showNotifications
                    ? "border-[#CFC8FF] bg-[#F0ECFF] text-[#5D48D2]"
                    : "border-[#E1DDD4] bg-white text-[#3D4257] hover:border-[#CFC8FF]"
                }`}
              >
                <Bell size={17} strokeWidth={1.8} />

                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-[17px] items-center justify-center rounded-full bg-[#5D48D2] px-1 text-[8px] font-black leading-[17px] text-white ring-2 ring-[#FBF9F4]">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed right-3 top-[72px] z-[60] w-[calc(100vw-24px)] max-w-[360px] overflow-hidden rounded-[20px] border border-[#E3DED5] bg-white shadow-[0_18px_45px_rgba(23,32,68,0.14)] md:absolute md:right-0 md:top-12 md:z-50">
                  <div className="flex items-center justify-between border-b border-[#EEEAE3] px-4 py-3.5">
                    <div>
                      <p className="text-[12px] font-black text-[#171A35]">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#858694]">
                        {notificationCount > 0
                          ? `${notificationCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-[9px] font-bold text-[#5D48D2]"
                      >
                        View all
                      </Link>

                      <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setShowNotifications(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F5EF] text-[#6C7080]"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F0ECFF] text-[#5D48D2]">
                        <Bell size={17} />
                      </div>
                      <p className="mt-3 text-[11px] font-bold text-[#4E5163]">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[390px] overflow-y-auto">
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
                                setNotificationCount((current) =>
                                  Math.max(0, current - 1)
                                );

                                setNotifications((current) =>
                                  current.map((item) =>
                                    item.id === notification.id
                                      ? { ...item, is_read: true }
                                      : item
                                  )
                                );
                              }
                            }

                            setShowNotifications(false);
                          }}
                          className={`block border-b border-[#F0ECE5] px-4 py-3.5 transition last:border-b-0 hover:bg-[#FAF8F3] ${
                            !notification.is_read
                              ? "bg-[#F8F6FF]"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex gap-3">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                !notification.is_read
                                  ? "bg-[#5D48D2]"
                                  : "bg-transparent"
                              }`}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-[#252842]">
                                {notification.title}
                              </p>

                              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#777A8B]">
                                {notification.body}
                              </p>

                              <p className="mt-1.5 text-[8px] text-[#A0A0AA]">
                                {formatNotificationDate(
                                  notification.created_at
                                )}
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
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#20265F] px-4 py-2 text-[10px] font-bold text-white transition hover:bg-[#171C4C]"
            >
              Sign in
            </Link>
          )}

          {user && (
            <div className="relative">
              <button
                type="button"
                aria-label="Open profile menu"
                onClick={() => {
                  setShowProfileMenu((current) => !current);
                  setShowNotifications(false);
                }}
                className={`flex h-10 items-center gap-2 rounded-full border px-1.5 pr-2.5 transition ${
                  showProfileMenu
                    ? "border-[#CFC8FF] bg-[#F0ECFF]"
                    : "border-[#E1DDD4] bg-white hover:border-[#CFC8FF]"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#EEE9FF] text-[8px] font-black text-[#5D48D2]">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>

                <ChevronDown
                  size={12}
                  className={`hidden text-[#73778A] transition sm:block ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-[190px] overflow-hidden rounded-[18px] border border-[#E3DED5] bg-white p-1.5 shadow-[0_16px_40px_rgba(23,32,68,0.14)]">
                  <div className="border-b border-[#F0ECE5] px-3 py-2.5">
                    <p className="truncate text-[10px] font-black text-[#252842]">
                      {getDisplayName(user)}
                    </p>
                    <p className="mt-0.5 truncate text-[8px] text-[#858796]">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="mt-1 flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[10px] font-bold text-[#45495C] hover:bg-[#F7F5EF]"
                  >
                    <UserRound size={14} />
                    Profile
                  </Link>

                  <Link
                    href="/chat"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between rounded-[12px] px-3 py-2.5 text-[10px] font-bold text-[#45495C] hover:bg-[#F7F5EF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageCircle size={14} />
                      Messages
                    </span>

                    {chatCount > 0 && (
                      <span className="rounded-full bg-[#5D48D2] px-1.5 py-0.5 text-[8px] font-black text-white">
                        {chatCount > 99 ? "99+" : chatCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}