"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  MessageCircle,
  Package,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RentRequest = {
  id: string;
  item_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  days: number;
  daily_rent: number;
  deposit: number;
  total_rent: number;
  total_amount: number;
  status: string;
  created_at: string;
};

type RentItem = {
  id: string;
  title: string;
  image_url: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
};

type RentConversation = {
  id: string;
  request_id: string;
};

const tabs = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["active", "Active"],
  ["rejected", "Rejected"],
  ["returned", "Returned"],
  ["all", "All"],
] as const;

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    active: "Active",
    rejected: "Rejected",
    returned: "Returned",
    cancelled: "Cancelled",
  };

  return labels[status] ?? status;
}

function getStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-[#FFF4DB] text-[#9A6A14]";
    case "rejected":
    case "cancelled":
      return "bg-[#FFF0F0] text-[#A33A3A]";
    case "approved":
    case "active":
      return "bg-[#EEF8F2] text-[#367353]";
    case "returned":
      return "bg-[#EEF2FA] text-[#526582]";
    default:
      return "bg-[#F1F0F4] text-[#666978]";
  }
}

export default function RentRequestsPage() {
  const [supabase] = useState(() => createClient());

  const [requests, setRequests] = useState<RentRequest[]>([]);
  const [items, setItems] = useState<Record<string, RentItem>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [conversations, setConversations] = useState<
    Record<string, RentConversation>
  >({});

  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setError("Please sign in to manage rental requests.");
          setLoading(false);
        }
        return;
      }

      const { data: requestData, error: requestError } = await supabase
        .from("rent_requests")
        .select(
          "id, item_id, renter_id, owner_id, start_date, end_date, days, daily_rent, deposit, total_rent, total_amount, status, created_at"
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (requestError) {
        if (mounted) {
          setError(requestError.message);
          setLoading(false);
        }
        return;
      }

      const requestRows = (requestData ?? []) as RentRequest[];

      if (!mounted) return;

      setRequests(requestRows);

      const itemIds = Array.from(
        new Set(requestRows.map((request) => request.item_id))
      );

      const renterIds = Array.from(
        new Set(requestRows.map((request) => request.renter_id))
      );

      const requestIds = requestRows.map((request) => request.id);

      if (itemIds.length > 0) {
        const { data: itemData } = await supabase
          .from("borrow_items")
          .select("id, title, image_url")
          .in("id", itemIds);

        if (mounted && itemData) {
          const itemMap: Record<string, RentItem> = {};

          (itemData as RentItem[]).forEach((item) => {
            itemMap[item.id] = item;
          });

          setItems(itemMap);
        }
      }

      if (renterIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", renterIds);

        if (mounted && profileData) {
          const profileMap: Record<string, Profile> = {};

          (profileData as Profile[]).forEach((profile) => {
            profileMap[profile.id] = profile;
          });

          setProfiles(profileMap);
        }
      }

      if (requestIds.length > 0) {
        const { data: conversationData } = await supabase
          .from("rent_conversations")
          .select("id, request_id")
          .in("request_id", requestIds);

        if (mounted && conversationData) {
          const conversationMap: Record<string, RentConversation> = {};

          (conversationData as RentConversation[]).forEach((conversation) => {
            conversationMap[conversation.request_id] = conversation;
          });

          setConversations(conversationMap);
        }
      } else {
        setConversations({});
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const filteredRequests = useMemo(() => {
    if (tab === "all") return requests;

    return requests.filter((request) => {
      if (tab === "approved") {
        return request.status === "approved";
      }

      return request.status === tab;
    });
  }, [requests, tab]);

  async function handleDecision(
    requestId: string,
    decision: "approve" | "reject"
  ) {
    setError("");
    setWorkingId(requestId);

    const functionName =
      decision === "approve"
        ? "approve_rent_request"
        : "reject_rent_request";

    const { error: rpcError } = await supabase.rpc(functionName, {
      p_request_id: requestId,
    });

    if (rpcError) {
      setError(rpcError.message);
      setWorkingId(null);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: decision === "approve" ? "approved" : "rejected",
            }
          : request
      )
    );

    setWorkingId(null);
  }

  async function handleStart(requestId: string) {
    setError("");
    setWorkingId(requestId);

    const { error: rpcError } = await supabase.rpc("start_rent_request", {
      p_request_id: requestId,
    });

    if (rpcError) {
      setError(rpcError.message);
      setWorkingId(null);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "active" }
          : request
      )
    );

    setWorkingId(null);
  }

  async function handleReturn(requestId: string) {
    setError("");
    setWorkingId(requestId);

    const { error: rpcError } = await supabase.rpc(
      "complete_rent_request",
      {
        p_request_id: requestId,
      }
    );

    if (rpcError) {
      setError(rpcError.message);
      setWorkingId(null);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "returned" }
          : request
      )
    );

    setWorkingId(null);
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#FBF9F4] px-5 pb-28 pt-5 sm:px-8 sm:pt-8">
        <Link
          href="/rent"
          className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870] transition hover:border-[#CFC5F4] hover:text-[#6546D9]"
        >
          <ArrowLeft size={15} />
          Rent
        </Link>

        <div className="mt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6546D9]">
            Owner dashboard
          </p>

          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.045em] text-[#17233D]">
            Rental requests
          </h1>

          <p className="mt-1 text-[12px] font-medium text-[#858796]">
            Review students requesting to rent your items.
          </p>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-bold transition ${
                tab === id
                  ? "bg-[#20265F] text-white"
                  : "border border-[#DDD9D1] bg-white text-[#676B7A] hover:border-[#CFC8FF]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-5 rounded-[16px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-[#E3DFD7] bg-white p-5"
              >
                <div className="h-4 w-1/3 animate-pulse rounded bg-[#E9E5DC]" />
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-[#EFECE5]" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#EFECE5]" />
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-[#D3CFC6] bg-white/60 px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE7FA] text-[#6546D9]">
              <Package size={20} />
            </div>

            <h2 className="mt-4 text-[16px] font-bold text-[#202540]">
              No {tab === "all" ? "" : tab} requests
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-[#858796]">
              Requests for your rental items will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredRequests.map((request) => {
              const item = items[request.item_id];

              const renter =
                profiles[request.renter_id]?.full_name || "Campus student";

              const conversation = conversations[request.id];

              const isWorking = workingId === request.id;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-[22px] border border-[#E3DFD7] bg-white shadow-[0_5px_20px_rgba(23,32,68,0.04)]"
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[15px] bg-[#E9E5DC] sm:h-24 sm:w-24">
                      {item?.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#8B8D98]">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6546D9]">
                            Rental request
                          </p>

                          <h2 className="mt-1 line-clamp-2 text-[14px] font-extrabold text-[#202540]">
                            {item?.title || "Rental item"}
                          </h2>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1.5 text-[9px] font-bold ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[10px] font-medium text-[#777A8B]">
                        <span>Requested by</span>
                        <span className="font-bold text-[#45495A]">
                          {renter}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-[#777A8B]">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatDate(request.start_date)} –{" "}
                          {formatDate(request.end_date)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 size={11} />
                          {request.days}{" "}
                          {request.days === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#ECE9E2] bg-[#FAF8F3] px-4 py-4 sm:px-5">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[9px] font-medium text-[#898C98]">
                          Rent
                        </p>

                        <p className="mt-1 text-[12px] font-extrabold text-[#34384A]">
                          ₹
                          {Number(request.total_rent).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-medium text-[#898C98]">
                          Deposit
                        </p>

                        <p className="mt-1 text-[12px] font-extrabold text-[#34384A]">
                          ₹
                          {Number(request.deposit).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-medium text-[#898C98]">
                          Total
                        </p>

                        <p className="mt-1 text-[14px] font-extrabold text-[#6546D9]">
                          ₹
                          {Number(request.total_amount).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    {conversation && (
                      <Link
                        href={`/chat?type=rent&conversation=${conversation.id}`}
                        className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-[13px] border border-[#DAD1FF] bg-[#F4F1FF] text-[10px] font-bold text-[#5D48D2] transition hover:bg-[#EEE9FF]"
                      >
                        <MessageCircle size={14} />
                        Chat with renter
                      </Link>
                    )}

                    {request.status === "pending" && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleDecision(request.id, "reject")
                          }
                          disabled={isWorking}
                          className="flex h-11 items-center justify-center gap-1.5 rounded-[13px] border border-[#E4CACA] bg-white text-[11px] font-bold text-[#A33A3A] transition hover:bg-[#FFF5F5] disabled:opacity-50"
                        >
                          <X size={14} />
                          {isWorking ? "Working..." : "Reject"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDecision(request.id, "approve")
                          }
                          disabled={isWorking}
                          className="flex h-11 items-center justify-center gap-1.5 rounded-[13px] bg-[#6546D9] text-[11px] font-bold text-white shadow-[0_5px_15px_rgba(101,70,217,0.16)] transition hover:bg-[#5839C8] disabled:opacity-50"
                        >
                          <Check size={14} />
                          {isWorking ? "Working..." : "Approve"}
                        </button>
                      </div>
                    )}

                    {request.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => handleStart(request.id)}
                        disabled={isWorking}
                        className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-[13px] bg-[#6546D9] text-[11px] font-bold text-white shadow-[0_5px_15px_rgba(101,70,217,0.16)] transition hover:bg-[#5839C8] disabled:opacity-50"
                      >
                        <Play size={14} />
                        {isWorking ? "Starting..." : "Start rental"}
                      </button>
                    )}

                    {request.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handleReturn(request.id)}
                        disabled={isWorking}
                        className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-[13px] border border-[#CFE1D7] bg-[#F2FAF5] text-[11px] font-bold text-[#367353] transition hover:bg-[#EAF7EF] disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        {isWorking ? "Updating..." : "Mark returned"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
