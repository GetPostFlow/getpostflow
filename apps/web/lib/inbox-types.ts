/**
 * Inbox data types for the UI layer.
 * These mirror the DB schema but are denormalized for the client.
 */

export type ConversationStatus = "open" | "pending" | "resolved" | "spam";
export type ConversationPriority = "low" | "normal" | "high" | "urgent";
export type MessageSentiment = "positive" | "neutral" | "negative" | "urgent";
export type MessageStatus = "unread" | "read" | "replied" | "escalated";
export type MessageDirection = "inbound" | "outbound";

export interface ConversationSummary {
  id: string;
  platform: string;
  platformConversationId: string;
  participantHandle: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  assignedToUserId: string | null;
  sentimentSummary: MessageSentiment | null;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  content: string;
  senderHandle: string | null;
  sentiment: MessageSentiment | null;
  aiSuggestedReply: string | null;
  aiConfidence: number | null;
  status: MessageStatus;
  createdAt: string;
}

// ── Sample data for demo rendering ───────────────────────────────────────────

export const PLATFORM_META: Record<string, { label: string; icon: string; color: string }> = {
  facebook:  { label: "Facebook",  icon: "Facebook Icon", color: "#1877F2" },
  instagram: { label: "Instagram", icon: "Instagram Icon", color: "#E1306C" },
  discord:   { label: "Discord",   icon: "Discord Icon", color: "#5865F2" },
  reddit:    { label: "Reddit",    icon: "Reddit Icon", color: "#FF4500" },
  tiktok:    { label: "TikTok",    icon: "TikTok Icon", color: "#000000" },
  linkedin:  { label: "LinkedIn",  icon: "LinkedIn Icon", color: "#0A66C2" },
  youtube:   { label: "YouTube",   icon: "YouTube Icon", color: "#FF0000" },
  pinterest: { label: "Pinterest", icon: "Pinterest Icon", color: "#E60023" },
};

export const SENTIMENT_BADGE: Record<MessageSentiment, { label: string; variant: "success" | "muted" | "danger" | "warning" }> = {
  positive: { label: "Positive", variant: "success" },
  neutral:  { label: "Neutral",  variant: "muted" },
  negative: { label: "Negative", variant: "danger" },
  urgent:   { label: "Urgent",   variant: "warning" },
};

export const STATUS_BADGE: Record<ConversationStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" | "outline" }> = {
  open:     { label: "Open",     variant: "default" },
  pending:  { label: "Pending",  variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  spam:     { label: "Spam",     variant: "muted" },
};

export const PRIORITY_BADGE: Record<ConversationPriority, { label: string; variant: "muted" | "default" | "warning" | "danger" }> = {
  low:    { label: "Low",    variant: "muted" },
  normal: { label: "Normal", variant: "default" },
  high:   { label: "High",   variant: "warning" },
  urgent: { label: "Urgent", variant: "danger" },
};

// ── Static demo conversations (renders without DB) ────────────────────────────

