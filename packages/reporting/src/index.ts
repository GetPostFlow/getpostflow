/**
 * @getpostflow/reporting — Phase 6 expanded
 *
 * Reporting engine: PDF generation (branded), CSV export,
 * scheduled email delivery via Resend.
 */

// ─── Formats + domains ────────────────────────────────────────────────────────

export const reportFormats = ["csv", "pdf", "scheduled-email"] as const;

export const reportDomains = [
  "content_performance",
  "audience_growth",
  "engagement_performance",
  "community_activity",
  "lead_funnel_metrics",
  "platform_summary",
  "locale_summary",
] as const;

export type ReportFormat = (typeof reportFormats)[number];
export type ReportDomain = (typeof reportDomains)[number];

// ─── Report config ────────────────────────────────────────────────────────────

export type ReportFrequency = "weekly" | "biweekly" | "monthly";

export interface ReportScheduleConfig {
  clientId: string;
  orgId: string;
  frequency: ReportFrequency;
  dayValue: number; // 1-28 for monthly, 0-6 for weekly
  recipientEmails: string[];
  isActive: boolean;
}

// Plan gating: which frequencies are available per plan
export const PLAN_REPORT_FREQUENCIES: Record<string, ReportFrequency[]> = {
  starter: ["monthly"],
  growth: ["monthly", "biweekly"],
  scale: ["monthly", "biweekly", "weekly"],
  agency: ["monthly", "biweekly", "weekly"],
};

export function getAllowedFrequencies(planCode: string): ReportFrequency[] {
  const code = planCode.toLowerCase();
  for (const [key, freqs] of Object.entries(PLAN_REPORT_FREQUENCIES)) {
    if (code.includes(key)) return freqs;
  }
  return ["monthly"];
}

// ─── Report summary types ─────────────────────────────────────────────────────

export interface PlatformReportSection {
  platform: string;
  totalImpressions: number;
  totalReach: number;
  totalEngagements: number;
  avgEngagementRate: number;
  followerGrowth: number;
  topPostTitle?: string;
  topPostEngagements?: number;
  topPostUrl?: string;
}

export interface ExecutiveSummary {
  keyWins: string[];
  topRecommendations: string[];
  nextMonthFocus: string[];
  overallSentiment: "positive" | "neutral" | "needs_attention";
  highlightStat: string; // e.g. "Total reach grew 23% this month"
}

export interface CommunityHealthSection {
  totalConversations: number;
  resolvedConversations: number;
  avgResponseTimeMinutes: number;
  positiveSentimentPct: number;
  neutralSentimentPct: number;
  negativeSentimentPct: number;
  topIssueCategories: string[];
}

export interface ReportPayload {
  clientId: string;
  clientName: string;
  orgName: string;
  logoUrl?: string;
  brandColor: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  executiveSummary: ExecutiveSummary;
  platformSections: PlatformReportSection[];
  communityHealth: CommunityHealthSection;
  topPosts: {
    title: string;
    platform: string;
    engagements: number;
    reach: number;
    publishedAt: string;
  }[];
  actionItems: string[];
  learningInsights: string[];
}

// ─── Build executive summary from metrics ─────────────────────────────────────

