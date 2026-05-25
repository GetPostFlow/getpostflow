"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C" },
  { id: "facebook", name: "Facebook", icon: "📘", color: "#1877F2" },
  { id: "x", name: "X / Twitter", icon: "🐦", color: "#000000" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000" },
  { id: "reddit", name: "Reddit", icon: "🤝", color: "#FF4500" },
] as const;

interface Account {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  tokenExpiresAt: string | null;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [health, setHealth] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  async function fetchAccounts() {
    setLoading(true);
    const [accRes, healthRes] = await Promise.all([
      fetch("/api/accounts"),
      fetch("/api/accounts/health"),
    ]);
    if (accRes.ok) {
      const data = await accRes.json();
      setAccounts(data.accounts ?? []);
    }
    if (healthRes.ok) {
      const data = await healthRes.json();
      const map: Record<string, string> = {};
      for (const h of data.health ?? []) map[h.id] = h.status;
      setHealth(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function handleConnect(platform: string) {
    setConnecting(platform);
    const res = await fetch("/api/accounts/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, clientId: "stub-client-id" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.oauthUrl) window.location.href = data.oauthUrl;
    }
    setConnecting(null);
  }

  async function handleDisconnect(id: string) {
    const res = await fetch(`/api/accounts/${id}/disconnect`, { method: "POST" });
    if (res.ok) fetchAccounts();
  }

  const connectedMap = new Map(accounts.map((a) => [a.platform, a]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Connected Accounts</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Manage OAuth connections for all 7 platforms.</p>
        </div>
        <Badge variant="default">{accounts.length} / {PLATFORMS.length} connected</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((p) => {
          const acc = connectedMap.get(p.id);
          const status = acc ? (health[acc.id] ?? "healthy") : "disconnected";
          return (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    {acc && <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{acc.accountName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={status === "healthy" ? "success" : status === "disconnected" ? "muted" : "warning"}>
                    {status}
                  </Badge>
                  {acc?.lastSyncedAt && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Synced {new Date(acc.lastSyncedAt).toLocaleDateString()}</span>}
                </div>
                {acc ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleConnect(p.id)}>Reconnect</Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleDisconnect(acc.id)}>Disconnect</Button>
                  </div>
                ) : (
                  <Button variant="primary" size="sm" className="text-xs" disabled={connecting === p.id} onClick={() => handleConnect(p.id)}>
                    {connecting === p.id ? "Connecting…" : "Connect"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
