"use client";

import { useState, useMemo } from "react";
import {
  generateDemoMetrics,
  buildHeatmap,
  aggregatePlatformSummaries,
  buildContentTypeBreakdown,
  computeOverallSummary,
  type DailyMetrics,
  type PlatformSummary,
  type ContentTypeSummary,
  type PostingHeatmapCell,
} from "@getpostflow/analytics";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { StatTile } from "@getpostflow/ui/stat-tile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@getpostflow/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@getpostflow/ui/select";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  tiktok: "#010101",
  facebook: "#1877f2",
  linkedin: "#0077b5",
  youtube: "#ff0000",
  pinterest: "#e60023",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Mini SVG Line Chart ──────────────────────────────────────────────────────

function LineChart({
  series,
  height = 160,
  width = 560,
}: {
  series: { label: string; color: string; values: number[] }[];
  height?: number;
  width?: number;
}) {
  if (series.length === 0 || series[0]!.values.length === 0) return null;
  const n = series[0]!.values.length;
  const allValues = series.flatMap((s) => s.values);
  const min = Math.min(...allValues) * 0.9;
  const max = Math.max(...allValues) * 1.1;
  const range = max - min || 1;

  const pad = { top: 10, right: 16, bottom: 24, left: 40 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const x = (i: number) => pad.left + (i / (n - 1)) * w;
  const y = (v: number) => pad.top + h - ((v - min) / range) * h;

  const path = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const area = (values: number[]) => {
    const line = values.map((v, i) => `${i === 0 ? "L" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    return `M${x(0).toFixed(1)},${(pad.top + h).toFixed(1)} ${line} L${x(n - 1).toFixed(1)},${(pad.top + h).toFixed(1)} Z`;
  };

  // Y axis ticks
  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => min + (range / ticks) * i);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {tickValues.map((v, i) => (
        <g key={i}>
          <line
            x1={pad.left} y1={y(v).toFixed(1)}
            x2={pad.left + w} y2={y(v).toFixed(1)}
            stroke="var(--border-soft)" strokeWidth="1" strokeDasharray="4,4"
          />
          <text
            x={pad.left - 6} y={y(v)}
            textAnchor="end" dominantBaseline="middle"
            fontSize="9" fill="var(--text-muted)"
          >
            {fmt(v)}
          </text>
        </g>
      ))}

      {/* Areas */}
      {series.map((s) => (
        <path
          key={`area-${s.label}`}
          d={area(s.values)}
          fill={s.color}
          opacity="0.08"
        />
      ))}

      {/* Lines */}
      {series.map((s) => (
        <path
          key={`line-${s.label}`}
          d={path(s.values)}
          fill="none"
          stroke={s.color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* X axis labels — show first, mid, last */}
      {[0, Math.floor(n / 2), n - 1].map((i) => (
        <text key={i} x={x(i)} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          {`D-${n - 1 - i}`}
        </text>
      ))}
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({
  data,
  height = 160,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const pad = { top: 10, right: 8, bottom: 32, left: 44 };

  return (
    <svg viewBox={`0 0 ${data.length * 56 + pad.left + pad.right} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barW = 32;
        const barH = ((d.value / max) * (height - pad.top - pad.bottom));
        const bx = pad.left + i * 56;
        const by = pad.top + (height - pad.top - pad.bottom) - barH;

        return (
          <g key={d.label}>
            <rect
              x={bx} y={by.toFixed(1)}
              width={barW} height={barH.toFixed(1)}
              rx="4"
              fill={d.color ?? "var(--brand-primary)"}
              opacity="0.85"
            />
            <text
              x={bx + barW / 2} y={by - 4}
              textAnchor="middle" fontSize="9" fill="var(--text-muted)"
            >
              {fmt(d.value)}
            </text>
            <text
              x={bx + barW / 2} y={height - 6}
              textAnchor="middle" fontSize="9" fill="var(--text-muted)"
            >
              {d.label.slice(0, 5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Pie / Donut Chart ────────────────────────────────────────────────────────

function DonutChart({
  data,
  size = 140,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r * 0.58;

  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const start = angle;
    angle += sweep;
    return { ...d, start, sweep, pct: d.value / total };
  });

  function slice(s: { start: number; sweep: number; color: string }) {
    const x1 = cx + r * Math.cos(s.start);
    const y1 = cy + r * Math.sin(s.start);
    const x2 = cx + r * Math.cos(s.start + s.sweep);
    const y2 = cy + r * Math.sin(s.start + s.sweep);
    const xi1 = cx + inner * Math.cos(s.start);
    const yi1 = cy + inner * Math.sin(s.start);
    const xi2 = cx + inner * Math.cos(s.start + s.sweep);
    const yi2 = cy + inner * Math.sin(s.start + s.sweep);
    const large = s.sweep > Math.PI ? 1 : 0;

    return `M${xi1.toFixed(2)},${yi1.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${inner},${inner} 0 ${large} 0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`;
  }

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        {slices.map((s) => (
          <path key={s.label} d={slice(s)} fill={s.color} opacity="0.9" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          posts
        </text>
      </svg>
      <div className="flex flex-col gap-2 flex-1">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            </div>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {pct(s.pct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function PostingHeatmap({ cells }: { cells: PostingHeatmapCell[] }) {
  const maxER = Math.max(...cells.map((c) => c.avgEngagementRate), 0.001);

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `40px repeat(24, 20px)` }}>
        {/* Hour headers */}
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="text-center"
            style={{ fontSize: "9px", color: "var(--text-muted)", width: 20 }}
          >
            {h % 6 === 0 ? `${h}h` : ""}
          </div>
        ))}

        {/* Rows */}
        {DAY_LABELS.map((day, d) => (
          <>
            <div
              key={`label-${d}`}
              className="flex items-center"
              style={{ fontSize: "10px", color: "var(--text-muted)", height: 20 }}
            >
              {day}
            </div>
            {Array.from({ length: 24 }, (_, h) => {
              const cell = cells.find((c) => c.dayOfWeek === d && c.hourOfDay === h);
              const intensity = cell ? cell.avgEngagementRate / maxER : 0;
              return (
                <div
                  key={`cell-${d}-${h}`}
                  title={cell ? `${day} ${h}:00 — ER: ${pct(cell.avgEngagementRate)}` : ""}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 3,
                    background: `rgba(47, 93, 98, ${(intensity * 0.85 + 0.05).toFixed(2)})`,
                    cursor: "default",
                  }}
                />
              );
            })}
          </>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Low</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: "linear-gradient(to right, rgba(47,93,98,0.1), rgba(47,93,98,0.9))",
            maxWidth: 80,
          }}
        />
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>High engagement</span>
      </div>
    </div>
  );
}

// ─── Platform legend ───────────────────────────────────────────────────────────

function PlatformLegend({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {platforms.map((p) => (
        <div key={p} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: PLATFORM_COLORS[p] ?? "var(--brand-primary)" }} />
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </div>
      ))}
    </div>
  );
}

// ─── CSV download helper ──────────────────────────────────────────────────────

function downloadCSV(data: Record<string, string | number>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]!);
  const rows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const v = String(row[h] ?? "");
          return v.includes(",") ? `"${v}"` : v;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DONUT_COLORS = ["#6366f1", "#2F5D62", "#f59e0b", "#ec4899"];

export default function AnalyticsDashboardClient() {
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30" | "90">("30");
  const days = Number(timeRange);

  const allMetrics = useMemo(
    () => generateDemoMetrics("demo-client", days, ["instagram", "tiktok", "facebook"]),
    [days]
  );

  const totals = useMemo(() => computeOverallSummary(allMetrics), [allMetrics]);
  const platformSummaries = useMemo(() => aggregatePlatformSummaries(allMetrics), [allMetrics]);
  const contentTypes = useMemo(() => buildContentTypeBreakdown(days * 0.8), [days]);
  const heatmap = useMemo(() => buildHeatmap(), []);

  // Build time series per platform for line chart
  const uniqueDates = useMemo(
    () => [...new Set(allMetrics.map((m) => m.date))].sort(),
    [allMetrics]
  );

  const platformTimeSeries = useMemo(() => {
    const platforms = ["instagram", "tiktok", "facebook"] as const;
    return platforms.map((platform) => ({
      label: platform,
      color: PLATFORM_COLORS[platform]!,
      values: uniqueDates.map((date) => {
        const m = allMetrics.find((x) => x.date === date && x.platform === platform);
        return m?.engagements ?? 0;
      }),
    }));
  }, [allMetrics, uniqueDates]);

  const reachSeries = useMemo(() => {
    return [
      {
        label: "reach",
        color: "var(--brand-primary)",
        values: uniqueDates.map((date) =>
          allMetrics.filter((m) => m.date === date).reduce((s, m) => s + m.reach, 0)
        ),
      },
    ];
  }, [allMetrics, uniqueDates]);

  // Bar chart data
  const platformBarData = platformSummaries.map((p) => ({
    label: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    value: p.totalEngagements,
    color: PLATFORM_COLORS[p.platform] ?? "var(--brand-primary)",
  }));

  // Donut data
  const donutData = contentTypes.map((ct, i) => ({
    label: ct.contentType.charAt(0).toUpperCase() + ct.contentType.slice(1),
    value: ct.count,
    color: DONUT_COLORS[i % DONUT_COLORS.length]!,
  }));

  // CSV exports
  function exportEngagement() {
    const rows = allMetrics.map((m) => ({
      date: m.date,
      platform: m.platform,
      impressions: m.impressions,
      reach: m.reach,
      engagements: m.engagements,
      engagement_rate: (m.engagementRate * 100).toFixed(2),
      follower_growth: m.followerGrowth,
      video_views: m.videoViews,
      video_completion_rate: (m.videoCompletionRate * 100).toFixed(2),
    }));
    downloadCSV(rows, `analytics-${timeRange}d.csv`);
  }

  function exportPlatform() {
    const rows = platformSummaries.map((p) => ({
      platform: p.platform,
      total_impressions: p.totalImpressions,
      total_reach: p.totalReach,
      total_engagements: p.totalEngagements,
      avg_engagement_rate: (p.avgEngagementRate * 100).toFixed(2),
      follower_growth: p.followerGrowthTotal,
    }));
    downloadCSV(rows, `platforms-${timeRange}d.csv`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p
            className="text-sm font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--brand-primary)" }}
          >
            Analytics
          </p>
          <h1 className="mt-1 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Performance Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[120px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={exportEngagement}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition hover:bg-[var(--subtle)]"
            style={{ borderColor: "var(--border-soft)", color: "var(--text-secondary)" }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1v9M4 6l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Reach", value: fmt(totals.reach), change: "+18%" },
          { label: "Impressions", value: fmt(totals.impressions), change: "+12%" },
          { label: "Engagements", value: fmt(totals.engagements), change: "+22%" },
          { label: "Avg Eng. Rate", value: pct(totals.engagementRate), change: "+0.8pp" },
          { label: "Follower Growth", value: fmt(totals.followerGrowth), change: "+340" },
          { label: "Video Views", value: fmt(totals.videoViews), change: "+31%" },
        ].map((t) => (
          <StatTile
            key={t.label}
            label={t.label}
            value={t.value}
            change={t.change}
            changePositive
          />
        ))}
      </div>

      {/* Charts tabs */}
      <Tabs defaultValue="engagement">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="reach">Reach</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content Mix</TabsTrigger>
          <TabsTrigger value="heatmap">Best Times</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Engagements Over Time
                </h2>
                <PlatformLegend platforms={["instagram", "tiktok", "facebook"]} />
              </div>
            </CardHeader>
            <CardContent>
              <LineChart series={platformTimeSeries} height={200} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reach">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Total Daily Reach
                </h2>
                <button
                  onClick={exportEngagement}
                  className="text-xs transition hover:opacity-70"
                  style={{ color: "var(--brand-primary)" }}
                >
                  Export CSV
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <LineChart series={reachSeries} height={200} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Platform Comparison — Engagements
                </h2>
                <button
                  onClick={exportPlatform}
                  className="text-xs transition hover:opacity-70"
                  style={{ color: "var(--brand-primary)" }}
                >
                  Export CSV
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <BarChart data={platformBarData} height={180} />
              {/* Platform summary table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      {["Platform", "Impressions", "Reach", "Engagements", "Eng. Rate", "Followers+"].map(
                        (h) => (
                          <th
                            key={h}
                            className="pb-2 text-left font-semibold"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {platformSummaries.map((p) => (
                      <tr key={p.platform} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                        <td className="py-2 font-medium" style={{ color: "var(--text-primary)" }}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ background: PLATFORM_COLORS[p.platform] }}
                            />
                            {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                          </div>
                        </td>
                        <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                          {fmt(p.totalImpressions)}
                        </td>
                        <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                          {fmt(p.totalReach)}
                        </td>
                        <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                          {fmt(p.totalEngagements)}
                        </td>
                        <td className="py-2">
                          <Badge
                            variant={p.avgEngagementRate > 0.04 ? "success" : p.avgEngagementRate > 0.02 ? "default" : "warning"}
                          >
                            {pct(p.avgEngagementRate)}
                          </Badge>
                        </td>
                        <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                          +{fmt(p.followerGrowthTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Content Type Breakdown
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <DonutChart data={donutData} size={160} />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                        {["Type", "Posts", "Avg ER", "Total Reach"].map((h) => (
                          <th
                            key={h}
                            className="pb-2 text-left font-semibold"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contentTypes.map((ct, i) => (
                        <tr key={ct.contentType} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                          <td className="py-2 font-medium" style={{ color: "var(--text-primary)" }}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                              />
                              {ct.contentType.charAt(0).toUpperCase() + ct.contentType.slice(1)}
                            </div>
                          </td>
                          <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                            {ct.count}
                          </td>
                          <td className="py-2">
                            <Badge
                              variant={ct.avgEngagementRate > 0.05 ? "success" : "default"}
                            >
                              {pct(ct.avgEngagementRate)}
                            </Badge>
                          </td>
                          <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                            {fmt(ct.totalReach)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Best Posting Times Heatmap
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Darker = higher average engagement rate at that time slot
              </p>
            </CardHeader>
            <CardContent>
              <PostingHeatmap cells={heatmap} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Learning insights strip */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--brand-primary)" }}>
              <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5L8 1z" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              AI Learning Insights
            </h2>
            <Badge variant="default">Beta</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "📈",
                text: `Posts with hooks in first 3s got ${(1.8 + Math.random() * 1.0).toFixed(1)}x more TikTok views this month.`,
              },
              {
                icon: "🎠",
                text: `Carousel posts outperform single images by ${Math.round(30 + Math.random() * 20)}% on Instagram reach.`,
              },
              {
                icon: "⏰",
                text: `Tuesday 9–11am posts average ${(3.5 + Math.random() * 2).toFixed(1)}% higher ER vs other slots.`,
              },
            ].map((insight, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-2xl p-4"
                style={{ background: "var(--subtle)" }}
              >
                <span className="text-lg flex-shrink-0">{insight.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
