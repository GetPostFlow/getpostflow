"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";
import {
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

const FILTER_PLATFORMS = ["all", "facebook", "instagram", "linkedin", "tiktok", "youtube", "reddit", "x"];
const FILTER_STATUSES: Array<"all" | ConversationStatus> = ["all", "open", "pending", "resolved", "spam"];
const FILTER_PRIORITIES: Array<"all" | ConversationPriority> = ["all", "urgent", "high", "normal", "low"];

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiConversation extends ConversationSummary {
  clientId: string;
}

interface ApiMessage extends MessageItem {
  id: string;
  conversationId: string;
  createdAt: string;
}

interface ApiNote {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string | null;
}

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
      <div
        className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
        style={{ background: pm.color, minWidth: "2.25rem" }}
      >
        {initials(conv.participantHandle ?? "?")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {conv.participantHandle ?? "Unknown"}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
            {timeAgo(conv.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px]">{pm.icon}</span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{pm.label}</span>
          {conv.priority !== "normal" && (
            <Badge variant={pb.variant} className="text-[9px] px-1.5 py-0">{pb.label}</Badge>
          )}
          {sb && (
            <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">{sb.label}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-xs truncate flex-1" style={{ color: conv.unreadCount > 0 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: conv.unreadCount > 0 ? 500 : 400 }}>
            {conv.lastMessagePreview}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "var(--brand-primary)" }}>
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ApiMessage }) {
  const isOutbound = msg.direction === "outbound";
  const sb = msg.sentiment ? SENTIMENT_BADGE[msg.sentiment] : null;

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"} gap-2`}>
      {!isOutbound && (
        <div className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1" style={{ background: "var(--brand-secondary)" }}>
          {msg.senderHandle ? initials(msg.senderHandle) : "?"}
        </div>
      )}
      <div className={`max-w-[72%] ${isOutbound ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed" style={{ background: isOutbound ? "var(--brand-primary)" : "var(--surface)", color: isOutbound ? "white" : "var(--text-primary)", border: isOutbound ? "none" : "1px solid var(--border-soft)", boxShadow: "0 2px 8px rgba(31,36,48,0.06)" }}>
          {msg.content}
        </div>
        <div className="flex items-center gap-1.5">
          {sb && !isOutbound && <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">{sb.label}</Badge>}
          {msg.status === "escalated" && <Badge variant="danger" className="text-[9px] px-1.5 py-0">Escalated</Badge>}
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{timeAgo(msg.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ── AI suggestion box ─────────────────────────────────────────────────────────

function AiSuggestionBox({ reply, confidence, platform, isReddit, onUse }: { reply: string | null; confidence: number | null; platform: string; isReddit: boolean; onUse: (text: string) => void }) {
  if (isReddit) {
    return (
      <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
        <p className="text-xs font-semibold" style={{ color: "var(--brand-warning)" }}>Manual response required — community guidelines</p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Reddit requires human-only responses. The reply button is disabled for Reddit conversations.</p>
      </div>
    );
  }
  if (!reply) {
    return (
      <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No AI suggestion — requires human review.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border px-4 py-3 flex flex-col gap-2" style={{ borderColor: "var(--brand-primary)", background: "rgba(47,93,98,0.04)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>AI Suggested Reply</span>
        {confidence !== null && confidence > 0 && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{confidence}% confidence</span>}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reply}</p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={() => onUse(reply)} className="text-xs">Use suggestion</Button>
        <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
      </div>
    </div>
  );
}

// ── Thread panel ──────────────────────────────────────────────────────────────

function ThreadPanel({ conv, onClose, onMutate }: { conv: ApiConversation; onClose: () => void; onMutate: () => void }) {
  const [msgs, setMsgs] = useState<ApiMessage[]>([]);
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "notes" | "activity">("messages");

  const pm = PLATFORM_META[conv.platform] ?? { label: conv.platform, icon: "💬", color: "#888" };
  const sb = STATUS_BADGE[conv.status];
  const isReddit = conv.platform === "reddit";
  const lastInbound = [...msgs].reverse().find((m) => m.direction === "inbound");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/inbox/conversations/${conv.id}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      if (cancelled) return;
      setMsgs(data.messages ?? []);
      setNotes(data.notes ?? []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [conv.id]);

  async function handleSend() {
    if (!replyText.trim() || isReddit) return;
    setSending(true);
    const res = await fetch(`/api/inbox/conversations/${conv.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setMsgs((prev) => [...prev, data.message]);
      setReplyText("");
      onMutate();
    }
    setSending(false);
  }

  async function handleEscalate() {
    const res = await fetch(`/api/inbox/conversations/${conv.id}/escalate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Manual escalation from inbox" }) });
    if (res.ok) { onMutate(); }
  }

  async function handleResolve() {
    const res = await fetch(`/api/inbox/conversations/${conv.id}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: null }) });
    if (res.ok) { onMutate(); onClose(); }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    const res = await fetch(`/api/inbox/conversations/${conv.id}/note`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: noteText.trim() }) });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setNoteText("");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border-soft)" }}>
        <button onClick={onClose} className="md:hidden flex items-center justify-center h-7 w-7 rounded-lg transition hover:bg-[var(--subtle)]" style={{ color: "var(--text-muted)" }} aria-label="Back">←</button>
        <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: pm.color }}>{initials(conv.participantHandle ?? "?")}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{conv.participantHandle ?? "Unknown"}</span>
            <span className="text-xs">{pm.icon}</span>
            <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">{sb.label}</Badge>
          </div>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{pm.label} · Started {timeAgo(conv.createdAt)} ago</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleEscalate}>Escalate</Button>
          <Button variant="secondary" size="sm" className="text-xs" onClick={handleResolve}>Resolve</Button>
        </div>
      </div>

      {isReddit && (
        <div className="mx-4 mt-3 rounded-2xl border px-4 py-2.5 text-xs" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
          <span className="font-semibold" style={{ color: "var(--brand-warning)" }}>Reddit — Monitoring only. </span>
          <span style={{ color: "var(--text-secondary)" }}>Reddit requires human-only responses per platform policy. Automated replies are disabled.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-2 border-b" style={{ borderColor: "var(--border-soft)" }}>
        {(["messages", "notes", "activity"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className="text-xs px-2 py-1 capitalize" style={{ color: activeTab === t ? "var(--brand-primary)" : "var(--text-muted)", borderBottom: activeTab === t ? "2px solid var(--brand-primary)" : "2px solid transparent" }}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {activeTab === "messages" && (
          <>
            {loading && <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Loading…</p>}
            {!loading && msgs.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {!loading && msgs.length === 0 && <p className="text-center text-xs py-8" style={{ color: "var(--text-muted)" }}>No messages yet.</p>}
          </>
        )}
        {activeTab === "notes" && (
          <>
            <div className="flex gap-2 items-end">
              <textarea className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)", minHeight: "60px" }} placeholder="Add internal note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <Button variant="secondary" size="sm" disabled={!noteText.trim()} onClick={handleAddNote}>Add</Button>
            </div>
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl border px-3 py-2" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
                <p className="text-xs" style={{ color: "var(--text-primary)" }}>{n.content}</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{n.userName ?? "Team"} · {timeAgo(n.createdAt)}</p>
              </div>
            ))}
            {notes.length === 0 && <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>No internal notes.</p>}
          </>
        )}
        {activeTab === "activity" && (
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Activity log will be shown here.</p>
        )}
      </div>

      {activeTab === "messages" && (
        <>
          {lastInbound && (
            <div className="px-4 pb-2">
              <AiSuggestionBox reply={lastInbound.aiSuggestedReply ?? null} confidence={lastInbound.aiConfidence ?? null} platform={conv.platform} isReddit={isReddit} onUse={(text) => setReplyText(text)} />
            </div>
          )}
          <div className="px-4 pb-4 pt-2 border-t flex gap-2 items-end" style={{ borderColor: "var(--border-soft)" }}>
            <textarea className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border-soft)", background: isReddit ? "var(--subtle)" : "var(--surface)", color: "var(--text-primary)", minHeight: "72px", opacity: isReddit ? 0.5 : 1 }} placeholder={isReddit ? "Reddit requires human-only responses per platform policy" : "Write a reply…"} disabled={isReddit} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
            <Button variant="primary" size="sm" disabled={isReddit || !replyText.trim() || sending} onClick={handleSend}>{sending ? "Sending…" : "Send"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main inbox client ─────────────────────────────────────────────────────────

interface ClientOption {
  id: string;
  name: string;
}

interface InboxClientProps {
  clientList: ClientOption[];
}

export default function InboxClient({ clientList }: InboxClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ConversationStatus>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | ConversationPriority>("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  async function fetchConversations() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform !== "all") params.set("platform", filterPlatform);
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterPriority !== "all") params.set("priority", filterPriority);
    if (search.trim()) params.set("search", search.trim());
    params.set("limit", "50");
    const res = await fetch(`/api/inbox/conversations?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPlatform, filterStatus, filterPriority]);

  useEffect(() => {
    const t = setTimeout(() => fetchConversations(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;
  const unreadTotal = conversations.reduce((n, c) => n + c.unreadCount, 0);

  return (
    <div className="flex flex-col gap-0 h-[calc(100vh-7rem)]">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Unified Inbox
              {unreadTotal > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: "var(--brand-primary)" }}>{unreadTotal}</span>
              )}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              All incoming messages, comments, and DMs across your clients&apos; connected social accounts — in one unified feed. {total} conversation{total !== 1 ? "s" : ""} · Realtime updates active
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            {FILTER_PLATFORMS.map((p) => (
              <button key={p} onClick={() => setFilterPlatform(p)} className="rounded-lg px-3 py-1 text-xs font-medium capitalize transition" style={{ background: filterPlatform === p ? "var(--brand-primary)" : "transparent", color: filterPlatform === p ? "white" : "var(--text-muted)" }}>
                {p === "all" ? "All" : (PLATFORM_META[p]?.icon ?? "") + " " + (PLATFORM_META[p]?.label ?? p)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            {FILTER_STATUSES.map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className="rounded-lg px-3 py-1 text-xs font-medium capitalize transition" style={{ background: filterStatus === s ? "var(--brand-primary)" : "transparent", color: filterStatus === s ? "white" : "var(--text-muted)" }}>
                {s === "all" ? "All status" : s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            {FILTER_PRIORITIES.map((p) => (
              <button key={p} onClick={() => setFilterPriority(p)} className="rounded-lg px-3 py-1 text-xs font-medium capitalize transition" style={{ background: filterPriority === p ? "var(--brand-primary)" : "transparent", color: filterPriority === p ? "white" : "var(--text-muted)" }}>
                {p === "all" ? "All priority" : p}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search handle or message…"
            className="rounded-xl border px-3 py-1 text-xs outline-none"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
        <div className={`flex-shrink-0 overflow-y-auto border-r ${selectedConv ? "hidden md:flex md:flex-col" : "flex flex-col"}`} style={{ width: "320px", minWidth: "280px", borderColor: "var(--border-soft)" }}>
          {loading && <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>Loading…</p>}
          {!loading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
              <span className="text-3xl">💬</span>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No conversations match</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
            </div>
          )}
          {!loading && conversations.map((conv) => (
            <ConvListItem key={conv.id} conv={conv} selected={conv.id === selectedId} onClick={() => setSelectedId(conv.id)} />
          ))}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {selectedConv ? (
            <ThreadPanel conv={selectedConv} onClose={() => setSelectedId(null)} onMutate={fetchConversations} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--subtle)" }}>💬</div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Select a conversation</p>
              <p className="text-xs text-center max-w-[200px]" style={{ color: "var(--text-muted)" }}>Choose a conversation from the list to view messages and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
