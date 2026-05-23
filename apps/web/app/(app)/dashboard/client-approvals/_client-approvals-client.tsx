"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", facebook: "#1877F2", linkedin: "#0A66C2",
  tiktok: "#000000", twitter: "#1DA1F2", youtube: "#FF0000",
  pinterest: "#E60023", discord: "#5865F2", reddit: "#FF4500",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn",
  tiktok: "TikTok", twitter: "X", youtube: "YouTube",
  pinterest: "Pinterest", discord: "Discord", reddit: "Reddit",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  client_published: "Client Published",
  revisions_requested: "Revisions Requested",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  pending_review: "warning",
  approved: "default",
  scheduled: "default",
  published: "success",
  client_published: "success",
  revisions_requested: "danger",
};

interface ContentItem {
  id: string;
  clientId: string;
  clientName: string;
  platform: string | null;
  status: string;
  title: string;
  scheduledFor: string | null;
  createdAt: string;
  body?: string;
}

interface Props {
  items: ContentItem[];
  clients: { id: string; name: string }[];
}

type Segment = "pending" | "approved" | "revisions" | "all";

export default function ClientApprovalsClient({ items, clients }: Props) {
  const [segment, setSegment] = useState<Segment>("pending");
  const [clientFilter, setClientFilter] = useState<string | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = {
    pending: items.filter((i) => i.status === "pending_review").length,
    approved: items.filter((i) => i.status === "approved" || i.status === "scheduled" || i.status === "published" || i.status === "client_published").length,
    revisions: items.filter((i) => i.status === "revisions_requested").length,
    all: items.length,
  };

  let filtered = items;
  if (segment === "pending") filtered = items.filter((i) => i.status === "pending_review");
  if (segment === "approved") filtered = items.filter((i) => ["approved", "scheduled", "published", "client_published"].includes(i.status));
  if (segment === "revisions") filtered = items.filter((i) => i.status === "revisions_requested");
  if (clientFilter) filtered = filtered.filter((i) => i.clientId === clientFilter);

  const segments: { id: Segment; label: string; count: number }[] = [
    { id: "pending", label: "Pending Review", count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
    { id: "revisions", label: "Revisions Requested", count: counts.revisions },
    { id: "all", label: "All", count: counts.all },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Client Approvals
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Track content that has been sent to clients for approval.
        </p>
      </div>

      {/* Segmented control */}
      <div className="flex flex-wrap gap-2">
        {segments.map((s) => (
          <button
            key={s.id}
            onClick={() => setSegment(s.id)}
            className="rounded-xl px-4 py-2 text-xs font-medium transition"
            style={{
              background: segment === s.id ? "var(--brand-primary)" : "var(--subtle)",
              color: segment === s.id ? "white" : "var(--text-secondary)",
            }}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Client filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Client:</span>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-xs outline-none"
          style={{ border: "1px solid var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            No content in this segment.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: PLATFORM_COLORS[item.platform ?? ""] ?? "var(--brand-primary)" }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>
                            {STATUS_LABELS[item.status] ?? item.status}
                          </Badge>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "var(--subtle)", color: "var(--text-secondary)" }}
                          >
                            {item.clientName}
                          </span>
                          <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                            {PLATFORM_LABELS[item.platform ?? ""] ?? item.platform ?? "post"}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate mt-1" style={{ color: "var(--text-primary)" }}>
                          {item.title ?? "Untitled"}
                        </p>
                        {item.scheduledFor && (
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                            Scheduled {new Date(item.scheduledFor).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
                        style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
                      >
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-soft)" }}>
                      {item.body && (
                        <div
                          className="rounded-xl p-3 text-xs leading-relaxed mb-4"
                          style={{ background: "var(--subtle)", color: "var(--text-secondary)" }}
                        >
                          {item.body}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/clients/${item.clientId}/content/${item.id}`}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                          style={{ background: "var(--brand-primary)" }}
                        >
                          Open
                        </Link>
                        {item.status === "pending_review" && (
                          <>
                            <button
                              className="rounded-xl px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                              style={{ background: "var(--brand-success)" }}
                              onClick={() => alert("Approve action coming soon")}
                            >
                              Approve
                            </button>
                            <button
                              className="rounded-xl px-4 py-2 text-xs font-medium transition hover:opacity-90"
                              style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
                              onClick={() => alert("Request revisions action coming soon")}
                            >
                              Request Revisions
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
