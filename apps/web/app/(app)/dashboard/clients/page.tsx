"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@getpostflow/ui";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  intake_pending: "Intake Pending",
  ai_drafting: "AI Drafting",
  ai_drafted: "AI Drafted",
  strategist_review: "Strategist Review",
  client_review: "Client Review",
  active: "Active",
  archived: "Archived",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "var(--subtle)", color: "var(--text-muted)" },
  intake_pending: { bg: "#fef3c7", color: "#92400e" },
  ai_drafting: { bg: "#dbeafe", color: "#1e40af" },
  ai_drafted: { bg: "#dbeafe", color: "#1e40af" },
  strategist_review: { bg: "#fef3c7", color: "#92400e" },
  client_review: { bg: "#fef3c7", color: "#92400e" },
  active: { bg: "#d1fae5", color: "#065f46" },
  archived: { bg: "var(--subtle)", color: "var(--text-muted)" },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<
    { id: string; slug: string; name: string; status: string; industry?: string | null; primaryContactEmail?: string | null; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const isNew = (createdAt: string) => {
    const d = new Date(createdAt);
    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 rounded-lg animate-pulse" style={{ background: "var(--subtle)" }} />
          <div className="h-9 w-32 rounded-xl animate-pulse" style={{ background: "var(--subtle)" }} />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl animate-pulse flex-shrink-0" style={{ background: "var(--subtle)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded animate-pulse" style={{ background: "var(--subtle)" }} />
                    <div className="h-3 w-1/4 rounded animate-pulse" style={{ background: "var(--subtle)" }} />
                  </div>
                  <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: "var(--subtle)" }} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Clients</h1>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#2F5D62" }}
          >
            + New Client
          </Link>
        </div>
        <Card>
          <CardContent className="p-12 flex flex-col items-center text-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(47,93,98,0.08)" }}
            >
              <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" style={{ color: "#2F5D62" }}>
                <path d="M5.5 4a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm-3.5 9c0-3.31 2.69-6 6-6s6 2.69 6 6H2z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>No clients yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Create your first client to start building their brand strategy and content calendar.
              </p>
            </div>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#2F5D62" }}
            >
              Create First Client
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#2F5D62" }}
        >
          + New Client
        </Link>
      </div>

      <div className="grid gap-3">
        {clients.map((client) => {
          const statusColor = STATUS_COLORS[client.status] ?? STATUS_COLORS.draft!;
          return (
            <Link key={client.id} href={`/dashboard/clients/${client.slug}`}>
              <Card className="hover:shadow-md transition relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white flex-shrink-0"
                        style={{ background: "#2F5D62" }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{client.name}</h3>
                          {isNew(client.createdAt) && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "#dbeafe", color: "#1e40af" }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {client.industry ?? "No industry"}{client.primaryContactEmail ? ` · ${client.primaryContactEmail}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: statusColor.bg, color: statusColor.color }}
                    >
                      {STATUS_LABELS[client.status] ?? client.status}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
