"use client";

import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";
import { EmptyState } from "@getpostflow/ui/empty-state";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C" },
  { id: "facebook", name: "Facebook", icon: "📘", color: "#1877F2" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000" },
  { id: "youtube-shorts", name: "YouTube Shorts", icon: "📱", color: "#FF0000" },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "#E60023" },
  { id: "discord", name: "Discord", icon: "💬", color: "#5865F2" },
  { id: "reddit", name: "Reddit", icon: "🤝", color: "#FF4500" },
] as const;

type Platform = (typeof PLATFORMS)[number];

// Stub: in production this would come from server data / useQuery
const CONNECTED_ACCOUNTS: { platform: string; accountName: string; isActive: boolean }[] = [];

export default function AccountsPage() {
  const connectedCount = CONNECTED_ACCOUNTS.length;
  const planLimit = 4; // Starter plan default — pulled from entitlements in production

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Client Social Accounts
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Connect and manage your clients&apos; social media accounts. These accounts belong to the clients your agency manages — select a client above to scope the view.
          </p>
        </div>
        <Badge variant="default">
          {connectedCount} / {planLimit} used
        </Badge>
      </div>

      {/* Definition callout */}
      <div
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: "rgba(47, 93, 98, 0.3)", background: "rgba(47, 93, 98, 0.05)" }}
      >
        <div className="flex items-start gap-3">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 flex-shrink-0" style={{ color: "var(--brand-primary)" }}>
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.5h1.5V9h-1.5V4.5zm0 5.5h1.5v1.5h-1.5V10z" />
          </svg>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>What are Connected Accounts?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              These are the <strong>social media accounts belonging to your clients</strong> — not your team&apos;s accounts.
              You connect them so you can schedule posts, reply to messages, and publish content <em>on behalf of your clients</em>.
              Each client has their own set of connected accounts. Go to a Client Workspace → Accounts tab to manage per-client connections.
            </p>
          </div>
        </div>
      </div>

      {/* Reddit policy callout */}
      <div
        className="rounded-2xl border px-4 py-3 text-sm"
        style={{ borderColor: "var(--border-soft)", background: "var(--bg-subtle)" }}
      >
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          Reddit — Community management only.
        </span>{" "}
        <span style={{ color: "var(--text-secondary)" }}>
          All Reddit interactions require human approval. We never auto-respond on Reddit to protect
          your brand from community backlash.
        </span>
      </div>

      {/* Connected accounts list */}
      {CONNECTED_ACCOUNTS.length === 0 ? (
        <EmptyState
          title="No accounts connected yet"
          description="Connect your first social media account to start scheduling posts, managing your inbox, and tracking analytics."
          icon={<span>🔗</span>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONNECTED_ACCOUNTS.map((acc) => (
            <Card key={`${acc.platform}-${acc.accountName}`}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {PLATFORMS.find((p) => p.id === acc.platform)?.icon ?? "🔗"}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {acc.accountName}
                    </p>
                    <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                      {acc.platform}
                    </p>
                  </div>
                </div>
                <Badge variant={acc.isActive ? "default" : "outline"}>
                  {acc.isActive ? "Active" : "Expired"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Platform grid — connect buttons */}
      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Available platforms
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PLATFORMS.map((p) => (
            <PlatformCard key={p.id} platform={p} isConnected={false} atLimit={connectedCount >= planLimit} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  isConnected,
  atLimit,
}: {
  platform: Platform;
  isConnected: boolean;
  atLimit: boolean;
}) {
  const isReddit = platform.id === "reddit";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{platform.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {platform.name}
            </p>
            {isReddit && (
              <p className="text-xs" style={{ color: "var(--brand-warning)" }}>
                Monitor only
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <Badge variant="default">Connected</Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={atLimit || isReddit}
            title={
              isReddit
                ? "Reddit connection not available — monitoring requires manual setup"
                : atLimit
                ? "Upgrade plan to connect more accounts"
                : `Connect ${platform.name}`
            }
          >
            {isReddit ? "Manual only" : atLimit ? "Upgrade" : "Connect"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
