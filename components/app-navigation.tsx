"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  ShoppingBag,
  Search,
  MessageCircle,
  CalendarDays,
  Wrench,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/rent", label: "Rent", icon: CalendarDays },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export default function AppNavigation() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  async function loadUnreadCount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { data, error } = await supabase.rpc(
      "get_unread_chat_count"
    );

    if (error) {
      console.error(
        "Error loading unread chat count:",
        error
      );
      return;
    }

    setUnreadCount(Number(data ?? 0));
  }

  useEffect(() => {
    loadUnreadCount();

    const refreshHandler = () => {
      loadUnreadCount();
    };

    window.addEventListener(
      "chat-unread-refresh",
      refreshHandler
    );

    const channel = supabase
      .channel("chat-unread-badge")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        refreshHandler
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "marketplace_messages",
        },
        refreshHandler
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rent_messages",
        },
        refreshHandler
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_messages",
        },
        refreshHandler
      )
      .subscribe();

    return () => {
      window.removeEventListener(
        "chat-unread-refresh",
        refreshHandler
      );

      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <nav
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        border-t
        border-[#E3DFD7]
        bg-white
        md:hidden
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[430px]
          px-2
          pt-1.5
          pb-[calc(6px+env(safe-area-inset-bottom))]
        "
      >
        <div className="grid grid-cols-6 items-center">
          {items.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/" &&
                pathname.startsWith(`${item.href}/`));

            const isChat = item.href === "/chat";

            return (
              <Link
                key={item.href}
                href={item.href}
                className="
                  relative
                  flex
                  min-w-0
                  flex-col
                  items-center
                  gap-1
                  px-1
                  py-1.5
                "
              >
                <div
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full transition ${
                    active
                      ? "bg-[#F0ECFF] text-[#5D48D2]"
                      : "text-[#858796]"
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2 : 1.7}
                  />

                  {isChat && unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#6350D8] px-1 text-[8px] font-bold leading-none text-white ring-2 ring-white">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </div>

                <span
                  className={`truncate text-[8px] font-medium ${
                    active
                      ? "text-[#5D48D2]"
                      : "text-[#858796]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}