export const DEMO_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "conv-1",
    platform: "instagram",
    platformConversationId: "ig-thread-001",
    participantHandle: "@sarah.bakery",
    status: "open",
    priority: "normal",
    assignedToUserId: null,
    sentimentSummary: "positive",
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastMessagePreview: "Love your new sourdough collection! Do you deliver to Brooklyn?",
    unreadCount: 2,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    platform: "facebook",
    platformConversationId: "fb-thread-002",
    participantHandle: "Mike T.",
    status: "open",
    priority: "high",
    assignedToUserId: null,
    sentimentSummary: "negative",
    lastMessageAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lastMessagePreview: "My order was wrong and nobody has responded. This is terrible service.",
    unreadCount: 1,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-3",
    platform: "discord",
    platformConversationId: "dc-thread-003",
    participantHandle: "breadlover42",
    status: "pending",
    priority: "normal",
    assignedToUserId: null,
    sentimentSummary: "neutral",
    lastMessageAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    lastMessagePreview: "What are your hours on Sunday? Are you open for brunch?",
    unreadCount: 0,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-4",
    platform: "reddit",
    platformConversationId: "reddit-thread-004",
    participantHandle: "u/sourdough_fan",
    status: "open",
    priority: "normal",
    assignedToUserId: null,
    sentimentSummary: "positive",
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lastMessagePreview: "Just tried their croissants — absolutely amazing! r/FoodNYC",
    unreadCount: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-5",
    platform: "facebook",
    platformConversationId: "fb-thread-005",
    participantHandle: "Emily R.",
    status: "open",
    priority: "urgent",
    assignedToUserId: null,
    sentimentSummary: "urgent",
    lastMessageAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    lastMessagePreview: "URGENT: Found a foreign object in my pastry. Need to speak to a manager ASAP.",
    unreadCount: 3,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export const DEMO_MESSAGES: Record<string, MessageItem[]> = {
  "conv-1": [
    {
      id: "msg-1a",
      conversationId: "conv-1",
      direction: "inbound",
      content: "Hi! I just discovered your bakery on Instagram and I'm obsessed!",
      senderHandle: "@sarah.bakery",
      sentiment: "positive",
      aiSuggestedReply: "Thank you so much! We really appreciate your kind words — it means a lot to us. Stay tuned for more!",
      aiConfidence: 88,
      status: "read",
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-1b",
      conversationId: "conv-1",
      direction: "inbound",
      content: "Love your new sourdough collection! Do you deliver to Brooklyn?",
      senderHandle: "@sarah.bakery",
      sentiment: "positive",
      aiSuggestedReply: "Thank you so much! We really appreciate your kind words — it means a lot to us. Stay tuned for more!",
      aiConfidence: 82,
      status: "unread",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ],
  "conv-2": [
    {
      id: "msg-2a",
      conversationId: "conv-2",
      direction: "inbound",
      content: "I ordered a birthday cake for yesterday and it arrived completely wrong. This is so disappointing.",
      senderHandle: "Mike T.",
      sentiment: "negative",
      aiSuggestedReply: null,
      aiConfidence: null,
      status: "escalated",
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-2b",
      conversationId: "conv-2",
      direction: "inbound",
      content: "My order was wrong and nobody has responded. This is terrible service.",
      senderHandle: "Mike T.",
      sentiment: "negative",
      aiSuggestedReply: null,
      aiConfidence: null,
      status: "escalated",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
  ],
  "conv-3": [
    {
      id: "msg-3a",
      conversationId: "conv-3",
      direction: "inbound",
      content: "What are your hours on Sunday? Are you open for brunch?",
      senderHandle: "breadlover42",
      sentiment: "neutral",
      aiSuggestedReply: "Great question! Our hours are posted in our profile bio. Feel free to DM us if you need anything else.",
      aiConfidence: 75,
      status: "read",
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
  ],
  "conv-4": [
    {
      id: "msg-4a",
      conversationId: "conv-4",
      direction: "inbound",
      content: "Just tried their croissants — absolutely amazing! r/FoodNYC",
      senderHandle: "u/sourdough_fan",
      sentiment: "positive",
      aiSuggestedReply: "Manual response required — community guidelines",
      aiConfidence: 0,
      status: "unread",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ],
  "conv-5": [
    {
      id: "msg-5a",
      conversationId: "conv-5",
      direction: "inbound",
      content: "URGENT: Found a foreign object in my pastry. Need to speak to a manager ASAP.",
      senderHandle: "Emily R.",
      sentiment: "urgent",
      aiSuggestedReply: null,
      aiConfidence: null,
      status: "escalated",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-5b",
      conversationId: "conv-5",
      direction: "inbound",
      content: "Hello? Is anyone there? This is an emergency situation.",
      senderHandle: "Emily R.",
      sentiment: "urgent",
      aiSuggestedReply: null,
      aiConfidence: null,
      status: "escalated",
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-5c",
      conversationId: "conv-5",
      direction: "inbound",
      content: "I will be calling the health department if I don't hear back immediately.",
      senderHandle: "Emily R.",
      sentiment: "urgent",
      aiSuggestedReply: null,
      aiConfidence: null,
      status: "unread",
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
  ],
};
