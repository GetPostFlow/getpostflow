"use client";

import { useState, useCallback } from "react";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";
import {
  DEMO_CONVERSATIONS,
  DEMO_MESSAGES,
  PLATFORM_META,
  SENTIMENT_BADGE,
  STATUS_BADGE,
  PRIORITY_BADGE,
  type ConversationSummary,
  type MessageItem,
  type ConversationStatus,
  type ConversationPriority,
} from "../../../../lib/inbox-types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function initials(handle: string): string {
  const clean = handle.replace(/[@u\/]/g, "");
  const parts = clean.split(/[\s._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

const FILTER_PLATFORMS = ["all", "facebook", "instagram", "discord", "reddit"];
const FILTER_STATUSES: Array<"all" | ConversationStatus> = ["all", "open", "pending", "resolved", "spam"];
const FILTER_PRIORITIES: Array<"all" | ConversationPriority> = ["all", "urgent", "high", "normal", "low"];

// ── Conversation list item ────────────────────────────────────────────────────

function ConvListItem({
  conv,
  selected,
  onClick,
}: {
  conv: ConversationSummary;
  selected: boolean;
  onClick: () => void;
}) {
  const pm = PLATFORM_META[conv.platform] ?? { label: conv.platform, icon: "💬", color: "#888" };
  const sb = conv.sentimentSummary ? SENTIMENT_BADGE[conv.sentimentSummary] : null;
  const pb = PRIORITY_BADGE[conv.priority];

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 transition flex gap-3 items-start"
      style={{
        background: selected ? "var(--subtle)" : "transparent",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      {/* Avatar */}
      <div
        className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
        style={{ background: pm.color, minWidth: "2.25rem" }}
      >
        {initials(conv.participantHandle)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {conv.participantHandle}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
            {timeAgo(conv.lastMessageAt)}
          </span>
        </div>

        {/* Platform + priority badges */}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px]">{pm.icon}</span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{pm.label}</span>
          {conv.priority !== "normal" && (
            <Badge variant={pb.variant} className="text-[9px] px-1.5 py-0">
              {pb.label}
            </Badge>
          )}
          {sb && (
            <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">
              {sb.label}
            </Badge>
          )}
        </div>

        {/* Preview + unread count */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className="text-xs truncate flex-1"
            style={{
              color: conv.unreadCount > 0 ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: conv.unreadCount > 0 ? 500 : 400,
            }}
          >
            {conv.lastMessagePreview}
          </p>
          {conv.unreadCount > 0 && (
            <span
              className="flex-shrink-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ background: "var(--brand-primary)" }}
            >
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: MessageItem }) {
  const isOutbound = msg.direction === "outbound";
  const sb = msg.sentiment ? SENTIMENT_BADGE[msg.sentiment] : null;

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"} gap-2`}>
      {!isOutbound && (
        <div
          className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1"
          style={{ background: "var(--brand-secondary)" }}
        >
          {msg.senderHandle ? initials(msg.senderHandle) : "?"}
        </div>
      )}

      <div className={`max-w-[72%] ${isOutbound ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
          style={{
            background: isOutbound ? "var(--brand-primary)" : "var(--surface)",
            color: isOutbound ? "white" : "var(--text-primary)",
            border: isOutbound ? "none" : "1px solid var(--border-soft)",
            boxShadow: "0 2px 8px rgba(31,36,48,0.06)",
          }}
        >
          {msg.content}
        </div>

        <div className="flex items-center gap-1.5">
          {sb && !isOutbound && (
            <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">
              {sb.label}
            </Badge>
          )}
          {msg.status === "escalated" && (
            <Badge variant="danger" className="text-[9px] px-1.5 py-0">
              Escalated
            </Badge>
          )}
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {timeAgo(msg.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── AI suggestion box ─────────────────────────────────────────────────────────

function AiSuggestionBox({
  reply,
  confidence,
  platform,
  isReddit,
  onUse,
}: {
  reply: string | null;
  confidence: number | null;
  platform: string;
  isReddit: boolean;
  onUse: (text: string) => void;
}) {
  if (isReddit) {
    return (
      <div
        className="rounded-2xl border px-4 py-3"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--subtle)",
        }}
      >
        <p className="text-xs font-semibold" style={{ color: "var(--brand-warning)" }}>
          Manual response required — community guidelines
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          Reddit requires human-only responses. The reply button is disabled for Reddit conversations.
        </p>
      </div>
    );
  }

  if (!reply) {
    return (
      <div
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          No AI suggestion — requires human review.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border px-4 py-3 flex flex-col gap-2"
      style={{ borderColor: "var(--brand-primary)", background: "rgba(47,93,98,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
          AI Suggested Reply
        </span>
        {confidence !== null && confidence > 0 && (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {confidence}% confidence
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {reply}
      </p>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onUse(reply)}
          className="text-xs"
        >
          Use suggestion
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          Edit
        </Button>
      </div>
    </div>
  );
}

// ── Thread panel ──────────────────────────────────────────────────────────────

function ThreadPanel({
  conv,
  onClose,
}: {
  conv: ConversationSummary;
  onClose: () => void;
}) {
  const msgs = DEMO_MESSAGES[conv.id] ?? [];
  const pm = PLATFORM_META[conv.platform] ?? { label: conv.platform, icon: "💬", color: "#888" };
  const sb = STATUS_BADGE[conv.status];
  const isReddit = conv.platform === "reddit";
  const lastInbound = [...msgs].reverse().find((m) => m.direction === "inbound");

  const [replyText, setReplyText] = useState(
    lastInbound?.aiSuggestedReply && !isReddit && lastInbound.sentiment !== "negative" && lastInbound.sentiment !== "urgent"
      ? lastInbound.aiSuggestedReply
      : ""
  );
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!replyText.trim() || isReddit) return;
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setReplyText("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <button
          onClick={onClose}
          className="md:hidden flex items-center justify-center h-7 w-7 rounded-lg transition hover:bg-[var(--subtle)]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Back to conversation list"
        >
          ←
        </button>

        <div
          className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
          style={{ background: pm.color }}
        >
          {initials(conv.participantHandle)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {conv.participantHandle}
            </span>
            <span className="text-xs">{pm.icon}</span>
            <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">
              {sb.label}
            </Badge>
          </div>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {pm.label} · Started {timeAgo(conv.createdAt)} ago
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="text-xs">
            Assign
          </Button>
          <Button variant="secondary" size="sm" className="text-xs">
            Resolve
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            Spam
          </Button>
        </div>
      </div>

      {/* Reddit callout */}
      {isReddit && (
        <div
          className="mx-4 mt-3 rounded-2xl border px-4 py-2.5 text-xs"
          style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
        >
          <span className="font-semibold" style={{ color: "var(--brand-warning)" }}>
            Reddit — Monitoring only.{" "}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>
            Reddit requires human-only responses per platform policy. Automated replies are disabled.
          </span>
        </div>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {msgs.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {msgs.length === 0 && (
          <p className="text-center text-xs py-8" style={{ color: "var(--text-muted)" }}>
            No messages yet.
          </p>
        )}
      </div>

      {/* AI suggestion */}
      {lastInbound && (
        <div className="px-4 pb-2">
          <AiSuggestionBox
            reply={lastInbound.aiSuggestedReply}
            confidence={lastInbound.aiConfidence}
            platform={conv.platform}
            isReddit={isReddit}
            onUse={(text) => setReplyText(text)}
          />
        </div>
      )}

      {/* Reply input */}
      <div
        className="px-4 pb-4 pt-2 border-t flex gap-2 items-end"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <textarea
          className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-1"
          style={{
            borderColor: "var(--border-soft)",
            background: isReddit ? "var(--subtle)" : "var(--surface)",
            color: "var(--text-primary)",
            minHeight: "72px",
            opacity: isReddit ? 0.5 : 1,
          }}
          placeholder={
            isReddit
              ? "Reddit requires human-only responses per platform policy"
              : "Write a reply…"
          }
          disabled={isReddit}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          title={
            isReddit
              ? "Reddit requires human-only responses per platform policy"
              : undefined
          }
        />
        <Button
          variant="primary"
          size="sm"
          disabled={isReddit || !replyText.trim()}
          onClick={handleSend}
          title={
            isReddit
              ? "Reddit requires human-only responses per platform policy"
              : "Send reply"
          }
        >
          {sent ? "Sent!" : "Send"}
        </Button>
      </div>
    </div>
  );
}

// ── Main inbox client ─────────────────────────────────────────────────────────

export default function InboxClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ConversationStatus>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | ConversationPriority>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = DEMO_CONVERSATIONS.filter((c) => {
    if (filterPlatform !== "all" && c.platform !== filterPlatform) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;
    return true;
  });

  const selectedConv = filtered.find((c) => c.id === selectedId) ?? null;
  const unreadTotal = DEMO_CONVERSATIONS.reduce((n, c) => n + c.unreadCount, 0);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const handleBulkResolve = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return (
    <div className="flex flex-col gap-0 h-[calc(100vh-7rem)]">
      {/* Top bar: title + filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Unified Inbox
              {unreadTotal > 0 && (
                <span
                  className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
                  style={{ background: "var(--brand-primary)" }}
                >
                  {unreadTotal}
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              All incoming messages, comments, and DMs across your clients&apos; connected social accounts — in one unified feed. {filtered.length} conversation{filtered.length !== 1 ? "s" : ""} · Realtime updates active
            </p>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {selectedIds.size} selected
              </span>
              <Button variant="secondary" size="sm" onClick={handleBulkResolve}>
                Resolve selected
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {/* Platform filter */}
          <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            {FILTER_PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className="rounded-lg px-3 py-1 text-xs font-medium capitalize transition"
                style={{
                  background: filterPlatform === p ? "var(--brand-primary)" : "transparent",
                  color: filterPlatform === p ? "white" : "var(--text-muted)",
                }}
              >
                {p === "all" ? "All" : (PLATFORM_META[p]?.icon ?? "") + " " + (PLATFORM_META[p]?.label ?? p)}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            {FILTER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="rounded-lg px-3 py-1 text-xs font-medium capitalize transition"
                style={{
                  background: filterStatus === s ? "var(--brand-primary)" : "transparent",
                  color: filterStatus === s ? "white" : "var(--text-muted)",
                }}
              >
                {s === "all" ? "All status" : s}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            {FILTER_PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className="rounded-lg px-3 py-1 text-xs font-medium capitalize transition"
                style={{
                  background: filterPriority === p ? "var(--brand-primary)" : "transparent",
                  color: filterPriority === p ? "white" : "var(--text-muted)",
                }}
              >
                {p === "all" ? "All priority" : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout: list + thread */}
      <div
        className="flex flex-1 min-h-0 rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
      >
        {/* Conversation list */}
        <div
          className={`flex-shrink-0 overflow-y-auto border-r ${selectedConv ? "hidden md:flex md:flex-col" : "flex flex-col"}`}
          style={{
            width: "320px",
            minWidth: "280px",
            borderColor: "var(--border-soft)",
          }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
              <span className="text-3xl">💬</span>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                No conversations match
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <div key={conv.id} className="relative group">
                {/* Bulk select checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(conv.id)}
                  onChange={() => toggleSelect(conv.id)}
                  className="absolute left-2 top-4 z-10 opacity-0 group-hover:opacity-100 transition"
                  style={{ accentColor: "var(--brand-primary)" }}
                  aria-label={`Select conversation with ${conv.participantHandle}`}
                />
                <ConvListItem
                  conv={conv}
                  selected={conv.id === selectedId}
                  onClick={() => setSelectedId(conv.id)}
                />
              </div>
            ))
          )}
        </div>

        {/* Thread panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          {selectedConv ? (
            <ThreadPanel
              conv={selectedConv}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "var(--subtle)" }}
              >
                💬
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Select a conversation
              </p>
              <p className="text-xs text-center max-w-[200px]" style={{ color: "var(--text-muted)" }}>
                Choose a conversation from the list to view messages and reply
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
