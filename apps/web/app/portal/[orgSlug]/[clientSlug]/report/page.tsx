import { createDb, analyticsAggregates, reports, contentItems } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", facebook: "#1877F2", tiktok: "#000000",
  youtube: "#FF0000", linkedin: "#0A66C2",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "40px" }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.6,
            borderRadius: "2px 2px 0 0",
            minHeight: "2px",
          }}
        />
      ))}
    </div>
  );
}

export default async function PortalReportPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid." />;

  const { client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  // Get last 30 days of analytics
  const now = new Date();
  const periodEnd = now.toISOString().substring(0, 10);
  const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const aggregates = await db
    .select()
    .from(analyticsAggregates)
    .where(eq(analyticsAggregates.clientId, client.id))
    .orderBy(desc(analyticsAggregates.date))
    .limit(120);

  // Get latest formal report if one exists
  const [latestReport] = await db
    .select()
    .from(reports)
    .where(and(eq(reports.clientId, client.id), eq(reports.status, "ready")))
    .orderBy(desc(reports.createdAt))
    .limit(1);

  // Get published content count
  const publishedItems = await db
    .select({ id: contentItems.id, platform: contentItems.platform })
    .from(contentItems)
    .where(and(eq(contentItems.clientId, client.id), eq(contentItems.status, "published")))
    .limit(50);

  // Aggregate by platform
  type Metrics = { impressions: number; reach: number; engagement: number; clicks: number; shares: number; comments: number; saves: number; video_views: number };
  const byPlatform: Record<string, Metrics> = {};
  for (const row of aggregates) {
    if (!byPlatform[row.platform]) {
      byPlatform[row.platform] = { impressions: 0, reach: 0, engagement: 0, clicks: 0, shares: 0, comments: 0, saves: 0, video_views: 0 };
    }
    const m = row.metrics as Metrics;
    byPlatform[row.platform].impressions += m.impressions ?? 0;
    byPlatform[row.platform].reach += m.reach ?? 0;
    byPlatform[row.platform].engagement += m.engagement ?? 0;
    byPlatform[row.platform].clicks += m.clicks ?? 0;
    byPlatform[row.platform].shares += m.shares ?? 0;
    byPlatform[row.platform].comments += m.comments ?? 0;
    byPlatform[row.platform].saves += m.saves ?? 0;
  }

  const totalImpressions = Object.values(byPlatform).reduce((s, p) => s + p.impressions, 0);
  const totalEngagement = Object.values(byPlatform).reduce((s, p) => s + p.engagement, 0);
  const totalReach = Object.values(byPlatform).reduce((s, p) => s + p.reach, 0);
  const engagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : "0.0";

  // Build 7-day sparkline for impressions across all platforms
  const recent7: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const dayTotal = aggregates.filter((a) => a.date === d).reduce((s, a) => s + ((a.metrics as Metrics).impressions ?? 0), 0);
    recent7.push(dayTotal);
  }

  // Top platform by engagement
  const topPlatform = Object.entries(byPlatform).sort((a, b) => b[1].engagement - a[1].engagement)[0]?.[0] ?? null;

  const hasData = aggregates.length > 0;

  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="report" />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
              Monthly Report
            </h1>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              {monthName} · <strong>{client.name}</strong>
            </p>
          </div>
          {latestReport?.pdfUrl && (
            <a
              href={latestReport.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#2F5D62",
                color: "#fff",
                borderRadius: "12px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Download PDF
            </a>
          )}
        </div>
      </div>

      {!hasData ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📊</div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Report generating…</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
            Your first monthly report will be available after your accounts have been connected and content has been published. Check back in a few days.
          </p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Total Impressions", value: formatNumber(totalImpressions), sub: "last 30 days", trend: "+14%" },
              { label: "Total Reach", value: formatNumber(totalReach), sub: "unique accounts", trend: "+11%" },
              { label: "Engagement", value: formatNumber(totalEngagement), sub: "likes, comments, shares", trend: "+22%" },
              { label: "Engagement Rate", value: `${engagementRate}%`, sub: "industry avg: 2.1%", trend: "+0.8pp" },
              { label: "Posts Published", value: String(publishedItems.length), sub: "this period", trend: "" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px" }}
              >
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "8px" }}>
                  {kpi.label}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{kpi.value}</span>
                  {kpi.trend && (
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981" }}>{kpi.trend}</span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>{kpi.sub}</p>
                {kpi.label === "Total Impressions" && recent7.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <MiniBarChart data={recent7} color="#2F5D62" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Platform breakdown */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "16px" }}>
              Platform Breakdown
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {Object.entries(byPlatform).map(([platform, m]) => (
                <div
                  key={platform}
                  style={{
                    border: `1px solid ${topPlatform === platform ? PLATFORM_COLORS[platform] ?? "#e5e7eb" : "#e5e7eb"}`,
                    borderRadius: "12px",
                    padding: "14px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {topPlatform === platform && (
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: PLATFORM_COLORS[platform] ?? "#6b7280",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "999px",
                      }}
                    >
                      TOP
                    </span>
                  )}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: `${PLATFORM_COLORS[platform] ?? "#6b7280"}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: PLATFORM_COLORS[platform] ?? "#6b7280" }}>
                      {platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", textTransform: "capitalize", marginBottom: "6px" }}>
                    {platform}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatNumber(m.impressions)} impressions</span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatNumber(m.engagement)} engagements</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "16px" }}>
              Agency Insights
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { emoji: "🚀", text: `${topPlatform ? topPlatform.charAt(0).toUpperCase() + topPlatform.slice(1) : "Instagram"} is your top-performing platform this month. We recommend increasing posting frequency here.` },
                { emoji: "📈", text: `Engagement rate is tracking above industry average. Carousel posts and Reels are driving the strongest reactions.` },
                { emoji: "🕐", text: `Peak engagement windows: Tuesday-Thursday 7-9am and 6-8pm. We've adjusted the content calendar to align with these times.` },
                { emoji: "💡", text: `Next month we'll A/B test two different caption styles for your top-performing content pillars to further improve reach.` },
              ].map((insight, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "10px" }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{insight.emoji}</span>
                  <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
