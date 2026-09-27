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

  Wrench,

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

type RentConversation = {

  id: string;

  request_id: string;

  item_id: string;

  owner_id: string;

  renter_id: string;

  created_at: string;

  last_message_at: string;

};

type ServiceConversation = {

  id: string;

  service_id: string;

  provider_id: string;

  requester_id: string;

  created_at: string;

  updated_at: string;

  last_message_at: string | null;

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

type RentItem = {

  id: string;

  title: string;

  image_url: string | null;

  status: string;

};

type RentRequest = {

  id: string;

  item_id: string;

  owner_id: string;

  renter_id: string;

  status: string;

  start_date: string;

  end_date: string;

};

type ServiceListing = {

  id: string;

  title: string;

  image_url: string | null;

  category: string;

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

  const [marketplaceConversations, setMarketplaceConversations] =

    useState<MarketplaceConversation[]>([]);

  const [rentConversations, setRentConversations] = useState<RentConversation[]>([]);

  const [serviceConversations, setServiceConversations] = useState<ServiceConversation[]>([]);

  const [reports, setReports] = useState<Record<string, Report>>({});

  const [marketplaceListings, setMarketplaceListings] = useState<

    Record<string, MarketplaceListing>

  >({});

  const [rentItems, setRentItems] = useState<Record<string, RentItem>>({});

  const [rentRequests, setRentRequests] = useState<Record<string, RentRequest>>({});

  const [serviceListings, setServiceListings] = useState<Record<string, ServiceListing>>({});

  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [selectedConversation, setSelectedConversation] =

    useState<Conversation | null>(null);

  const [selectedMarketplaceConversation, setSelectedMarketplaceConversation] =

    useState<MarketplaceConversation | null>(null);

  const [selectedRentConversation, setSelectedRentConversation] =

    useState<RentConversation | null>(null);

  const [selectedServiceConversation, setSelectedServiceConversation] =

    useState<ServiceConversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);

  const [messagesLoading, setMessagesLoading] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [unreadConversations, setUnreadConversations] = useState<
    Record<string, { count: number; latestMessage: string }>
  >({});

  async function loadConversationData(currentUserId: string) {

    const [lostFoundResult, marketplaceResult, rentResult, serviceResult] =

      await Promise.all([

        supabase

          .from("conversations")

          .select("id, report_id, claim_id, reporter_id, claimant_id, created_at, last_message_at")

          .order("last_message_at", { ascending: false }),

        supabase

          .from("marketplace_conversations")

          .select("id, listing_id, seller_id, buyer_id, created_at, last_message_at")

          .order("last_message_at", { ascending: false }),

        supabase

          .from("rent_conversations")

          .select("id, request_id, item_id, owner_id, renter_id, created_at, last_message_at")

          .order("last_message_at", { ascending: false }),

        supabase

          .from("service_conversations")

          .select("id, service_id, provider_id, requester_id, created_at, updated_at, last_message_at")

          .order("last_message_at", { ascending: false }),

      ]);



    if (lostFoundResult.error) throw new Error(lostFoundResult.error.message);

    if (marketplaceResult.error) throw new Error(marketplaceResult.error.message);

    if (rentResult.error) throw new Error(rentResult.error.message);

    if (serviceResult.error) throw new Error(serviceResult.error.message);



    const conversationList = (lostFoundResult.data ?? []) as Conversation[];

    const marketplaceList = (marketplaceResult.data ?? []) as MarketplaceConversation[];

    const rentList = (rentResult.data ?? []) as RentConversation[];

    const serviceList = (serviceResult.data ?? []) as ServiceConversation[];



    setConversations(conversationList);

    setMarketplaceConversations(marketplaceList);

    setRentConversations(rentList);

    setServiceConversations(serviceList);

    const reportIds = Array.from(

      new Set(conversationList.map((conversation) => conversation.report_id))

    );

    const listingIds = Array.from(

      new Set(marketplaceList.map((conversation) => conversation.listing_id))

    );

    const rentItemIds = Array.from(

      new Set(rentList.map((conversation) => conversation.item_id))

    );

    const rentRequestIds = Array.from(

      new Set(rentList.map((conversation) => conversation.request_id))

    );

    const serviceIds = Array.from(

      new Set(serviceList.map((conversation) => conversation.service_id))

    );

    if (reportIds.length) {

      const { data, error: queryError } = await supabase

        .from("lost_found_reports")

        .select("id, title, image_url, category, type, status")

        .in("id", reportIds);

      if (queryError) throw new Error(queryError.message);

      const map: Record<string, Report> = {};

      (data ?? []).forEach((row) => {

        const report = row as Report;

        map[report.id] = report;

      });

      setReports(map);

    } else {

      setReports({});

    }

    if (listingIds.length) {

      const { data, error: queryError } = await supabase

        .from("marketplace_listings")

        .select("id, title, image_url, status")

        .in("id", listingIds);

      if (queryError) throw new Error(queryError.message);

      const map: Record<string, MarketplaceListing> = {};

      (data ?? []).forEach((row) => {

        const listing = row as MarketplaceListing;

        map[listing.id] = listing;

      });

      setMarketplaceListings(map);

    } else {

      setMarketplaceListings({});

    }

    if (rentItemIds.length) {

      const { data, error: queryError } = await supabase

        .from("borrow_items")

        .select("id, title, image_url, status")

        .in("id", rentItemIds);

      if (queryError) throw new Error(queryError.message);

      const map: Record<string, RentItem> = {};

      (data ?? []).forEach((row) => {

        const item = row as RentItem;

        map[item.id] = item;

      });

      setRentItems(map);

    } else {

      setRentItems({});

    }

    if (rentRequestIds.length) {

      const { data, error: queryError } = await supabase

        .from("rent_requests")

        .select("id, item_id, owner_id, renter_id, status, start_date, end_date")

        .in("id", rentRequestIds);

      if (queryError) throw new Error(queryError.message);

      const map: Record<string, RentRequest> = {};

      (data ?? []).forEach((row) => {

        const request = row as RentRequest;

        map[request.id] = request;

      });

      setRentRequests(map);

    } else {

      setRentRequests({});

    }

    if (serviceIds.length) {

      const { data, error: queryError } = await supabase

        .from("student_services")

        .select("id, title, image_url, category, status")

        .in("id", serviceIds);

      if (queryError) throw new Error(queryError.message);



      const map: Record<string, ServiceListing> = {};

      (data ?? []).forEach((row) => {

        const service = row as ServiceListing;

        map[service.id] = service;

      });

      setServiceListings(map);

    } else {

      setServiceListings({});

    }



    const lostFoundPartnerIds = conversationList.map((conversation) =>

      conversation.reporter_id === currentUserId

        ? conversation.claimant_id

        : conversation.reporter_id

    );

    const marketplacePartnerIds = marketplaceList.map((conversation) =>

      conversation.seller_id === currentUserId

        ? conversation.buyer_id

        : conversation.seller_id

    );

    const rentPartnerIds = rentList.map((conversation) =>

      conversation.owner_id === currentUserId

        ? conversation.renter_id

        : conversation.owner_id

    );

    const servicePartnerIds = serviceList.map((conversation) =>

      conversation.provider_id === currentUserId

        ? conversation.requester_id

        : conversation.provider_id

    );

    const partnerIds = Array.from(

      new Set([

        ...lostFoundPartnerIds,

        ...marketplacePartnerIds,

        ...rentPartnerIds,

        ...servicePartnerIds,

      ])

    );

    if (partnerIds.length) {

      const { data, error: queryError } = await supabase

        .from("profiles")

        .select("id, full_name")

        .in("id", partnerIds);

      if (queryError) throw new Error(queryError.message);

      const map: Record<string, Profile> = {};

      (data ?? []).forEach((row) => {

        const profile = row as Profile;

        map[profile.id] = profile;

      });

      setProfiles(map);

    } else {

      setProfiles({});

    }

    return {

      conversationList,

      marketplaceList,

      rentList,

      serviceList,

    };

  }

  function unreadKey(
    conversationType: "lost_found" | "marketplace" | "rent" | "service",
    conversationId: string
  ) {
    return `${conversationType}:${conversationId}`;
  }

  function getUnreadInfo(
    conversationType: "lost_found" | "marketplace" | "rent" | "service",
    conversationId: string
  ) {
    return unreadConversations[unreadKey(conversationType, conversationId)];
  }

  async function loadUnreadConversations() {
    const { data, error: unreadError } = await supabase.rpc(
      "get_unread_chat_conversations"
    );

    if (unreadError) {
      console.error("Error loading unread conversation details:", unreadError);
      return;
    }

 const next: Record<
  string,
  { count: number; latestMessage: string }
> = {};

type UnreadConversationRow = {
  conversation_type:
    | "lost_found"
    | "marketplace"
    | "rent"
    | "service";
  conversation_id: string;
  unread_count: number;
  latest_unread_message: string | null;
};

const unreadRows =
  (data ?? []) as UnreadConversationRow[];

unreadRows.forEach((row) => {
  if (row.unread_count > 0) {
    next[
      unreadKey(
        row.conversation_type,
        row.conversation_id
      )
    ] = {
      count: row.unread_count,
      latestMessage:
        row.latest_unread_message || "New message",
    };
  }
});

    setUnreadConversations(next);
  }

  async function markConversationRead(
    conversationType: "lost_found" | "marketplace" | "rent" | "service",
    conversationId: string
  ) {
    const { error: readError } = await supabase.rpc(
      "mark_chat_conversation_read",
      {
        p_conversation_type: conversationType,
        p_conversation_id: conversationId,
      }
    );

    if (readError) {
      console.error("Error marking conversation as read:", readError);
      return;
    }

    setUnreadConversations((current) => {
      const next = { ...current };
      delete next[unreadKey(conversationType, conversationId)];
      return next;
    });

    window.dispatchEvent(new CustomEvent("chat-unread-refresh"));
  }

  async function openLostFoundConversation(conversation: Conversation) {

    setSelectedMarketplaceConversation(null);

    setSelectedRentConversation(null);

    setSelectedConversation(conversation);

    setMessages([]);

    setError("");

    setMessagesLoading(true);

    const { data, error: queryError } = await supabase

      .from("messages")

      .select("id, conversation_id, sender_id, body, created_at")

      .eq("conversation_id", conversation.id)

      .order("created_at", { ascending: true });

    if (queryError) setError(queryError.message);

    else setMessages((data ?? []) as Message[]);

    await markConversationRead("lost_found", conversation.id);

    setMessagesLoading(false);

  }

  async function openMarketplaceConversation(

    conversation: MarketplaceConversation

  ) {

    setSelectedConversation(null);

    setSelectedRentConversation(null);

    setSelectedMarketplaceConversation(conversation);

    setMessages([]);

    setError("");

    setMessagesLoading(true);

    const { data, error: queryError } = await supabase

      .from("marketplace_messages")

      .select("id, conversation_id, sender_id, body, created_at")

      .eq("conversation_id", conversation.id)

      .order("created_at", { ascending: true });

    if (queryError) setError(queryError.message);

    else setMessages((data ?? []) as Message[]);

    await markConversationRead("marketplace", conversation.id);

    setMessagesLoading(false);

  }

  async function openRentConversation(conversation: RentConversation) {

    setSelectedConversation(null);

    setSelectedMarketplaceConversation(null);

    setSelectedServiceConversation(null);

    setSelectedRentConversation(conversation);

    setMessages([]);

    setError("");

    setMessagesLoading(true);

    const { data, error: queryError } = await supabase

      .from("rent_messages")

      .select("id, conversation_id, sender_id, body, created_at")

      .eq("conversation_id", conversation.id)

      .order("created_at", { ascending: true });

    if (queryError) setError(queryError.message);

    else setMessages((data ?? []) as Message[]);

    await markConversationRead("rent", conversation.id);

    setMessagesLoading(false);

  }

  async function openServiceConversation(conversation: ServiceConversation) {

    setSelectedConversation(null);

    setSelectedMarketplaceConversation(null);

    setSelectedRentConversation(null);

    setSelectedServiceConversation(conversation);

    setMessages([]);

    setError("");

    setMessagesLoading(true);



    const { data, error: queryError } = await supabase

      .from("service_messages")

      .select("id, conversation_id, sender_id, body, created_at")

      .eq("conversation_id", conversation.id)

      .order("created_at", { ascending: true });



    if (queryError) setError(queryError.message);

    else setMessages((data ?? []) as Message[]);



    await markConversationRead("service", conversation.id);

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

        const { conversationList, marketplaceList, rentList, serviceList } =

          await loadConversationData(user.id);

        await loadUnreadConversations();

        if (!mounted) return;

        const params = new URLSearchParams(window.location.search);

        const requestedType = params.get("type");

        const requestedConversation = params.get("conversation");

        if (requestedConversation) {

          if (requestedType === "rent") {

            const conversation = rentList.find(

              (item) => item.id === requestedConversation

            );

            if (conversation) await openRentConversation(conversation);

            else setError("That rental conversation could not be found.");

          } else if (requestedType === "services") {

            const conversation = serviceList.find(

              (item) => item.id === requestedConversation

            );

            if (conversation) await openServiceConversation(conversation);

            else setError("That service conversation could not be found.");

          } else if (requestedType === "marketplace") {

            const conversation = marketplaceList.find(

              (item) => item.id === requestedConversation

            );

            if (conversation) await openMarketplaceConversation(conversation);

            else

              setError("That marketplace conversation could not be found.");

          } else {

            const conversation = conversationList.find(

              (item) => item.id === requestedConversation

            );

            if (conversation) await openLostFoundConversation(conversation);

            else setError("That conversation could not be found.");

          }

        }

      } catch (err) {

        if (mounted) {

          setError(

            err instanceof Error ? err.message : "Could not load your chats."

          );

        }

      } finally {

        if (mounted) setLoading(false);

      }

    }

    initialize();

    return () => {

      mounted = false;

    };

  }, [router, supabase]);

  useEffect(() => {
    const refreshUnread = () => {
      loadUnreadConversations();
    };

    window.addEventListener("chat-unread-refresh", refreshUnread);

    const channel = supabase
      .channel("chat-unread-details")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        refreshUnread
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "marketplace_messages" },
        refreshUnread
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rent_messages" },
        refreshUnread
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "service_messages" },
        refreshUnread
      )
      .subscribe();

    return () => {
      window.removeEventListener("chat-unread-refresh", refreshUnread);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {

    const selected =

      selectedConversation ||

      selectedMarketplaceConversation ||

      selectedRentConversation ||

      selectedServiceConversation;

    if (!selected) return;

    const isRent = !!selectedRentConversation;

    const isMarketplace = !!selectedMarketplaceConversation;

    const isService = !!selectedServiceConversation;

    const conversationId = selected.id;

    const table = isRent

      ? "rent_messages"

      : isMarketplace

        ? "marketplace_messages"

        : isService

          ? "service_messages"

          : "messages";

    const channel = supabase

      .channel(

        `${isRent ? "rent" : isMarketplace ? "marketplace" : isService ? "services" : "campusloop"}-chat-${conversationId}`

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

          setMessages((current) =>

            current.some((message) => message.id === incoming.id)

              ? current

              : [...current, incoming]

          );

          if (incoming.sender_id !== userId) {
            markConversationRead(
              isRent
                ? "rent"
                : isMarketplace
                  ? "marketplace"
                  : isService
                    ? "service"
                    : "lost_found",
              conversationId
            );
          }

        }

      )

      .subscribe();

    return () => {

      supabase.removeChannel(channel);

    };

  }, [

    selectedConversation,

    selectedMarketplaceConversation,

    selectedRentConversation,

    selectedServiceConversation,

    supabase,

  ]);

  async function sendMessage() {

    const body = messageText.trim();

    if (
      !body ||
      !userId ||
      sending ||
      (!selectedConversation &&
        !selectedMarketplaceConversation &&
        !selectedRentConversation &&
        !selectedServiceConversation)
    ) {
      return;
    }

    setSending(true);
    setError("");

    const isRent = !!selectedRentConversation;
    const isMarketplace = !!selectedMarketplaceConversation;
    const isService = !!selectedServiceConversation;

    const selectedConversationForMessage =
      isRent
        ? selectedRentConversation
        : isMarketplace
          ? selectedMarketplaceConversation
          : isService
            ? selectedServiceConversation
            : selectedConversation;

    if (!selectedConversationForMessage) {
      setError("Could not determine this conversation.");
      setSending(false);
      return;
    }

    const conversationId = selectedConversationForMessage.id;

    const table = isRent
      ? "rent_messages"
      : isMarketplace
        ? "marketplace_messages"
        : isService
          ? "service_messages"
          : "messages";

    const { data, error: queryError } = await supabase
      .from(table)
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body,
      })
      .select("id, conversation_id, sender_id, body, created_at")
      .single();

    if (queryError) {
      setError(queryError.message);
      setSending(false);
      return;
    }

    if (data) {
      const newMessage = data as Message;

      setMessages((current) =>
        current.some((message) => message.id === newMessage.id)
          ? current
          : [...current, newMessage]
      );
    }

    const timestamp = new Date().toISOString();

    if (isRent) {
      await supabase
        .from("rent_conversations")
        .update({ last_message_at: timestamp })
        .eq("id", conversationId);
    } else if (isService) {
      await supabase
        .from("service_conversations")
        .update({ last_message_at: timestamp })
        .eq("id", conversationId);
    } else if (isMarketplace) {
      await supabase
        .from("marketplace_conversations")
        .update({ last_message_at: timestamp })
        .eq("id", conversationId);
    } else {
      await supabase
        .from("conversations")
        .update({ last_message_at: timestamp })
        .eq("id", conversationId);
    }

    setMessageText("");
    setSending(false);
  }

  function lostFoundPartnerId(conversation: Conversation) {

    return conversation.reporter_id === userId

      ? conversation.claimant_id

      : conversation.reporter_id;

  }

  function lostFoundPartnerName(conversation: Conversation) {

    return (

      profiles[lostFoundPartnerId(conversation)]?.full_name ||

      "CampusLoop student"

    );

  }

  function marketplacePartnerId(conversation: MarketplaceConversation) {

    return conversation.seller_id === userId

      ? conversation.buyer_id

      : conversation.seller_id;

  }

  function marketplacePartnerName(conversation: MarketplaceConversation) {

    return (

      profiles[marketplacePartnerId(conversation)]?.full_name ||

      "CampusLoop student"

    );

  }

  function rentPartnerId(conversation: RentConversation) {

    return conversation.owner_id === userId

      ? conversation.renter_id

      : conversation.owner_id;

  }

  function rentPartnerName(conversation: RentConversation) {

    return (

      profiles[rentPartnerId(conversation)]?.full_name ||

      "CampusLoop student"

    );

  }



  function servicePartnerId(conversation: ServiceConversation) {

    return conversation.provider_id === userId

      ? conversation.requester_id

      : conversation.provider_id;

  }



  function servicePartnerName(conversation: ServiceConversation) {

    return (

      profiles[servicePartnerId(conversation)]?.full_name ||

      "CampusLoop student"

    );

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

    ? reports[selectedConversation.report_id]

    : null;

  const selectedListing = selectedMarketplaceConversation

    ? marketplaceListings[selectedMarketplaceConversation.listing_id]

    : null;

  const selectedRentItem = selectedRentConversation

    ? rentItems[selectedRentConversation.item_id]

    : null;

  const selectedRentRequest = selectedRentConversation

    ? rentRequests[selectedRentConversation.request_id]

    : null;

  const selectedServiceListing = selectedServiceConversation

    ? serviceListings[selectedServiceConversation.service_id]

    : null;

  const selectedPartner = selectedConversation

    ? lostFoundPartnerName(selectedConversation)

    : selectedMarketplaceConversation

      ? marketplacePartnerName(selectedMarketplaceConversation)

      : selectedRentConversation

        ? rentPartnerName(selectedRentConversation)

        : selectedServiceConversation

          ? servicePartnerName(selectedServiceConversation)

          : "";

  const selectedTitle = selectedConversation

    ? selectedReport?.title || "Lost & Found item"

    : selectedMarketplaceConversation

      ? selectedListing?.title || "Marketplace item"

      : selectedRentConversation

        ? selectedRentItem?.title || "Rental item"

        : selectedServiceConversation

          ? selectedServiceListing?.title || "Student service"

          : "";

  const isSelectedLostFound = !!selectedConversation && !!selectedReport;

  const isSelectedMarketplace =

    !!selectedMarketplaceConversation && !!selectedListing;

  const isSelectedRent = !!selectedRentConversation && !!selectedRentItem;

  const isSelectedService =

    !!selectedServiceConversation && !!selectedServiceListing;

  const canUseHandover =

    isSelectedLostFound && !!selectedReport && selectedReport.status !== "active";

  const conversationCount =

    conversations.length +

    marketplaceConversations.length +

    rentConversations.length +

    serviceConversations.length;

  const hasAnyConversations = conversationCount > 0;

  const emptyMessage = useMemo(

    () =>

      hasAnyConversations

        ? "Select a conversation to start messaging."

        : "Service, rental, marketplace and Lost & Found conversations will appear here.",

    [hasAnyConversations]

  );

  function clearSelection() {

    setSelectedConversation(null);

    setSelectedMarketplaceConversation(null);

    setSelectedRentConversation(null);

    setSelectedServiceConversation(null);

    setMessages([]);

  }

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

        <div className="mx-auto mt-4 flex max-w-5xl overflow-hidden border-y border-[#E5E1D8] bg-white md:min-h-[650px] md:rounded-[22px] md:border">

          <aside

            className={`w-full shrink-0 bg-white md:block md:w-[330px] md:border-r md:border-[#E5E1D8] ${

              selectedConversation ||

              selectedMarketplaceConversation ||

              selectedRentConversation ||

              selectedServiceConversation

                ? "hidden"

                : "block"

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

                  href="/rent"

                  className="mt-5 flex h-10 items-center justify-center rounded-[12px] bg-[#292B68] px-4 text-[10.5px] font-bold text-white"

                >

                  Browse rentals

                </Link>

              </div>

            ) : (

              <div>

                {conversations.length > 0 && (

                  <>

                    <div className="border-b border-[#F0ECE5] bg-[#FAF8F3] px-5 py-3">

                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#858796]">

                        Lost &amp; Found

                      </p>

                    </div>

                    {conversations.map((conversation) => {

                      const report = reports[conversation.report_id];

                      const name = lostFoundPartnerName(conversation);

                      const active = selectedConversation?.id === conversation.id;

                      const unread = getUnreadInfo("lost_found", conversation.id);

                      const hasUnread = (unread?.count ?? 0) > 0;

                      return (

                        <button

                          key={conversation.id}

                          type="button"

                          onClick={() => openLostFoundConversation(conversation)}

                          className={`flex w-full items-center gap-3 border-b border-[#F0ECE5] px-5 py-4 text-left transition ${

                            active
                              ? "bg-[#F3F0FF]"
                              : hasUnread
                                ? "bg-[#FBFAFF] hover:bg-[#F6F3FF]"
                                : "bg-white hover:bg-[#FAF8F3]"

                          }`}

                        >

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

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <p className="truncate text-[12px] font-bold text-[#172044]">

                                {name}

                              </p>

                              <div className="flex shrink-0 items-center gap-1.5">

                                {hasUnread && (
                                  <span className="flex min-w-[15px] h-[15px] items-center justify-center rounded-full bg-[#6350D8] px-1 text-[8px] font-bold leading-none text-white">
                                    {unread?.count > 99 ? "99+" : unread?.count}
                                  </span>
                                )}

                                <span
                                  className={`text-[8px] ${
                                    hasUnread ? "font-bold text-[#5D48D2]" : "text-[#A0A0AA]"
                                  }`}
                                >
                                  {formatConversationDate(conversation.last_message_at)}
                                </span>

                              </div>

                            </div>

                            <p className="mt-1 truncate text-[10px] font-bold text-[#5D48D2]">

                              {report?.title || "Lost & Found item"}

                            </p>

                            <p
                              className={`mt-0.5 truncate text-[9px] ${
                                hasUnread
                                  ? "font-semibold text-[#5D48D2]"
                                  : "text-[#858796]"
                              }`}
                            >

                              {hasUnread ? unread?.latestMessage : "Lost &amp; Found handover"}

                            </p>

                          </div>

                        </button>

                      );

                    })}

                  </>

                )}

                {marketplaceConversations.length > 0 && (

                  <>

                    <div className="border-b border-[#F0ECE5] bg-[#FAF8F3] px-5 py-3">

                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#858796]">

                        Marketplace

                      </p>

                    </div>

                    {marketplaceConversations.map((conversation) => {

                      const listing = marketplaceListings[conversation.listing_id];

                      const name = marketplacePartnerName(conversation);

                      const active =

                        selectedMarketplaceConversation?.id === conversation.id;

                      const unread = getUnreadInfo("marketplace", conversation.id);

                      const hasUnread = (unread?.count ?? 0) > 0;

                      return (

                        <button

                          key={conversation.id}

                          type="button"

                          onClick={() => openMarketplaceConversation(conversation)}

                          className={`flex w-full items-center gap-3 border-b border-[#F0ECE5] px-5 py-4 text-left transition ${

                            active
                              ? "bg-[#F3F0FF]"
                              : hasUnread
                                ? "bg-[#FBFAFF] hover:bg-[#F6F3FF]"
                                : "bg-white hover:bg-[#FAF8F3]"

                          }`}

                        >

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

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <p className="truncate text-[12px] font-bold text-[#172044]">

                                {name}

                              </p>

                              <div className="flex shrink-0 items-center gap-1.5">

                                {hasUnread && (
                                  <span className="flex min-w-[15px] h-[15px] items-center justify-center rounded-full bg-[#6350D8] px-1 text-[8px] font-bold leading-none text-white">
                                    {unread?.count > 99 ? "99+" : unread?.count}
                                  </span>
                                )}

                                <span
                                  className={`text-[8px] ${
                                    hasUnread ? "font-bold text-[#5D48D2]" : "text-[#A0A0AA]"
                                  }`}
                                >
                                  {formatConversationDate(conversation.last_message_at)}
                                </span>

                              </div>

                            </div>

                            <p className="mt-1 truncate text-[10px] font-bold text-[#5D48D2]">

                              {listing?.title || "Marketplace item"}

                            </p>

                            <p
                              className={`mt-0.5 truncate text-[9px] ${
                                hasUnread
                                  ? "font-semibold text-[#5D48D2]"
                                  : "text-[#858796]"
                              }`}
                            >

                              {hasUnread ? unread?.latestMessage : "Marketplace conversation"}

                            </p>

                          </div>

                        </button>

                      );

                    })}

                  </>

                )}

                {rentConversations.length > 0 && (

                  <>

                    <div className="border-b border-[#F0ECE5] bg-[#FAF8F3] px-5 py-3">

                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#858796]">

                        Rentals

                      </p>

                    </div>

                    {rentConversations.map((conversation) => {

                      const item = rentItems[conversation.item_id];

                      const request = rentRequests[conversation.request_id];

                      const name = rentPartnerName(conversation);

                      const active = selectedRentConversation?.id === conversation.id;

                      const unread = getUnreadInfo("rent", conversation.id);

                      const hasUnread = (unread?.count ?? 0) > 0;

                      return (

                        <button

                          key={conversation.id}

                          type="button"

                          onClick={() => openRentConversation(conversation)}

                          className={`flex w-full items-center gap-3 border-b border-[#F0ECE5] px-5 py-4 text-left transition ${

                            active
                              ? "bg-[#F3F0FF]"
                              : hasUnread
                                ? "bg-[#FBFAFF] hover:bg-[#F6F3FF]"
                                : "bg-white hover:bg-[#FAF8F3]"

                          }`}

                        >

                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">

                            {item?.image_url ? (

                              <img

                                src={item.image_url}

                                alt=""

                                className="h-full w-full object-cover"

                              />

                            ) : (

                              <Package size={18} />

                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <p className="truncate text-[12px] font-bold text-[#172044]">

                                {name}

                              </p>

                              <div className="flex shrink-0 items-center gap-1.5">

                                {hasUnread && (
                                  <span className="flex min-w-[15px] h-[15px] items-center justify-center rounded-full bg-[#6350D8] px-1 text-[8px] font-bold leading-none text-white">
                                    {unread?.count > 99 ? "99+" : unread?.count}
                                  </span>
                                )}

                                <span
                                  className={`text-[8px] ${
                                    hasUnread ? "font-bold text-[#5D48D2]" : "text-[#A0A0AA]"
                                  }`}
                                >
                                  {formatConversationDate(conversation.last_message_at)}
                                </span>

                              </div>

                            </div>

                            <p className="mt-1 truncate text-[10px] font-bold text-[#5D48D2]">

                              {item?.title || "Rental item"}

                            </p>

                            <p
                              className={`mt-0.5 truncate text-[9px] ${
                                hasUnread
                                  ? "font-semibold text-[#5D48D2]"
                                  : "text-[#858796]"
                              }`}
                            >

                              {hasUnread ? unread?.latestMessage : `Rental · ${request?.status || "pending"}`}

                            </p>

                          </div>

                        </button>

                      );

                    })}

                  </>

                )}

              </div>

            )}



                {serviceConversations.length > 0 && (

                  <>

                    <div className="border-b border-[#F0ECE5] bg-[#FAF8F3] px-5 py-3">

                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#858796]">

                        Student Services

                      </p>

                    </div>



                    {serviceConversations.map((conversation) => {

                      const service = serviceListings[conversation.service_id];

                      const name = servicePartnerName(conversation);

                      const active = selectedServiceConversation?.id === conversation.id;

                      const unread = getUnreadInfo("service", conversation.id);

                      const hasUnread = (unread?.count ?? 0) > 0;



                      return (

                        <button

                          key={conversation.id}

                          type="button"

                          onClick={() => openServiceConversation(conversation)}

                          className={`flex w-full items-center gap-3 border-b border-[#F0ECE5] px-5 py-4 text-left transition ${

                            active
                              ? "bg-[#F3F0FF]"
                              : hasUnread
                                ? "bg-[#FBFAFF] hover:bg-[#F6F3FF]"
                                : "bg-white hover:bg-[#FAF8F3]"

                          }`}

                        >

                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#EEE9FF] text-[#5D48D2]">

                            {service?.image_url ? (

                              <img src={service.image_url} alt="" className="h-full w-full object-cover" />

                            ) : (

                              <Wrench size={18} />

                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <p className="truncate text-[12px] font-bold text-[#172044]">{name}</p>

                              <div className="flex shrink-0 items-center gap-1.5">

                                {hasUnread && (
                                  <span className="flex min-w-[15px] h-[15px] items-center justify-center rounded-full bg-[#6350D8] px-1 text-[8px] font-bold leading-none text-white">
                                    {unread?.count > 99 ? "99+" : unread?.count}
                                  </span>
                                )}

                                <span
                                  className={`text-[8px] ${
                                    hasUnread ? "font-bold text-[#5D48D2]" : "text-[#A0A0AA]"
                                  }`}
                                >
                                  {formatConversationDate(conversation.last_message_at || conversation.created_at)}
                                </span>

                              </div>

                            </div>

                            <p className="mt-1 truncate text-[10px] font-bold text-[#5D48D2]">

                              {service?.title || "Student service"}

                            </p>

                            <p
                              className={`mt-0.5 truncate text-[9px] ${
                                hasUnread
                                  ? "font-semibold text-[#5D48D2]"
                                  : "text-[#858796]"
                              }`}
                            >

                              {hasUnread
                                ? unread?.latestMessage
                                : `Student Services · ${service?.category || "service"}`}

                            </p>

                          </div>

                        </button>

                      );

                    })}

                  </>

                )}

          </aside>

          <section

            className={`min-w-0 flex-1 flex-col bg-[#FCFBF8] ${

              selectedConversation ||

              selectedMarketplaceConversation ||

              selectedRentConversation ||

              selectedServiceConversation

                ? "flex"

                : "hidden md:flex"

            }`}

          >

            {!selectedConversation &&

            !selectedMarketplaceConversation &&

            !selectedRentConversation &&

            !selectedServiceConversation ? (

              <div className="hidden flex-1 items-center justify-center text-center md:flex">

                <div className="px-8">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F0EDF8] text-[#7D7A90]">

                    <MessageCircle size={23} />

                  </div>

                  <h2 className="mt-4 text-[14px] font-bold">Select a conversation</h2>

                  <p className="mt-1 text-[10.5px] text-[#858796]">

                    Your messages will appear here.

                  </p>

                </div>

              </div>

            ) : (

              <>

                <header className="border-b border-[#E5E1D8] bg-white">

                  <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">

                    <button

                      type="button"

                      onClick={clearSelection}

                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#555A6D] hover:bg-[#F4F1EA] md:hidden"

                      aria-label="Back to conversations"

                    >

                      <ChevronLeft size={19} />

                    </button>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#EEE9FF] text-[#5D48D2]">

                      {isSelectedRent && selectedRentItem?.image_url ? (

                        <img

                          src={selectedRentItem.image_url}

                          alt=""

                          className="h-full w-full object-cover"

                        />

                      ) : isSelectedService && selectedServiceListing?.image_url ? (

                        <img

                          src={selectedServiceListing.image_url}

                          alt=""

                          className="h-full w-full object-cover"

                        />

                      ) : isSelectedMarketplace && selectedListing?.image_url ? (

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

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[12px] font-bold text-[#172044]">

                        {selectedPartner}

                      </p>

                      <p className="truncate text-[10px] text-[#6952D7]">

                        {selectedTitle}

                      </p>

                    </div>

                    {canUseHandover && selectedConversation && (

                      <Link

                        href={`/lost-found/${selectedConversation.report_id}/verify`}

                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#DAD1FF] bg-[#F3F0FF] px-3 py-2 text-[9px] font-bold text-[#5D48D2]"

                      >

                        <ShieldCheck size={12} />

                        <span>Secure handover</span>

                      </Link>

                    )}

                  </div>

                  <div className="border-t border-[#F0ECE5] bg-[#FAF8F3] px-4 py-2.5 sm:px-5">

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-2">

                        <ShieldCheck size={12} className="shrink-0 text-[#6952D7]" />

                        <p className="truncate text-[9px] text-[#6F7384]">

                          This conversation is about a{" "}

                          <span className="font-bold text-[#4A4E63]">

                            {isSelectedRent

                              ? "Rental request"

                              : isSelectedService

                                ? "Student service"

                                : isSelectedMarketplace

                                  ? "Marketplace listing"

                                  : "Lost & Found item"}

                          </span>

                        </p>

                      </div>

                      <span className="shrink-0 rounded-full bg-[#EAF6ED] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#287A47]">

                        {isSelectedRent

                          ? (selectedRentRequest?.status || "pending").toUpperCase()

                          : isSelectedMarketplace

                            ? "BUY / SELL"

                            : "APPROVED"}

                      </span>

                    </div>

                  </div>

                </header>

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

                        <p className="mx-auto mt-1 max-w-[260px] text-[10.5px] leading-5 text-[#858796]">

                          {isSelectedRent

                            ? `Discuss the pickup time and meeting point with ${selectedPartner}.`

                            : isSelectedMarketplace

                              ? `Ask ${selectedPartner} about this listing.`

                              : `Arrange a safe campus handover with ${selectedPartner}.`}

                        </p>

                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F5F2FF] px-3 py-1.5 text-[8px] font-semibold text-[#6952D7]">

                          <ShieldCheck size={11} />

                          {isSelectedRent

                            ? "Keep pickup details inside CampusLoop"

                            : "Keep personal information private"}

                        </div>

                      </div>

                    </div>

                  ) : (

                    <div className="space-y-3">

                      {messages.map((message, index) => {

                        const mine = message.sender_id === userId;

                        const previous = messages[index - 1];

                        const sameSender = previous?.sender_id === message.sender_id;

                        return (

                          <div

                            key={message.id}

                            className={`flex ${mine ? "justify-end" : "justify-start"}`}

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

                                  mine ? "text-white/55" : "text-[#A0A0AA]"

                                }`}

                              >

                                <span className="text-[7.5px]">

                                  {formatMessageTime(message.created_at)}

                                </span>

                                {mine && <Check size={9} />}

                              </div>

                            </div>

                          </div>

                        );

                      })}

                    </div>

                  )}

                </div>

                <div className="border-t border-[#E5E1D8] bg-white px-3.5 py-3 sm:px-4">

                  <div className="flex items-end gap-2">

                    <textarea

                      value={messageText}

                      onChange={(event) => setMessageText(event.target.value)}

                      onKeyDown={(event) => {

                        if (event.key === "Enter" && !event.shiftKey) {

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

                      disabled={sending || !messageText.trim()}

                      className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-[14px] bg-[#292B68] text-white transition hover:bg-[#202252] disabled:cursor-not-allowed disabled:opacity-40"

                      aria-label="Send message"

                    >

                      <Send size={16} />

                    </button>

                  </div>

                  <p className="mt-2 text-center text-[8px] text-[#A2A0A8]">

                    Arrange meetups in a safe campus location.

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
