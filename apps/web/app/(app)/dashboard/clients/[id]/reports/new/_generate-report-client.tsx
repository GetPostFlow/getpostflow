"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";
import {
  buildReportHtml,
  buildExecutiveSummary,
  type ReportPayload,
  type PlatformReportSection,
  type CommunityHealthSection,
} from "@getpostflow/reporting";
import { generateDemoMetrics, aggregatePlatformSummaries } from "@getpostflow/analytics";

interface Props {
  clientId: string;
  clientName: string;
  orgName: string;
  brandColor?: string;
}

type ReportStatus = "idle" | "generating" | "preview" | "sent";

function buildDemoReportPayload(clientId: string, clientName: string, orgName: string, brandColor: string): ReportPayload {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const periodStart = start.toISOString().split("T")[0]!;
  const periodEnd = end.toISOString().split("T")[0]!;

  const metrics = generateDemoMetrics(clientId, 30, ["instagram", "tiktok", "facebook"]);
  const summaries = aggregatePlatformSummaries(metrics);

  const platformSections: PlatformReportSection[] = summaries.map((s) => ({
    platform: s.platform,
    totalImpressions: s.totalImpressions,
    totalReach: s.totalReach,
    totalEngagements: s.totalEngagements,
    avgEngagementRate: s.avgEngagementRate,
    followerGrowth: s.followerGrowthTotal,
    topPostTitle: `Top ${s.platform} post this month`,
    topPostEngagements: Math.round(s.totalEngagements * 0.12),
  }));

  const communityHealth: CommunityHealthSection = {
    totalConversations: 148,
    resolvedConversations: 134,
    avgResponseTimeMinutes: 18,
    positiveSentimentPct: 0.68,
    neutralSentimentPct: 0.24,
    negativeSentimentPct: 0.08,
    topIssueCategories: ["Product questions", "Shipping inquiries", "Brand feedback"],
  };

  const executiveSummary = buildExecutiveSummary(platformSections, communityHealth, [
    "Carousel posts outperformed single images by 40% on Instagram.",
    "TikTok hooks under 3s drove 2.3x more video completions.",
  ]);

  const topPosts = summaries.flatMap((s) => [
    {
      title: `Best ${s.platform.charAt(0).toUpperCase() + s.platform.slice(1)} post — Week 3`,
      platform: s.platform,
      engagements: Math.round(s.totalEngagements * 0.15),
      reach: Math.round(s.totalReach * 0.12),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  ]);

  return {
    clientId,
    clientName,
    orgName,
    brandColor,
    periodStart,
    periodEnd,
    generatedAt: new Date().toISOString(),
    executiveSummary,
    platformSections,
    communityHealth,
    topPosts,
    actionItems: executiveSummary.topRecommendations,
    learningInsights: [
      "Carousel posts outperformed single images by 40% on Instagram.",
      "TikTok hooks under 3s drove 2.3x more video completions.",
      "Tuesday 9-11am posts average 3.8% higher engagement than other slots.",
    ],
  };
}

export default function GenerateReportClient({ clientId, clientName, orgName, brandColor = "#2F5D62" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [reportHtml, setReportHtml] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [period, setPeriod] = useState<"monthly" | "custom">("monthly");
  const [sendEmail, setSendEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  async function handleGenerate() {
    setStatus("generating");
    // Simulate generation delay
    await new Promise((r) => setTimeout(r, 1500));
    const payload = buildDemoReportPayload(clientId, clientName, orgName, brandColor);
    const html = buildReportHtml(payload);
    setReportHtml(html);
    setStatus("preview");
  }

  function handlePreview() {
    setShowPreview(true);
  }

  function handleDownload() {
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clientName.replace(/\s+/g, "-").toLowerCase()}-report.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSend() {
    setStatus("generating");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand-primary)" }}>
          Reports
        </p>
        <h1 className="mt-1 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Generate Report
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Create a branded PDF performance report for {clientName}
        </p>
      </div>

      {/* Config */}
      {status === "idle" && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Report Configuration
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* Period */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Report Period
              </label>
              <div className="flex gap-3">
                {(["monthly", "custom"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition"
                    style={{
                      borderColor: period === p ? "var(--brand-primary)" : "var(--border-soft)",
                      background: period === p ? "rgba(47,93,98,0.06)" : "transparent",
                      color: period === p ? "var(--brand-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {p === "monthly" ? "Last 30 days" : "Custom range"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections included */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Included Sections
              </label>
              <div className="flex flex-wrap gap-2">
                {["Executive Summary", "Platform Breakdown", "Top Posts", "Community Health", "AI Insights", "Action Items"].map((s) => (
                  <Badge key={s} variant="default">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Send email */}
            <div className="flex items-center gap-3">
              <input
                id="sendEmail"
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="sendEmail" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Email report to client after generation
              </label>
            </div>

            {sendEmail && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border-soft)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            )}

            <Button onClick={handleGenerate} className="w-full sm:w-auto">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generating */}
      {status === "generating" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div
              className="h-12 w-12 animate-spin rounded-full border-4"
              style={{
                borderColor: "var(--brand-primary)",
                borderTopColor: "transparent",
              }}
            />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Generating your branded report...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {status === "preview" && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: "rgba(34,197,94,0.1)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Report Generated
                    </h2>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {clientName} · {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Ready</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Your branded report includes executive summary, platform breakdown, top performing content, community health metrics, and AI learning insights.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-[var(--subtle)]"
                  style={{ borderColor: "var(--border-soft)", color: "var(--text-secondary)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3C4.5 3 1.5 8 1.5 8s3 5 6.5 5 6.5-5 6.5-5S11.5 3 8 3zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                  </svg>
                  Preview
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-[var(--subtle)]"
                  style={{ borderColor: "var(--border-soft)", color: "var(--text-secondary)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download HTML
                </button>
                {sendEmail && (
                  <button
                    onClick={handleSend}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    style={{ background: "var(--brand-primary)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm1 0v1.5l5 3 5-3V3H3zm0 3.5V13h10V6.5l-5 3-5-3z" />
                    </svg>
                    Send to {recipientEmail || "client"}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview modal */}
          {showPreview && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
            >
              <div
                className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                style={{ width: "min(900px, 95vw)", height: "90vh", background: "#fff" }}
              >
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Report Preview — {clientName}
                  </span>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-[var(--subtle)]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ✕
                  </button>
                </div>
                <iframe
                  srcDoc={reportHtml}
                  className="flex-1"
                  title="Report Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Sent */}
      {status === "sent" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l4 4 6-6" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Report Sent!</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                The report has been emailed to {recipientEmail || "the client"}.
              </p>
            </div>
            <button
              onClick={() => router.push(`/dashboard/clients/${clientId}/reports`)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              View All Reports
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
