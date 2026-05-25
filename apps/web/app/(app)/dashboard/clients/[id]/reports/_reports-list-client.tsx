"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { buildReportHtml, buildExecutiveSummary, type ReportPayload, type PlatformReportSection, type CommunityHealthSection } from "@getpostflow/reporting";
import { generateDemoMetrics, aggregatePlatformSummaries } from "@getpostflow/analytics";

interface StubReport {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  status: "ready" | "sent" | "generating" | "pending";
  sentAt?: string;
  createdAt: string;
}

function buildStubReports(clientId: string): StubReport[] {
  const now = new Date();
  return [
    {
      id: "r1",
      type: "monthly",
      periodStart: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]!,
      periodEnd: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0]!,
      status: "sent",
      sentAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: "r2",
      type: "monthly",
      periodStart: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split("T")[0]!,
      periodEnd: new Date(now.getFullYear(), now.getMonth() - 1, 0).toISOString().split("T")[0]!,
      status: "sent",
      sentAt: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
    },
  ];
}

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "muted"> = {
  ready: "success",
  sent: "default",
  generating: "warning",
  pending: "muted",
};

interface Props {
  clientId: string;
  clientName: string;
}

export default function ReportsListClient({ clientId, clientName }: Props) {
  const [reports] = useState<StubReport[]>(() => buildStubReports(clientId));
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  function buildPreview(r: StubReport) {
    const metrics = generateDemoMetrics(clientId, 30, ["instagram", "tiktok", "facebook"]);
    const summaries = aggregatePlatformSummaries(metrics);

    const platformSections: PlatformReportSection[] = summaries.map((s) => ({
      platform: s.platform,
      totalImpressions: s.totalImpressions,
      totalReach: s.totalReach,
      totalEngagements: s.totalEngagements,
      avgEngagementRate: s.avgEngagementRate,
      followerGrowth: s.followerGrowthTotal,
    }));

    const communityHealth: CommunityHealthSection = {
      totalConversations: 148,
      resolvedConversations: 134,
      avgResponseTimeMinutes: 18,
      positiveSentimentPct: 0.68,
      neutralSentimentPct: 0.24,
      negativeSentimentPct: 0.08,
      topIssueCategories: ["Product questions", "Shipping inquiries"],
    };

    const executiveSummary = buildExecutiveSummary(platformSections, communityHealth, [
      "Carousel posts outperformed single images by 40%.",
    ]);

    const payload: ReportPayload = {
      clientId,
      clientName,
      orgName: "GetPostFlow Agency",
      brandColor: "#2F5D62",
      periodStart: r.periodStart,
      periodEnd: r.periodEnd,
      generatedAt: r.createdAt,
      executiveSummary,
      platformSections,
      communityHealth,
      topPosts: summaries.slice(0, 3).map((s) => ({
        title: `Top ${s.platform} post`,
        platform: s.platform,
        engagements: Math.round(s.totalEngagements * 0.12),
        reach: Math.round(s.totalReach * 0.1),
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      })),
      actionItems: executiveSummary.topRecommendations,
      learningInsights: ["Carousel posts outperformed single images by 40% on Instagram."],
    };

    setPreviewHtml(buildReportHtml(payload));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand-primary)" }}>
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Performance Reports
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Branded PDF reports for {clientName}
          </p>
        </div>
        <Link
          href={`/dashboard/clients/${clientId}/reports/new`}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "var(--brand-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Generate Report
        </Link>
      </div>

      {/* Schedule banner */}
      <div
        className="flex items-start gap-4 rounded-2xl border p-4"
        style={{ borderColor: "rgba(47,93,98,0.2)", background: "rgba(47,93,98,0.04)" }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--brand-primary)", flexShrink: 0, marginTop: 1 }}>
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3zM7.5 5v3.5l2.5 1.5-.5.87L6.5 9V5h1z" />
        </svg>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--brand-primary)" }}>
            Monthly auto-reports enabled
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Reports are automatically generated on the last day of each month and emailed to the client's primary contact.
            <Link href={`/dashboard/clients/${clientId}/reports/schedule`} className="ml-1 underline underline-offset-2" style={{ color: "var(--brand-primary)" }}>
              Configure schedule
            </Link>
          </p>
        </div>
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--text-muted)" }}>
              <path d="M4 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9.5 1H4zm5 1.5L12.5 6H9V2.5z" />
            </svg>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No reports yet</p>
            <Link
              href={`/dashboard/clients/${clientId}/reports/new`}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Generate first report
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: "rgba(47,93,98,0.08)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--brand-primary)" }}>
                      <path d="M4 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9.5 1H4zm5 1.5L12.5 6H9V2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {r.type === "monthly" ? "Monthly Report" : "On-Demand Report"} · {r.periodStart} - {r.periodEnd}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {r.sentAt
                        ? `Sent ${new Date(r.sentAt).toLocaleDateString()}`
                        : `Created ${new Date(r.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[r.status] ?? "muted"}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                  <button
                    onClick={() => buildPreview(r)}
                    className="text-xs transition hover:opacity-70"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    Preview
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewHtml && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewHtml(null); }}
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
                Report Preview
              </span>
              <button
                onClick={() => setPreviewHtml(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-[var(--subtle)]"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="flex-1"
              title="Report Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
