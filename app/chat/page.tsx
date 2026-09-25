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

type Profile = {
  id: string;
  full_name: string | null;
};

export default function ChatPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reports, setReports] = useState<Record<string, Report>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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

    const conversationList = (conversationData ?? []) as Conversation[];

    setConversations(conversationList);

    if (conversationList.length === 0) {
      return conversationList;
    }

    const reportIds = Array.from(
      new Set(
        conversationList.map(
          (conversation) => conversation.report_id
        )
      )
    );

    const partnerIds = Array.from(
      new Set(
        conversationList.map((conversation) =>
          conversation.reporter_id === currentUserId
            ? conversation.claimant_id
            : conversation.reporter_id
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
    }

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
    }

    return conversationList;
  }

  async function openConversation(conversation: Conversation) {
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

        const conversationList =
          await loadConversationData(user.id);

        if (!mounted) return;

       
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

  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`campusloop-chat-${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
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
  }, [selectedConversation, supabase]);

  async function sendMessage() {
    const body = messageText.trim();

    if (
      !body ||
      !selectedConversation ||
      !userId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation.id,
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

    /*
     * Realtime normally adds the message automatically.
     * This fallback prevents a visible delay if realtime takes
     * a moment to deliver the INSERT event.
     */
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

    setMessageText("");
    setSending(false);
  }

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

  const selectedReport = selectedConversation
    ? reportFor(selectedConversation)
    : null;

  const selectedPartner = selectedConversation
    ? partnerName(selectedConversation)
    : "";

  const isSelectedLostFound =
    !!selectedConversation && !!selectedReport;

  const canUseHandover =
    isSelectedLostFound &&
    selectedReport.status !== "active";

  const conversationCount = conversations.length;

  const emptyMessage = useMemo(() => {
    return conversationCount === 0
      ? "Approved Lost & Found claims will create private chats here."
      : "Select a conversation to start messaging.";
  }, [conversationCount]);

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

        {/* MOBILE / DESKTOP PAGE TITLE */}
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

        {error && (
          <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8">
            <div className="rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
              {error}
            </div>
          </div>
        )}

        {/* MAIN CHAT AREA */}
        <div className="mx-auto mt-4 flex max-w-5xl overflow-hidden border-y border-[#E5E1D8] bg-white md:min-h-[650px] md:rounded-[22px] md:border">

          {/* ================================================== */}
          {/* CONVERSATION LIST */}
          {/* ================================================== */}

          <aside
            className={`w-full shrink-0 bg-white md:block md:w-[330px] md:border-r md:border-[#E5E1D8] ${
              selectedConversation ? "hidden" : "block"
            }`}
          >
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

            {conversations.length === 0 ? (
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
                  href="/lost-found"
                  className="mt-5 flex h-10 items-center justify-center rounded-[12px] bg-[#292B68] px-4 text-[10.5px] font-bold text-white"
                >
                  Browse Lost &amp; Found
                </Link>
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => {
                  const report = reportFor(conversation);
                  const name = partnerName(conversation);
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
                      {/* ITEM IMAGE */}
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
                          {report?.title || "Lost & Found item"}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[#858796]">
                          Lost &amp; Found handover
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* ================================================== */}
          {/* CHAT PANEL */}
          {/* ================================================== */}

          <section
            className={`min-w-0 flex-1 flex-col bg-[#FCFBF8] ${
              selectedConversation ? "flex" : "hidden md:flex"
            }`}
          >
            {!selectedConversation ? (
              /* DESKTOP EMPTY STATE */
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
                {/* ================================================== */}
                {/* CHAT HEADER */}
                {/* ================================================== */}

                <header className="border-b border-[#E5E1D8] bg-white">
                  <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedConversation(null)
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#555A6D] hover:bg-[#F4F1EA] md:hidden"
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={19} />
                    </button>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#EEE9FF] text-[#5D48D2]">
                      {selectedReport?.image_url ? (
                        <img
                          src={selectedReport.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-[#172044]">
                        {selectedPartner}
                      </p>

                      <p className="truncate text-[10px] text-[#6952D7]">
                        {selectedReport?.title ||
                          "Lost & Found"}
                      </p>
                    </div>

                    {/* SECURE HANDOVER */}
                    {canUseHandover && (
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

                  {/* ITEM CONTEXT STRIP */}
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
                            Lost &amp; Found item
                          </span>
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#EAF6ED] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#287A47]">
                        Approved
                      </span>
                    </div>
                  </div>
                </header>

                {/* ================================================== */}
                {/* MESSAGES */}
                {/* ================================================== */}

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
                          Arrange a safe campus handover with{" "}
                          <span className="font-semibold text-[#596075]">
                            {selectedPartner}
                          </span>
                          .
                        </p>

                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F5F2FF] px-3 py-1.5 text-[8px] font-semibold text-[#6952D7]">
                          <ShieldCheck size={11} />
                          Keep personal information private
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

                {/* ================================================== */}
                {/* COMPOSER */}
                {/* ================================================== */}

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