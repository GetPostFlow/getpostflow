import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { EmptyState } from "@getpostflow/ui/empty-state";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C" },
  { id: "facebook", name: "Facebook", icon: "📘", color: "#1877F2" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2" },
  { id: "x", name: "X (Twitter)", icon: "🐦", color: "#1DA1F2" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000" },
  { id: "reddit", name: "Reddit", icon: "🤖", color: "#FF4500" },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "#E60023" },
];

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Connected Accounts
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Connect and manage your social media accounts. Starter plan: up to 4 accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">0 / 4 used</Badge>
        </div>
      </div>

      {/* Entitlement gate notice */}
      <div
        className="rounded-2xl border px-4 py-3 text-sm"
        style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
      >
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>Note on Reddit:</span>{" "}
        <span style={{ color: "var(--text-secondary)" }}>
          Reddit does not allow automated responses. GetPostFlow supports Reddit for content monitoring and manual engagement only.
        </span>
      </div>

      <EmptyState
        title="No accounts connected yet"
        description="Connect your first social media account to start scheduling posts, managing your inbox, and tracking analytics."
        icon={<span>🔗</span>}
        action={
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Account connections via Ayrshare integration — coming in Phase 2
          </p>
        }
      />

      {/* Platform grid — placeholder for connect flow */}
      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Available platforms
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLATFORMS.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {p.id === "reddit" ? "Monitor only" : "Connect"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
