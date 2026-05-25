"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";

export default function AnalyticsDashboardClient() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<{
    totalClients: number;
    totalPosts: number;
    engagementRate: number;
    totalConversations: number;
    totalsByPlatform: Record<string, { impressions: number; reach: number; engagements: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/analytics/dashboard?range=${range}`);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Analytics</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Agency-wide performance overview.</p>
        </div>
        <div className="flex gap-1 rounded-xl border p-0.5" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
          {["7d", "30d", "90d"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="rounded-lg px-3 py-1 text-xs font-medium transition" style={{ background: range === r ? "var(--brand-primary)" : "transparent", color: range === r ? "white" : "var(--text-muted)" }}>
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardContent className="py-4">
                <div className="h-3 w-16 rounded animate-pulse mb-3" style={{ background: "var(--subtle)" }} />
                <div className="h-7 w-12 rounded animate-pulse" style={{ background: "var(--subtle)" }} />
              </CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="py-4 flex flex-col gap-3">
            <div className="h-4 w-32 rounded animate-pulse" style={{ background: "var(--subtle)" }} />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-20 rounded animate-pulse" style={{ background: "var(--subtle)" }} />
                <div className="h-3 w-40 rounded animate-pulse" style={{ background: "var(--subtle)" }} />
              </div>
            ))}
          </CardContent></Card>
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="py-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Clients</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data.totalClients}</p>
            </CardContent></Card>
            <Card><CardContent className="py-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Posts</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data.totalPosts}</p>
            </CardContent></Card>
            <Card><CardContent className="py-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Engagement Rate</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{(data.engagementRate * 100).toFixed(2)}%</p>
            </CardContent></Card>
            <Card><CardContent className="py-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Conversations</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data.totalConversations}</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardContent className="py-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Platform Breakdown</h3>
              {Object.entries(data.totalsByPlatform).length === 0 && (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No platform data yet</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Analytics will populate once you have connected accounts and published content.
                  </p>
                </div>
              )}
              {Object.entries(data.totalsByPlatform).map(([platform, m]) => (
                <div key={platform} className="flex items-center justify-between">
                  <span className="text-xs capitalize" style={{ color: "var(--text-primary)" }}>{platform}</span>
                  <div className="flex gap-3">
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Imp: {m.impressions.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Reach: {m.reach.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Eng: {m.engagements.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