export function buildExecutiveSummary(
  platformSections: PlatformReportSection[],
  communityHealth: CommunityHealthSection,
  learningInsights: string[]
): ExecutiveSummary {
  const totalReach = platformSections.reduce((s, p) => s + p.totalReach, 0);
  const avgER = platformSections.length > 0
    ? platformSections.reduce((s, p) => s + p.avgEngagementRate, 0) / platformSections.length
    : 0;

  const topPlatform = [...platformSections].sort((a, b) => b.totalReach - a.totalReach)[0];

  const keyWins: string[] = [];
  if (avgER > 0.04) keyWins.push(`Strong engagement rate of ${(avgER * 100).toFixed(1)}% across platforms — above the 4% industry benchmark.`);
  if (topPlatform) keyWins.push(`${cap(topPlatform.platform)} was the top-performing platform with ${topPlatform.totalReach.toLocaleString()} reach.`);
  if (communityHealth.avgResponseTimeMinutes < 30) keyWins.push(`Excellent community response time — average ${communityHealth.avgResponseTimeMinutes.toFixed(0)} minutes.`);
  if (learningInsights.length > 0) keyWins.push(learningInsights[0]!);

  const topRecommendations = [
    avgER < 0.03 ? "Increase visual quality and add stronger CTAs to improve engagement rate." : "Maintain current content mix — engagement is performing well.",
    communityHealth.negativeSentimentPct > 0.2
      ? "Address negative community sentiment proactively — 20%+ of conversations show concerns."
      : "Community sentiment is healthy. Focus on growing reach through shares and reposts.",
    `Double down on ${topPlatform?.platform ?? "top"} content — it drives the most reach.`,
  ];

  const nextMonthFocus = [
    "Increase posting frequency on top-performing platform by 20%.",
    "Test carousel format to boost saves and shares.",
    "Schedule posts at peak engagement times identified in the heatmap.",
  ];

  const overallSentiment: ExecutiveSummary["overallSentiment"] =
    avgER > 0.04 && communityHealth.positiveSentimentPct > 0.6
      ? "positive"
      : avgER < 0.02 || communityHealth.negativeSentimentPct > 0.3
      ? "needs_attention"
      : "neutral";

  const highlightStat = `Total reach: ${totalReach.toLocaleString()} · Avg ER: ${(avgER * 100).toFixed(1)}%`;

  return { keyWins, topRecommendations, nextMonthFocus, overallSentiment, highlightStat };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export function metricsToCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          const s = String(v ?? "");
          return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

// ─── PDF section builders (HTML-based, rendered server-side) ─────────────────

/**
 * Builds a server-renderable HTML string for the PDF report.
 * In production this is passed to a headless browser (Puppeteer/playwright)
 * or a PDF library like @react-pdf/renderer.
 * For Phase 6 we generate the HTML structure that can be converted.
 */
export function buildReportHtml(payload: ReportPayload): string {
  const sentimentColor =
    payload.executiveSummary.overallSentiment === "positive"
      ? "#22c55e"
      : payload.executiveSummary.overallSentiment === "needs_attention"
      ? "#ef4444"
      : "#f59e0b";

  const platformRows = payload.platformSections
    .map(
      (p) => `
      <tr>
        <td>${cap(p.platform)}</td>
        <td>${p.totalImpressions.toLocaleString()}</td>
        <td>${p.totalReach.toLocaleString()}</td>
        <td>${p.totalEngagements.toLocaleString()}</td>
        <td>${(p.avgEngagementRate * 100).toFixed(2)}%</td>
        <td>+${p.followerGrowth.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const topPostRows = payload.topPosts
    .slice(0, 5)
    .map(
      (p) => `
      <tr>
        <td>${p.title.slice(0, 50)}</td>
        <td>${cap(p.platform)}</td>
        <td>${p.engagements.toLocaleString()}</td>
        <td>${p.reach.toLocaleString()}</td>
        <td>${new Date(p.publishedAt).toLocaleDateString()}</td>
      </tr>`
    )
    .join("");

  const wins = payload.executiveSummary.keyWins
    .map((w) => `<li>${w}</li>`)
    .join("");

  const recs = payload.executiveSummary.topRecommendations
    .map((r) => `<li>${r}</li>`)
    .join("");

  const actions = payload.actionItems
    .map((a, i) => `<div class="action-item"><span class="action-num">${i + 1}</span> ${a}</div>`)
    .join("");

  const insights = payload.learningInsights
    .slice(0, 3)
    .map((ins) => `<li>${ins}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a2e; background: #fff; }
  .cover { background: ${payload.brandColor}; color: #fff; padding: 60px 48px; min-height: 260px; display: flex; flex-direction: column; justify-content: space-between; }
  .cover h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
  .cover .subtitle { font-size: 14px; opacity: 0.8; }
  .cover .period { font-size: 13px; opacity: 0.7; margin-top: 16px; }
  .section { padding: 40px 48px; border-bottom: 1px solid #f0f0f0; }
  .section h2 { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: ${payload.brandColor}; }
  .highlight { background: #f8faff; border-left: 4px solid ${payload.brandColor}; padding: 16px 20px; border-radius: 0 8px 8px 0; font-weight: 600; margin-bottom: 16px; }
  .badge { display: inline-flex; align-items: center; gap: 8px; background: ${sentimentColor}22; color: ${sentimentColor}; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; font-size: 13px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: ${payload.brandColor}11; text-align: left; padding: 8px 12px; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
  tr:hover td { background: #fafafa; }
  .action-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; font-size: 13px; }
  .action-num { background: ${payload.brandColor}; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-box { background: #f8faff; border-radius: 12px; padding: 16px; }
  .stat-box .val { font-size: 24px; font-weight: 700; color: ${payload.brandColor}; }
  .stat-box .lbl { font-size: 11px; color: #666; margin-top: 4px; }
  .footer { padding: 24px 48px; text-align: center; font-size: 11px; color: #999; }
  .gpf-logo { font-size: 11px; font-weight: 600; opacity: 0.6; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>

<!-- Cover page -->
<div class="cover">
  <div>
    <div style="font-size:12px;opacity:0.7;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.12em;">Performance Report</div>
    <h1>${payload.clientName}</h1>
    <div class="subtitle">${payload.orgName}</div>
    <div class="period">Period: ${payload.periodStart} — ${payload.periodEnd}</div>
  </div>
  <div style="font-size:11px;opacity:0.6;">Generated ${new Date(payload.generatedAt).toLocaleDateString()} · Powered by GetPostFlow</div>
</div>

<!-- Executive Summary -->
<div class="section">
  <h2>Executive Summary</h2>
  <div class="highlight">${payload.executiveSummary.highlightStat}</div>
  <div class="badge">Overall: ${cap(payload.executiveSummary.overallSentiment.replace("_", " "))}</div>

  <h3 style="font-size:14px;font-weight:600;margin-bottom:10px;margin-top:16px;">Key Wins</h3>
  <ul>${wins}</ul>

  <h3 style="font-size:14px;font-weight:600;margin-bottom:10px;margin-top:16px;">Recommendations</h3>
  <ul>${recs}</ul>

  <h3 style="font-size:14px;font-weight:600;margin-bottom:10px;margin-top:16px;">Next Month Focus</h3>
  <ul>${payload.executiveSummary.nextMonthFocus.map((f) => `<li>${f}</li>`).join("")}</ul>
</div>

<!-- Platform Breakdown -->
<div class="section">
  <h2>Platform Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Platform</th>
        <th>Impressions</th>
        <th>Reach</th>
        <th>Engagements</th>
        <th>Eng. Rate</th>
        <th>Follower Growth</th>
      </tr>
    </thead>
    <tbody>${platformRows}</tbody>
  </table>
</div>

<!-- Top Posts -->
<div class="section">
  <h2>Top Performing Content</h2>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Platform</th>
        <th>Engagements</th>
        <th>Reach</th>
        <th>Published</th>
      </tr>
    </thead>
    <tbody>${topPostRows}</tbody>
  </table>
</div>

<!-- Community Health -->
<div class="section">
  <h2>Community Health</h2>
  <div class="stat-grid">
    <div class="stat-box">
      <div class="val">${payload.communityHealth.totalConversations}</div>
      <div class="lbl">Total Conversations</div>
    </div>
    <div class="stat-box">
      <div class="val">${payload.communityHealth.avgResponseTimeMinutes.toFixed(0)}m</div>
      <div class="lbl">Avg Response Time</div>
    </div>
    <div class="stat-box">
      <div class="val">${(payload.communityHealth.positiveSentimentPct * 100).toFixed(0)}%</div>
      <div class="lbl">Positive Sentiment</div>
    </div>
  </div>
</div>

<!-- AI Learning Insights -->
${insights ? `
<div class="section">
  <h2>AI Learning Insights</h2>
  <ul>${insights}</ul>
</div>
` : ""}

<!-- Action Items -->
<div class="section">
  <h2>Action Items</h2>
  ${actions}
</div>

<div class="footer">
  <div class="gpf-logo">GetPostFlow · ${payload.orgName}</div>
  <div style="margin-top:4px;">Confidential — for ${payload.clientName} only</div>
</div>

</body>
</html>`;
}

// ─── Next send date calculator ─────────────────────────────────────────────────

export function calculateNextSendDate(frequency: ReportFrequency, dayValue: number, from = new Date()): Date {
  const next = new Date(from);

  if (frequency === "monthly") {
    // Last day of current month
    next.setMonth(next.getMonth() + 1, 0);
    next.setHours(8, 0, 0, 0);
    return next;
  }

  if (frequency === "biweekly") {
    next.setDate(next.getDate() + 14);
    next.setHours(8, 0, 0, 0);
    return next;
  }

  // weekly: next occurrence of dayValue (0=Sun)
  const daysUntil = (dayValue - from.getDay() + 7) % 7 || 7;
  next.setDate(next.getDate() + daysUntil);
  next.setHours(8, 0, 0, 0);
  return next;
}

// ─── Resend email payload builder ─────────────────────────────────────────────

export interface ScheduledReportEmailPayload {
  to: string[];
  subject: string;
  html: string;
  pdfAttachmentUrl?: string;
  clientName: string;
  period: string;
}

export function buildReportEmailPayload(
  payload: ReportPayload,
  recipientEmails: string[]
): ScheduledReportEmailPayload {
  const period = `${payload.periodStart} - ${payload.periodEnd}`;
  const subject = `${payload.clientName} Performance Report · ${period}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="border-left:4px solid ${payload.brandColor};padding-left:16px;margin-bottom:32px;">
    <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.1em;">Performance Report</div>
    <h1 style="font-size:22px;font-weight:700;color:#1a1a2e;margin-top:4px;">${payload.clientName}</h1>
    <div style="font-size:13px;color:#666;">${period}</div>
  </div>

  <p style="font-size:14px;color:#333;line-height:1.6;">
    Your monthly performance report is ready. Here's a quick summary:
  </p>

  <div style="background:#f8faff;border-radius:12px;padding:20px;margin:24px 0;">
    <div style="font-weight:600;color:${payload.brandColor};margin-bottom:8px;">${payload.executiveSummary.highlightStat}</div>
    ${payload.executiveSummary.keyWins.slice(0, 2).map((w) => `<div style="font-size:13px;color:#555;margin-top:6px;">• ${w}</div>`).join("")}
  </div>

  <p style="font-size:13px;color:#666;">
    The full PDF report is attached to this email. View it anytime in your GetPostFlow dashboard.
  </p>

  <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center;">
    Sent by GetPostFlow · ${payload.orgName}
  </div>
</body>
</html>`;

  return {
    to: recipientEmails,
    subject,
    html,
    pdfAttachmentUrl: undefined,
    clientName: payload.clientName,
    period,
  };
}
