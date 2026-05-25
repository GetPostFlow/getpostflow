"use client";

import { useState } from "react";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";
import { PLATFORM_META, SENTIMENT_BADGE } from "../../../../lib/inbox-types";

// ── Demo data ─────────────────────────────────────────────────────────────────

type FlagReason = "spam" | "negative_sentiment" | "competitor_mention" | "keyword_match";

interface FlaggedComment {
  id: string;
  platform: string;
  postTitle: string;
  handle: string;
  content: string;
  reason: FlagReason;
  sentiment: "positive" | "neutral" | "negative" | "urgent";
  createdAt: string;
  status: "pending" | "hidden" | "approved";
}

const FLAG_REASON_META: Record<FlagReason, { label: string; icon: string }> = {
  spam: { label: "Spam", icon: "🚫" },
  negative_sentiment: { label: "Negative Sentiment", icon: "😤" },
  competitor_mention: { label: "Competitor Mention", icon: "⚔️" },
  keyword_match: { label: "Keyword Match", icon: "🔑" },
};

const DEMO_FLAGGED: FlaggedComment[] = [
  {
    id: "fc-1",
    platform: "instagram",
    postTitle: "New sourdough collection post",
    handle: "@spam_bot_9000",
    content: "CLICK HERE FOR FREE FOLLOWERS → bit.ly/fakescam",
    reason: "spam",
    sentiment: "neutral",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "fc-2",
    platform: "facebook",
    postTitle: "Weekend brunch promo",
    handle: "Jennifer W.",
    content: "Worst bakery experience I've ever had. Your competitor downtown is 10x better.",
    reason: "competitor_mention",
    sentiment: "negative",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "fc-3",
    platform: "instagram",
    postTitle: "Holiday special post",
    handle: "@grumpy_customer",
    content: "Overpriced garbage. I can't believe you charged me that much for a dry croissant.",
    reason: "negative_sentiment",
    sentiment: "negative",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "fc-4",
    platform: "discord",
    postTitle: "#general channel",
    handle: "rival_fan",
    content: "Have you guys tried BreadCo? Way better sourdough than this place tbh.",
    reason: "competitor_mention",
    sentiment: "neutral",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
];

const DEMO_TEMPLATES = [
  {
    id: "tmpl-1",
    title: "Business hours",
    content: "Hi! Our hours are Monday-Saturday 7am-7pm and Sunday 8am-5pm. You can find us at 123 Baker St. DM us if you have any other questions!",
    useCount: 24,
    tags: ["hours", "location"],
  },
  {
    id: "tmpl-2",
    title: "Pricing inquiry",
    content: "Thanks for asking! Prices vary by item — please check our website menu at getpostflow.com/menu or visit us in store for the full list. We also offer a catering menu for events!",
    useCount: 18,
    tags: ["pricing", "menu"],
  },
  {
    id: "tmpl-3",
    title: "Thank you",
    content: "Thank you so much for your kind words! 😍 We truly appreciate your support and can't wait to see you again soon. Let us know if there's anything else we can do for you!",
    useCount: 42,
    tags: ["positive", "thanks"],
  },
  {
    id: "tmpl-4",
    title: "Complaint acknowledgment",
    content: "We're truly sorry to hear about your experience. This doesn't reflect our standards and we want to make it right. Please DM us your order details so we can resolve this for you personally.",
    useCount: 9,
    tags: ["complaint", "negative"],
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Moderation Queue Tab ──────────────────────────────────────────────────────

function ModerationQueueTab() {
  const [items, setItems] = useState(DEMO_FLAGGED);

  function handleHide(id: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "hidden" } : item));
  }

  function handleApprove(id: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "approved" } : item));
  }

  const pending = items.filter((i) => i.status === "pending");
  const resolved = items.filter((i) => i.status !== "pending");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Flagged Comments
          {pending.length > 0 && (
            <span
              className="ml-2 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
              style={{ background: "var(--brand-danger)" }}
            >
              {pending.length}
            </span>
          )}
        </p>
        <Button variant="ghost" size="sm" className="text-xs">
          Configure auto-hide rules
        </Button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl border flex flex-col items-center justify-center py-16" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
          <span className="text-3xl mb-2">✅</span>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No flagged comments</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>You're all caught up</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-soft)" }}>
          {pending.map((item, idx) => {
            const pm = PLATFORM_META[item.platform] ?? { icon: "💬", label: item.platform, color: "#888" };
            const fr = FLAG_REASON_META[item.reason];
            const sb = SENTIMENT_BADGE[item.sentiment];
            return (
              <div
                key={item.id}
                className="px-4 py-4 flex gap-3"
                style={{
                  background: "var(--surface)",
                  borderBottom: idx < pending.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">{pm.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {item.handle}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      on "{item.postTitle}"
                    </span>
                    <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                      {fr.icon} {fr.label}
                    </Badge>
                    <Badge variant={sb.variant} className="text-[9px] px-1.5 py-0">
                      {sb.label}
                    </Badge>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {item.content}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="text-xs text-red-500" onClick={() => handleHide(item.id)}>
                    Hide
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleApprove(item.id)}>
                    Approve
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <details className="group">
          <summary className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
            {resolved.length} resolved item{resolved.length !== 1 ? "s" : ""}
          </summary>
          <div className="mt-2 rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-soft)", opacity: 0.6 }}>
            {resolved.map((item, idx) => {
              const pm = PLATFORM_META[item.platform] ?? { icon: "💬", label: item.platform, color: "#888" };
              return (
                <div
                  key={item.id}
                  className="px-4 py-3 flex gap-3 items-start"
                  style={{ background: "var(--surface)", borderBottom: idx < resolved.length - 1 ? "1px solid var(--border-soft)" : "none" }}
                >
                  <span className="text-sm">{pm.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.content}</p>
                  </div>
                  <Badge variant={item.status === "hidden" ? "muted" : "success"} className="text-[9px] px-1.5 py-0 flex-shrink-0">
                    {item.status === "hidden" ? "Hidden" : "Approved"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

// ── Engagement Templates Tab ──────────────────────────────────────────────────

function EngagementTemplatesTab() {
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(id: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Saved Reply Templates
        </p>
        <Button variant="primary" size="sm" className="text-xs">
          + New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            className="rounded-2xl border p-4 flex flex-col gap-3"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {tmpl.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Used {tmpl.useCount} times
                </p>
              </div>
              <div className="flex gap-1">
                {tmpl.tags.map((tag) => (
                  <Badge key={tag} variant="muted" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {tmpl.content}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => handleCopy(tmpl.id, tmpl.content)}
              >
                {copied === tmpl.id ? "Copied!" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Follow-up Reminders Tab ───────────────────────────────────────────────────

const DEMO_REMINDERS = [
  {
    id: "rem-1",
    handle: "Mike T.",
    platform: "facebook",
    message: "My order was wrong and nobody has responded.",
    overdueHours: 14,
  },
  {
    id: "rem-2",
    handle: "Emily R.",
    platform: "facebook",
    message: "URGENT: Found a foreign object in my pastry.",
    overdueHours: 0.3,
  },
  {
    id: "rem-3",
    handle: "@sarah.bakery",
    platform: "instagram",
    message: "Do you deliver to Brooklyn?",
    overdueHours: 3,
  },
];

function FollowUpRemindersTab() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Follow-up Reminders
      </p>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        Conversations unresolved for 24h (or escalated) trigger a notification to the assigned strategist.
      </p>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-soft)" }}>
        {DEMO_REMINDERS.map((rem, idx) => {
          const pm = PLATFORM_META[rem.platform] ?? { icon: "💬", label: rem.platform, color: "#888" };
          const isOverdue = rem.overdueHours >= 24;
          return (
            <div
              key={rem.id}
              className="px-4 py-4 flex gap-3 items-start"
              style={{
                background: "var(--surface)",
                borderBottom: idx < DEMO_REMINDERS.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}
            >
              <span className="text-base mt-0.5">{pm.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {rem.handle}
                  </span>
                  {isOverdue && (
                    <Badge variant="danger" className="text-[9px] px-1.5 py-0">
                      Overdue {rem.overdueHours}h
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {rem.message}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                Open
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "moderation" | "templates" | "reminders";

interface ClientOption {
  id: string;
  name: string;
}

interface CommunityManagementClientProps {
  clientList: ClientOption[];
}

export default function CommunityManagementClient({ clientList }: CommunityManagementClientProps) {
  const [tab, setTab] = useState<Tab>("moderation");

  const TABS: Array<{ id: Tab; label: string; icon: string }> = [
    { id: "moderation", label: "Moderation Queue", icon: "🛡" },
    { id: "templates", label: "Engagement Templates", icon: "📝" },
    { id: "reminders", label: "Follow-up Reminders", icon: "⏰" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Community Management
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Moderation queue, saved reply templates, and follow-up reminders for managing your clients&apos; community engagement.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border p-0.5 w-fit" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition"
            style={{
              background: tab === t.id ? "var(--brand-primary)" : "transparent",
              color: tab === t.id ? "white" : "var(--text-muted)",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "moderation" && <ModerationQueueTab />}
      {tab === "templates" && <EngagementTemplatesTab />}
      {tab === "reminders" && <FollowUpRemindersTab />}
    </div>
  );
}
