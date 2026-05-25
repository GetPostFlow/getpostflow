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

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>}

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
              {Object.entries(data.totalsByPlatform).length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No platform data yet.</p>}
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
