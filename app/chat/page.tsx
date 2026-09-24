"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";
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
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function ChatPage() {
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

  async function loadConversations(currentUserId: string) {
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

    const reportIds = Array.from(
      new Set(conversationList.map((conversation) => conversation.report_id))
    );

    const profileIds = Array.from(
      new Set(
        conversationList.map((conversation) =>
          conversation.reporter_id === currentUserId
            ? conversation.claimant_id
            : conversation.reporter_id
        )
      )
    );

    if (reportIds.length > 0) {
      const { data: reportData } = await supabase
        .from("lost_found_reports")
        .select("id, title, image_url")
        .in("id", reportIds);

      if (reportData) {
        const reportMap: Record<string, Report> = {};

        (reportData as Report[]).forEach((report) => {
          reportMap[report.id] = report;
        });

        setReports(reportMap);
      }
    }

    if (profileIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);

      if (profileData) {
        const profileMap: Record<string, Profile> = {};

        (profileData as Profile[]).forEach((profile) => {
          profileMap[profile.id] = profile;
        });

        setProfiles(profileMap);
      }
    }

    return conversationList;
  }

  async function openConversation(conversation: Conversation) {
    setSelectedConversation(conversation);
    setMessages([]);
    setMessagesLoading(true);
    setError("");

    const { data, error: messageError } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
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

    async function init() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/login?redirect=/chat";
          return;
        }

        if (!mounted) return;

        setUserId(user.id);

        const conversationList = await loadConversations(user.id);

        if (!mounted) return;

        if (conversationList.length > 0) {
          await openConversation(conversationList[0]);
        }
      } catch (error) {
        if (!mounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Could not load your conversations."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`conversation-${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const incomingMessage = payload.new as Message;

          setMessages((current) => {
            if (
              current.some(
                (message) => message.id === incomingMessage.id
              )
            ) {
              return current;
            }

            return [...current, incomingMessage];
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

    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: userId,
        body,
      });

    if (messageError) {
      setError(messageError.message);
      setSending(false);
      return;
    }

    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq("id", selectedConversation.id);

    setMessageText("");
    setSending(false);
  }

  function getPartnerId(conversation: Conversation) {
    return conversation.reporter_id === userId
      ? conversation.claimant_id
      : conversation.reporter_id;
  }

  function getConversationTitle(conversation: Conversation) {
    return reports[conversation.report_id]?.title ?? "Lost & Found item";
  }

  function getPartnerName(conversation: Conversation) {
    return (
      profiles[getPartnerId(conversation)]?.full_name ??
      "CampusLoop student"
    );
  }

  const selectedTitle = selectedConversation
    ? getConversationTitle(selectedConversation)
    : "";

  const selectedPartner = selectedConversation
    ? getPartnerName(selectedConversation)
    : "";

  const selectedReportImage = selectedConversation
    ? reports[selectedConversation.report_id]?.image_url
    : null;

  const hasMessages = messages.length > 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEECE5]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FBF9F4]">
          <div className="flex min-h-screen items-center justify-center px-6">
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

        {/* PAGE HEADER */}
        <header className="border-b border-[#E4E0D8] bg-[#FBF9F4] px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6952D7]">
                Messages
              </p>

              <h1 className="mt-1 text-[25px] font-bold tracking-[-0.05em]">
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
        </header>

        {error && (
          <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8">
            <div className="rounded-[14px] border border-[#F0CACA] bg-[#FFF4F4] px-4 py-3 text-[11px] leading-5 text-[#A33A3A]">
              {error}
            </div>
          </div>
        )}

        <div className="mx-auto mt-4 flex max-w-5xl overflow-hidden border-y border-[#E4E0D8] bg-white md:mt-5 md:min-h-[620px] md:rounded-[22px] md:border">

          {/* CONVERSATION LIST */}
          <aside
            className={`w-full shrink-0 md:block md:w-[320px] md:border-r md:border-[#E4E0D8] ${
              selectedConversation ? "hidden" : "block"
            }`}
          >
            <div className="border-b border-[#EEEAE2] px-5 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#858796]">
                Conversations
              </p>
            </div>

            {conversations.length === 0 ? (
              <div className="flex min-h-[440px] flex-col items-center justify-center px-7 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEE9FF] text-[#5D48D2]">
                  <MessageCircle size={23} />
                </div>

                <h2 className="mt-4 text-[14px] font-bold">
                  No conversations yet
                </h2>

                <p className="mt-1 max-w-[230px] text-[11px] leading-5 text-[#858796]">
                  When a Lost &amp; Found claim is approved, your private
                  conversation will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0ECE4]">
                {conversations.map((conversation) => {
                  const report = reports[conversation.report_id];
                  const partnerName = getPartnerName(conversation);

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FAF8F3]"
                    >
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#EEE9FF] text-[#5D48D2]">
                        {report?.image_url ? (
                          <img
                            src={report.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound size={17} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] font-bold text-[#172044]">
                            {partnerName}
                          </p>

                          <span className="shrink-0 text-[9px] text-[#A0A0AA]">
                            {new Date(
                              conversation.last_message_at
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[10px] font-medium text-[#5D48D2]">
                          {getConversationTitle(conversation)}
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#858796]">
                          Lost &amp; Found handover
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* CHAT PANEL */}
          <section
            className={`min-w-0 flex-1 ${
              selectedConversation ? "flex" : "hidden md:flex"
            } flex-col bg-[#FCFBF8]`}
          >
            {!selectedConversation ? (
              <div className="hidden flex-1 items-center justify-center text-center md:flex">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F0EDF8] text-[#7C7891]">
                    <MessageCircle size={23} />
                  </div>

                  <h2 className="mt-4 text-[14px] font-bold">
                    Select a conversation
                  </h2>

                  <p className="mt-1 text-[10px] text-[#858796]">
                    Your messages will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <div className="flex items-center gap-3 border-b border-[#E4E0D8] bg-white px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setSelectedConversation(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#555A6D] hover:bg-[#F4F1EA] md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#EEE9FF] text-[#5D48D2]">
                    {selectedReportImage ? (
                      <img
                        src={selectedReportImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={15} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-[#172044]">
                      {selectedPartner}
                    </p>
                    <p className="truncate text-[10px] text-[#6952D7]">
                      {selectedTitle}
                    </p>
                  </div>
                </div>

                {/* CHAT MESSAGES */}
                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                  {!hasMessages && !messagesLoading && (
                    <div className="flex min-h-[420px] items-center justify-center px-8 text-center">
                      <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F0EDF8] text-[#7D7A90]">
                          <MessageCircle size={20} />
                        </div>

                        <p className="mt-4 text-[13px] font-bold">
                          Start the conversation
                        </p>

                        <p className="mx-auto mt-1 max-w-[250px] text-[10px] leading-5 text-[#858796]">
                          Arrange a safe campus handover with{" "}
                          <span className="font-semibold text-[#596075]">
                            {selectedPartner}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  )}

                  {messagesLoading && (
                    <div className="flex min-h-[300px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#DDD7F7] border-t-[#5D48D2]" />
                        <p className="mt-3 text-[10px] text-[#858796]">
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  )}

                  {!messagesLoading && hasMessages && (
                    <div className="space-y-2.5">
                      {messages.map((message) => {
                        const mine = message.sender_id === userId;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              mine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[78%] ${
                                mine
                                  ? "rounded-[17px] rounded-br-[6px] bg-[#292B68] text-white"
                                  : "rounded-[17px] rounded-bl-[6px] border border-[#E5E1D9] bg-white text-[#42465A]"
                              } px-4 py-2.5`}
                            >
                              <p className="text-[12px] leading-5">
                                {message.body}
                              </p>

                              <p
                                className={`mt-1 text-right text-[8px] ${
                                  mine
                                    ? "text-white/60"
                                    : "text-[#A0A0AA]"
                                }`}
                              >
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString("en-IN", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COMPOSER */}
                <div className="border-t border-[#E4E0D8] bg-white p-3.5 sm:p-4">
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
                      className="max-h-28 min-h-[44px] flex-1 resize-none rounded-[15px] border border-[#DCD8D0] bg-[#FAF8F3] px-4 py-3 text-[12px] outline-none placeholder:text-[#A0A0AA] focus:border-[#8C7BDD] focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={sending || !messageText.trim()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#292B68] text-white transition hover:bg-[#202252] disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send size={15} />
                    </button>
                  </div>

                  <p className="mt-2 text-center text-[8px] text-[#A0A0AA]">
                    Keep personal information private and arrange handovers
                    in a safe campus location.
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