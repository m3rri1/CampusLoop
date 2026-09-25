"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  related_report_id: string | null;
  related_claim_id: string | null;
  related_conversation_id: string | null;
  is_read: boolean;
  created_at: string;
};

const supabase = createClient();

function getIcon(type: string) {
  switch (type) {
    case "claim_received":
      return <UserCheck size={17} strokeWidth={1.9} />;

    case "claim_approved":
      return <ShieldCheck size={17} strokeWidth={1.9} />;

    case "claim_rejected":
      return <X size={17} strokeWidth={1.9} />;

    case "new_message":
      return <MessageCircle size={17} strokeWidth={1.9} />;

    case "handover_verified":
      return <Check size={17} strokeWidth={2} />;

    case "handover_completed":
      return <PackageCheck size={17} strokeWidth={1.9} />;

    default:
      return <Bell size={17} strokeWidth={1.9} />;
  }
}

function getIconStyle(type: string) {
  switch (type) {
    case "claim_rejected":
      return "bg-[#FFF0F0] text-[#C94A4A]";

    case "handover_verified":
    case "handover_completed":
      return "bg-[#EDF8F0] text-[#2F8A4D]";

    case "new_message":
      return "bg-[#F0ECFF] text-[#5D48D2]";

    default:
      return "bg-[#F0ECFF] text-[#5D48D2]";
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
            id,
            type,
            title,
            body,
            href,
            related_report_id,
            related_claim_id,
            related_conversation_id,
            is_read,
            created_at
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && mounted) {
        setNotifications(data ?? []);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-page-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabase
            .from("notifications")
            .select(
              `
                id,
                type,
                title,
                body,
                href,
                related_report_id,
                related_claim_id,
                related_conversation_id,
                is_read,
                created_at
              `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          setNotifications(data ?? []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const today = useMemo(() => {
    const now = new Date();

    return notifications.filter((notification) => {
      const date = new Date(notification.created_at);

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [notifications]);

  const earlier = useMemo(() => {
    const todayIds = new Set(today.map((item) => item.id));

    return notifications.filter((item) => !todayIds.has(item.id));
  }, [notifications, today]);

  async function markAsRead(notification: Notification) {
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    }

    if (notification.href) {
      router.push(notification.href);
    }
  }

  async function markAllAsRead() {
    if (!userId || unreadCount === 0) return;

    setMarkingAll(true);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) {
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    }

    setMarkingAll(false);
  }

  function renderNotification(notification: Notification) {
    return (
      <button
        key={notification.id}
        type="button"
        onClick={() => markAsRead(notification)}
        className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
          notification.is_read
            ? "border-[#E9E5DC] bg-white hover:border-[#D8D1C4]"
            : "border-[#D9D1FF] bg-[#F7F4FF] hover:border-[#BFB7F4]"
        }`}
      >
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconStyle(
            notification.type
          )}`}
        >
          {getIcon(notification.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={`text-[13px] ${
                notification.is_read
                  ? "font-semibold text-[#272A42]"
                  : "font-bold text-[#20234D]"
              }`}
            >
              {notification.title}
            </p>

            {!notification.is_read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#5D48D2]" />
            )}
          </div>

          <p className="mt-1 text-[12px] leading-5 text-[#727487]">
            {notification.body}
          </p>

          <p className="mt-2 text-[10px] font-medium text-[#A0A0AC]">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </button>
    );
  }

  return (
    <main className="min-h-[calc(100vh-58px)] bg-[#FBF9F4]">
      <div className="mx-auto w-full max-w-[800px] px-5 py-6 sm:px-8 sm:py-10">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DED5] bg-white text-[#23265B] transition hover:border-[#CFC8FF]"
            >
              <ArrowLeft size={16} strokeWidth={1.9} />
            </Link>

            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#171A35]">
                Notifications
              </h1>

              <p className="mt-0.5 text-[11px] text-[#858694]">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD6CB] bg-white px-3 py-2 text-[10px] font-semibold text-[#4E5060] transition hover:border-[#CFC8FF] hover:text-[#5D48D2] disabled:opacity-50"
            >
              <CheckCheck size={13} />
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[86px] animate-pulse rounded-2xl border border-[#E9E5DC] bg-white"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-[#E8E3D9] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0ECFF] text-[#5D48D2]">
              <Bell size={23} strokeWidth={1.8} />
            </div>

            <h2 className="mt-4 text-[15px] font-semibold text-[#252842]">
              No notifications yet
            </h2>

            <p className="mx-auto mt-1.5 max-w-[320px] text-[11px] leading-5 text-[#858694]">
              When someone claims your item, messages you, or completes a
              handover, you'll see it here.
            </p>

            <Link
              href="/lost-found"
              className="mt-5 inline-flex rounded-full bg-[#23265B] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1D204F]"
            >
              Browse Lost & Found
            </Link>
          </div>
        ) : (
          <div className="space-y-7">
            {today.length > 0 && (
              <section>
                <h2 className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#96969F]">
                  Today
                </h2>

                <div className="space-y-2.5">
                  {today.map(renderNotification)}
                </div>
              </section>
            )}

            {earlier.length > 0 && (
              <section>
                <h2 className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#96969F]">
                  Earlier
                </h2>

                <div className="space-y-2.5">
                  {earlier.map(renderNotification)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}