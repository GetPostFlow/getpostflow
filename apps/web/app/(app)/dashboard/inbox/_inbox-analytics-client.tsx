"use client";

import { Badge } from "@getpostflow/ui/badge";
import { DEMO_CONVERSATIONS, PLATFORM_META, SENTIMENT_BADGE } from "../../../../lib/inbox-types";

// ── Demo analytics derived from static conversations ─────────────────────────

const PLATFORMS = Object.keys(PLATFORM_META);

function platformCount(platform: string) {
  return DEMO_CONVERSATIONS.filter((c) => c.platform === platform).length;
}

function platformBreakdown() {
  return PLATFORMS.map((p) => ({ platform: p, count: platformCount(p) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

const sentimentCounts = {
  positive: DEMO_CONVERSATIONS.filter((c) => c.sentimentSummary === "positive").length,
  neutral: DEMO_CONVERSATIONS.filter((c) => c.sentimentSummary === "neutral").length,
  negative: DEMO_CONVERSATIONS.filter((c) => c.sentimentSummary === "negative").length,
  urgent: DEMO_CONVERSATIONS.filter((c) => c.sentimentSummary === "urgent").length,
};

const total = DEMO_CONVERSATIONS.length;
const positiveRatio = Math.round((sentimentCounts.positive / total) * 100);
const negativeRatio = Math.round((sentimentCounts.negative / total) * 100);

const AVG_RESPONSE_TIME_MINS = 14;
const AVG_RESOLUTION_TIME_HOURS = 3.2;

const SAMPLE_TOPICS = [
  { topic: "Delivery & shipping", count: 8 },
  { topic: "Product quality", count: 6 },
  { topic: "Business hours", count: 5 },
  { topic: "Pricing", count: 4 },
  { topic: "Recommendations", count: 3 },
];

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description?: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-2"
      style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          {value}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function InboxAnalyticsClient() {
  const breakdown = platformBreakdown();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Inbox Analytics
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Response times, sentiment trends, and platform breakdown
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Avg First Response"
          value={`${AVG_RESPONSE_TIME_MINS}m`}
          description="Last 7 days"
          icon="⚡"
        />
        <MetricCard
          label="Avg Resolution Time"
          value={`${AVG_RESOLUTION_TIME_HOURS}h`}
          description="Last 7 days"
          icon="✅"
        />
        <MetricCard
          label="Positive Sentiment"
          value={`${positiveRatio}%`}
          description={`${sentimentCounts.positive} of ${total} conversations`}
          icon="😊"
        />
        <MetricCard
          label="Negative Sentiment"
          value={`${negativeRatio}%`}
          description={`${sentimentCounts.negative} escalated`}
          icon="⚠️"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sentiment trend */}
        <div
          className="rounded-2xl border p-5 col-span-1 md:col-span-2 flex flex-col gap-4"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sentiment Breakdown
          </p>
          <div className="flex flex-col gap-3">
            {(["positive", "neutral", "negative", "urgent"] as const).map((s) => {
              const count = sentimentCounts[s];
              const pct = Math.round((count / total) * 100);
              const sb = SENTIMENT_BADGE[s];
              return (
                <div key={s} className="flex items-center gap-3">
                  <Badge variant={sb.variant} className="w-20 justify-center text-xs">
                    {sb.label}
                  </Badge>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--subtle)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          s === "positive" ? "var(--brand-success)"
                          : s === "negative" ? "var(--brand-danger)"
                          : s === "urgent" ? "var(--brand-warning)"
                          : "var(--text-muted)",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>
                    {pct}% ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform breakdown */}
        <div
          className="rounded-2xl border p-5 flex flex-col gap-4"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Platform Breakdown
          </p>
          <div className="flex flex-col gap-2">
            {breakdown.map(({ platform, count }) => {
              const pm = PLATFORM_META[platform]!;
              return (
                <div key={platform} className="flex items-center gap-2">
                  <span className="text-base">{pm.icon}</span>
                  <span className="flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {pm.label}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top topics */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Top Inquiry Topics
        </p>
        <div className="flex flex-col gap-2">
          {SAMPLE_TOPICS.map(({ topic, count }) => (
            <div key={topic} className="flex items-center gap-3">
              <span className="flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {topic}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "var(--subtle)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / 10) * 100}%`, background: "var(--brand-primary)" }}
                  />
                </div>
                <span className="text-xs w-4 text-right" style={{ color: "var(--text-muted)" }}>{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
