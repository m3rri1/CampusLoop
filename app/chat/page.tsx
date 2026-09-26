"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  MessageCircle,
  Package,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  report_id: string;
  claim_id: string;
  reporter_id: string;
  claimant_id: string;
  created_at: string;
  last_message_at: string;
};

type MarketplaceConversation = {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  created_at: string;
  last_message_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Report = {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  type: "lost" | "found";
  status: "active" | "claimed" | "returned";
};

type MarketplaceListing = {
  id: string;
  title: string;
  image_url: string | null;
  status: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function ChatPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [marketplaceConversations, setMarketplaceConversations] = useState<
    MarketplaceConversation[]
  >([]);

  const [reports, setReports] = useState<Record<string, Report>>({});
  const [marketplaceListings, setMarketplaceListings] = useState<
    Record<string, MarketplaceListing>
  >({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [selectedMarketplaceConversation, setSelectedMarketplaceConversation] =
    useState<MarketplaceConversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ALL CONVERSATION DATA
  // =========================================================

  async function loadConversationData(currentUserId: string) {
    const { data: conversationData, error: conversationError } =
      await supabase
        .from("conversations")
        .select(
          "id, report_id, claim_id, reporter_id, claimant_id, created_at, last_message_at"
        )
        .order("last_message_at", { ascending: false });

    if (conversationError) {
      throw new Error(conversationError.message);
    }

    const { data: marketplaceData, error: marketplaceError } =
      await supabase
        .from("marketplace_conversations")
        .select(
          "id, listing_id, seller_id, buyer_id, created_at, last_message_at"
        )
        .order("last_message_at", { ascending: false });

    if (marketplaceError) {
      throw new Error(marketplaceError.message);
    }

    const conversationList =
      (conversationData ?? []) as Conversation[];

    const marketplaceConversationList =
      (marketplaceData ?? []) as MarketplaceConversation[];

    setConversations(conversationList);
    setMarketplaceConversations(marketplaceConversationList);

    // =======================================================
    // LOST & FOUND REPORTS
    // =======================================================

    const reportIds = Array.from(
      new Set(
        conversationList.map(
          (conversation) => conversation.report_id
        )
      )
    );

    if (reportIds.length > 0) {
      const { data: reportData, error: reportError } =
        await supabase
          .from("lost_found_reports")
          .select(
            "id, title, image_url, category, type, status"
          )
          .in("id", reportIds);

      if (reportError) {
        throw new Error(reportError.message);
      }

      const reportMap: Record<string, Report> = {};

      (reportData ?? []).forEach((report) => {
        const item = report as Report;
        reportMap[item.id] = item;
      });

      setReports(reportMap);
    } else {
      setReports({});
    }

    // =======================================================
    // MARKETPLACE LISTINGS
    // =======================================================

    const listingIds = Array.from(
      new Set(
        marketplaceConversationList.map(
          (conversation) => conversation.listing_id
        )
      )
    );

    if (listingIds.length > 0) {
      const { data: listingData, error: listingError } =
        await supabase
          .from("marketplace_listings")
          .select("id, title, image_url, status")
          .in("id", listingIds);

      if (listingError) {
        throw new Error(listingError.message);
      }

      const listingMap: Record<string, MarketplaceListing> =
        {};

      (listingData ?? []).forEach((listing) => {
        const item = listing as MarketplaceListing;
        listingMap[item.id] = item;
      });

      setMarketplaceListings(listingMap);
    } else {
      setMarketplaceListings({});
    }

    // =======================================================
    // PARTNER PROFILES
    // =======================================================

    const lostFoundPartnerIds = conversationList.map(
      (conversation) =>
        conversation.reporter_id === currentUserId
          ? conversation.claimant_id
          : conversation.reporter_id
    );

    const marketplacePartnerIds = marketplaceConversationList.map(
      (conversation) =>
        conversation.seller_id === currentUserId
          ? conversation.buyer_id
          : conversation.seller_id
    );

    const partnerIds = Array.from(
      new Set([
        ...lostFoundPartnerIds,
        ...marketplacePartnerIds,
      ])
    );

    if (partnerIds.length > 0) {
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", partnerIds);

      if (profileError) {
        throw new Error(profileError.message);
      }

      const profileMap: Record<string, Profile> = {};

      (profileData ?? []).forEach((profile) => {
        const item = profile as Profile;
        profileMap[item.id] = item;
      });

      setProfiles(profileMap);
    } else {
      setProfiles({});
    }

    return {
      conversationList,
      marketplaceConversationList,
    };
  }

  // =========================================================
  // OPEN LOST & FOUND CONVERSATION
  // =========================================================

  async function openConversation(conversation: Conversation) {
    setSelectedMarketplaceConversation(null);
    setSelectedConversation(conversation);
    setMessages([]);
    setError("");
    setMessagesLoading(true);

    const { data, error: messageError } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, sender_id, body, created_at"
      )
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      setError(messageError.message);
    } else {
      setMessages((data ?? []) as Message[]);
    }

    setMessagesLoading(false);
  }

  // =========================================================
  // OPEN MARKETPLACE CONVERSATION
  // =========================================================

  async function openMarketplaceConversation(
    conversation: MarketplaceConversation
  ) {
    setSelectedConversation(null);
    setSelectedMarketplaceConversation(conversation);
    setMessages([]);
    setError("");
    setMessagesLoading(true);

    const { data, error: messageError } = await supabase
      .from("marketplace_messages")
      .select(
        "id, conversation_id, sender_id, body, created_at"
      )
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      setError(messageError.message);
    } else {
      setMessages((data ?? []) as Message[]);
    }

    setMessagesLoading(false);
  }

  // =========================================================
  // INITIALIZE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login?redirect=/chat");
          return;
        }

        if (!mounted) return;

        setUserId(user.id);

        const {
          conversationList,
          marketplaceConversationList,
        } = await loadConversationData(user.id);

        if (!mounted) return;

        // ---------------------------------------------------
        // OPEN A SPECIFIC CHAT ONLY WHEN URL REQUESTS IT
        // ---------------------------------------------------

        const params = new URLSearchParams(
          window.location.search
        );

        const requestedType = params.get("type");
        const requestedConversation =
          params.get("conversation");

        if (requestedConversation) {
          if (requestedType === "marketplace") {
            const marketplaceConversation =
              marketplaceConversationList.find(
                (conversation) =>
                  conversation.id === requestedConversation
              );

            if (marketplaceConversation) {
              await openMarketplaceConversation(
                marketplaceConversation
              );
            } else {
              setError(
                "That marketplace conversation could not be found."
              );
            }
          } else {
            const lostFoundConversation =
              conversationList.find(
                (conversation) =>
                  conversation.id === requestedConversation
              );

            if (lostFoundConversation) {
              await openConversation(lostFoundConversation);
            } else {
              setError(
                "That conversation could not be found."
              );
            }
          }
        }
      } catch (error) {
        if (!mounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Could not load your chats."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  // =========================================================
  // REALTIME
  // =========================================================

  useEffect(() => {
    if (
      !selectedConversation &&
      !selectedMarketplaceConversation
    ) {
      return;
    }

    const isMarketplace =
      !!selectedMarketplaceConversation;

    const conversationId = isMarketplace
      ? selectedMarketplaceConversation.id
      : selectedConversation!.id;

    const table = isMarketplace
      ? "marketplace_messages"
      : "messages";

    const channel = supabase
      .channel(
        `${isMarketplace ? "marketplace" : "campusloop"}-chat-${conversationId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;

          setMessages((current) => {
            if (
              current.some(
                (message) => message.id === incoming.id
              )
            ) {
              return current;
            }

            return [...current, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    selectedConversation,
    selectedMarketplaceConversation,
    supabase,
  ]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function sendMessage() {
    const body = messageText.trim();

    if (
      !body ||
      !userId ||
      sending ||
      (!selectedConversation &&
        !selectedMarketplaceConversation)
    ) {
      return;
    }

    setSending(true);
    setError("");

    const isMarketplace =
      !!selectedMarketplaceConversation;

    const conversationId = isMarketplace
      ? selectedMarketplaceConversation.id
      : selectedConversation!.id;

    const table = isMarketplace
      ? "marketplace_messages"
      : "messages";

    const { data, error: insertError } = await supabase
      .from(table)
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body,
      })
      .select(
        "id, conversation_id, sender_id, body, created_at"
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }

    if (data) {
      const newMessage = data as Message;

      setMessages((current) => {
        if (
          current.some(
            (message) => message.id === newMessage.id
          )
        ) {
          return current;
        }

        return [...current, newMessage];
      });
    }

    // Update the correct conversation timestamp.
    if (isMarketplace) {
      await supabase
        .from("marketplace_conversations")
        .update({
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    } else {
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    setMessageText("");
    setSending(false);
  }

  // =========================================================
  // LOST & FOUND HELPERS
  // =========================================================

  function partnerId(conversation: Conversation) {
    return conversation.reporter_id === userId
      ? conversation.claimant_id
      : conversation.reporter_id;
  }

  function partnerName(conversation: Conversation) {
    return (
      profiles[partnerId(conversation)]?.full_name ||
      "CampusLoop student"
    );
  }

  function reportFor(conversation: Conversation) {
    return reports[conversation.report_id];
  }

  // =========================================================
  // MARKETPLACE HELPERS
  // =========================================================

  function marketplacePartnerId(
    conversation: MarketplaceConversation
  ) {
    return conversation.seller_id === userId
      ? conversation.buyer_id
      : conversation.seller_id;
  }

  function marketplacePartnerName(
    conversation: MarketplaceConversation
  ) {
    return (
      profiles[
        marketplacePartnerId(conversation)
      ]?.full_name || "CampusLoop student"
    );
  }

  function listingFor(
    conversation: MarketplaceConversation
  ) {
    return marketplaceListings[conversation.listing_id];
  }

  // =========================================================
  // FORMATTING
  // =========================================================

  function formatConversationDate(date: string) {
    const parsed = new Date(date);
    const now = new Date();

    if (parsed.toDateString() === now.toDateString()) {
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

  function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // =========================================================
  // SELECTED CHAT DATA
  // =========================================================

  const selectedReport = selectedConversation
    ? reportFor(selectedConversation)
    : null;

  const selectedListing =
    selectedMarketplaceConversation
      ? listingFor(selectedMarketplaceConversation)
      : null;

  const selectedPartner = selectedConversation
    ? partnerName(selectedConversation)
    : selectedMarketplaceConversation
      ? marketplacePartnerName(
          selectedMarketplaceConversation
        )
      : "";

  const selectedTitle = selectedConversation
    ? selectedReport?.title || "Lost & Found item"
    : selectedMarketplaceConversation
      ? selectedListing?.title || "Marketplace item"
      : "";

  const isSelectedLostFound =
    !!selectedConversation && !!selectedReport;

  const isSelectedMarketplace =
    !!selectedMarketplaceConversation && !!selectedListing;

  const canUseHandover =
    isSelectedLostFound &&
    !!selectedReport &&
    selectedReport.status !== "active";

  const conversationCount =
    conversations.length +
    marketplaceConversations.length;

  const emptyMessage = useMemo(() => {
    return conversationCount === 0
      ? "Approved Lost & Found claims and marketplace chats will appear here."
      : "Select a conversation to start messaging.";
  }, [conversationCount]);

  const hasAnyConversations =
    conversations.length > 0 ||
    marketplaceConversations.length > 0;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FBF9F4]">
          <div className="flex min-h-[70vh] items-center justify-center px-6">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />

              <p className="mt-4 text-[11px] font-semibold text-[#777A8B]">
                Loading chats...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen w-full max-w-[1280px] bg-[#FBF9F4] pb-[82px]">

        {/* ==================================================
            PAGE TITLE
        ================================================== */}

        <section className="border-b border-[#E5E1D8] bg-[#FBF9F4] px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">
                Messages
              </p>

              <h1 className="mt-1 text-[27px] font-bold tracking-[-0.055em]">
                Chat
              </h1>
            </div>

            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1DDD4] bg-white text-[#555A6D]"
              aria-label="Back home"
            >
              <ArrowLeft size={15} />
            </Link>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8">
            <div className="rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
              {error}
            </div>
          </div>
        )}

        {/* ==================================================
            MAIN CHAT AREA
        ================================================== */}

        <div className="mx-auto mt-4 flex max-w-5xl overflow-hidden border-y border-[#E5E1D8] bg-white md:min-h-[650px] md:rounded-[22px] md:border">

          {/* ==================================================
              CONVERSATION LIST
          ================================================== */}

          <aside
            className={`w-full shrink-0 bg-white md:block md:w-[330px] md:border-r md:border-[#E5E1D8] ${
              selectedConversation ||
              selectedMarketplaceConversation
                ? "hidden"
                : "block"
            }`}
          >
            {/* LIST HEADER */}

            <div className="border-b border-[#EEEAE2] px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#858796]">
                  Conversations
                </p>

                {conversationCount > 0 && (
                  <span className="rounded-full bg-[#F0ECFF] px-2.5 py-1 text-[8px] font-bold text-[#5D48D2]">
                    {conversationCount}
                  </span>
                )}
              </div>
            </div>

            {!hasAnyConversations ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center px-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEE9FF] text-[#5D48D2]">
                  <MessageCircle size={23} />
                </div>

                <h2 className="mt-4 text-[14px] font-bold">
                  No conversations yet
                </h2>

                <p className="mt-1 max-w-[235px] text-[10.5px] leading-5 text-[#858796]">
                  {emptyMessage}
                </p>

                <Link
                  href="/marketplace"
                  className="mt-5 flex h-10 items-center justify-center rounded-[12px] bg-[#292B68] px-4 text-[10.5px] font-bold text-white"
                >
                  Browse marketplace
                </Link>
              </div>
            ) : (
              <div>

                {/* ==================================================
                    LOST & FOUND
                ================================================== */}

                {conversations.length > 0 && (
                  <>
                    <div className="border-b border-[#F0ECE5] bg-[#FAF8F3] px-5 py-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#858796]">
                        Lost &amp; Found
                      </p>
                    </div>

                    {conversations.map((conversation) => {
                      const report =
                        reportFor(conversation);

                      const name =
                        partnerName(conversation);

                      const active =
                        selectedConversation?.id ===
                        conversation.id;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() =>
                            openConversation(conversation)
                          }
                          className={`flex w-full items-center gap-3 border-b border-[#F0ECE5] px-5 py-4 text-left transition ${
                            active
                              ? "bg-[#F3F0FF]"
                              : "bg-white hover:bg-[#FAF8F3]"
                          }`}
                        >
                          {/* IMAGE */}

                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                            {report?.image_url ? (
                              <img
                                src={report.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={18} />
                            )}
                          </div>

                          {/* TEXT */}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[12px] font-bold text-[#172044]">
                                {name}
                              </p>

                              <span className="shrink-0 text-[8px] text-[#A0A0AA]">
                                {formatConversationDate(
                                  conversation.last_message_at
                                )}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-[10px] font-bold text-[#5D48D2]">
                              {report?.title ||
                                "Lost & Found item"}
                            </p>

                            <p className="mt-0.5 truncate text-[9px] text-[#858796]">
                              Lost &amp; Found handover
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* ==================================================
                    MARKETPLACE
                ================================================== */}

                {marketplaceConversations.length > 0 && (
                  <>
                    <div className="border-b border-[#F0ECE5] bg-[#FAF8F3] px-5 py-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#858796]">
                        Marketplace
                      </p>
                    </div>

                    {marketplaceConversations.map(
                      (conversation) => {
                        const listing =
                          listingFor(conversation);

                        const name =
                          marketplacePartnerName(
                            conversation
                          );

                        const active =
                          selectedMarketplaceConversation?.id ===
                          conversation.id;

                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() =>
                              openMarketplaceConversation(
                                conversation
                              )
                            }
                            className={`flex w-full items-center gap-3 border-b border-[#F0ECE5] px-5 py-4 text-left transition ${
                              active
                                ? "bg-[#F3F0FF]"
                                : "bg-white hover:bg-[#FAF8F3]"
                            }`}
                          >
                            {/* IMAGE */}

                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">
                              {listing?.image_url ? (
                                <img
                                  src={listing.image_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={18} />
                              )}
                            </div>

                            {/* TEXT */}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[12px] font-bold text-[#172044]">
                                  {name}
                                </p>

                                <span className="shrink-0 text-[8px] text-[#A0A0AA]">
                                  {formatConversationDate(
                                    conversation.last_message_at
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 truncate text-[10px] font-bold text-[#5D48D2]">
                                {listing?.title ||
                                  "Marketplace item"}
                              </p>

                              <p className="mt-0.5 truncate text-[9px] text-[#858796]">
                                Marketplace conversation
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </>
                )}
              </div>
            )}
          </aside>

          {/* ==================================================
              CHAT PANEL
          ================================================== */}

          <section
            className={`min-w-0 flex-1 flex-col bg-[#FCFBF8] ${
              selectedConversation ||
              selectedMarketplaceConversation
                ? "flex"
                : "hidden md:flex"
            }`}
          >

            {/* EMPTY DESKTOP STATE */}

            {!selectedConversation &&
            !selectedMarketplaceConversation ? (
              <div className="hidden flex-1 items-center justify-center text-center md:flex">
                <div className="px-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F0EDF8] text-[#7D7A90]">
                    <MessageCircle size={23} />
                  </div>

                  <h2 className="mt-4 text-[14px] font-bold">
                    Select a conversation
                  </h2>

                  <p className="mt-1 text-[10.5px] text-[#858796]">
                    Your messages will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ==================================================
                    CHAT HEADER
                ================================================== */}

                <header className="border-b border-[#E5E1D8] bg-white">
                  <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">

                    {/* MOBILE BACK */}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConversation(null);
                        setSelectedMarketplaceConversation(
                          null
                        );
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#555A6D] hover:bg-[#F4F1EA] md:hidden"
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={19} />
                    </button>

                    {/* IMAGE */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#EEE9FF] text-[#5D48D2]">
                      {isSelectedMarketplace &&
                      selectedListing?.image_url ? (
                        <img
                          src={selectedListing.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : selectedReport?.image_url ? (
                        <img
                          src={selectedReport.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={17} />
                      )}
                    </div>

                    {/* NAME */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-[#172044]">
                        {selectedPartner}
                      </p>

                      <p className="truncate text-[10px] text-[#6952D7]">
                        {selectedTitle}
                      </p>
                    </div>

                    {/* LOST & FOUND HANDOVER */}

                    {canUseHandover &&
                      selectedConversation && (
                        <Link
                          href={`/lost-found/${selectedConversation.report_id}/verify`}
                          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#DAD1FF] bg-[#F3F0FF] px-3 py-2 text-[9px] font-bold text-[#5D48D2]"
                        >
                          <ShieldCheck size={12} />

                          <span>
                            Secure handover
                          </span>
                        </Link>
                      )}
                  </div>

                  {/* CONTEXT STRIP */}

                  <div className="border-t border-[#F0ECE5] bg-[#FAF8F3] px-4 py-2.5 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <ShieldCheck
                          size={12}
                          className="shrink-0 text-[#6952D7]"
                        />

                        <p className="truncate text-[9px] text-[#6F7384]">
                          This conversation is about a{" "}
                          <span className="font-bold text-[#4A4E63]">
                            {isSelectedMarketplace
                              ? "Marketplace listing"
                              : "Lost & Found item"}
                          </span>
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#EAF6ED] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#287A47]">
                        {isSelectedMarketplace
                          ? "BUY / SELL"
                          : "APPROVED"}
                      </span>
                    </div>
                  </div>
                </header>

                {/* ==================================================
                    MESSAGES
                ================================================== */}

                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                  {messagesLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />

                        <p className="mt-3 text-[10px] text-[#858796]">
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex min-h-[440px] items-center justify-center px-7 text-center">
                      <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F0EDF8] text-[#7D7A90]">
                          <MessageCircle size={20} />
                        </div>

                        <h2 className="mt-4 text-[13px] font-bold">
                          Start the conversation
                        </h2>

                        <p className="mx-auto mt-1 max-w-[250px] text-[10.5px] leading-5 text-[#858796]">
                          {isSelectedMarketplace
                            ? `Ask ${selectedPartner} about this listing.`
                            : `Arrange a safe campus handover with ${selectedPartner}.`}
                        </p>

                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F5F2FF] px-3 py-1.5 text-[8px] font-semibold text-[#6952D7]">
                          <ShieldCheck size={11} />

                          {isSelectedMarketplace
                            ? "Keep personal information private"
                            : "Arrange handovers safely"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => {
                        const mine =
                          message.sender_id === userId;

                        const previous = messages[index - 1];

                        const sameSender =
                          previous?.sender_id ===
                          message.sender_id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              mine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[78%] ${
                                mine
                                  ? sameSender
                                    ? "rounded-[17px] rounded-br-[6px] bg-[#292B68] text-white"
                                    : "rounded-[18px] rounded-br-[6px] bg-[#292B68] text-white"
                                  : sameSender
                                    ? "rounded-[17px] rounded-bl-[6px] border border-[#E4E0D8] bg-white text-[#42465A]"
                                    : "rounded-[18px] rounded-bl-[6px] border border-[#E4E0D8] bg-white text-[#42465A]"
                              } px-4 py-2.5`}
                            >
                              <p className="whitespace-pre-wrap text-[12px] leading-[1.55]">
                                {message.body}
                              </p>

                              <div
                                className={`mt-1 flex items-center justify-end gap-1 ${
                                  mine
                                    ? "text-white/55"
                                    : "text-[#A0A0AA]"
                                }`}
                              >
                                <span className="text-[7.5px]">
                                  {formatMessageTime(
                                    message.created_at
                                  )}
                                </span>

                                {mine && (
                                  <Check size={9} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ==================================================
                    COMPOSER
                ================================================== */}

                <div className="border-t border-[#E5E1D8] bg-white px-3.5 py-3 sm:px-4">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={1}
                      placeholder="Write a message..."
                      className="max-h-28 min-h-[45px] flex-1 resize-none rounded-[15px] border border-[#DCD8D0] bg-[#FAF8F3] px-4 py-3 text-[12px] leading-5 text-[#172044] outline-none placeholder:text-[#A0A0AA] focus:border-[#8C7BDD] focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={
                        sending || !messageText.trim()
                      }
                      className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-[14px] bg-[#292B68] text-white transition hover:bg-[#202252] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  <p className="mt-2 text-center text-[8px] text-[#A2A0A8]">
                    Arrange handovers in a safe campus location.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}