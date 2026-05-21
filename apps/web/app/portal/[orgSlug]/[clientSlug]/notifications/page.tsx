import { createDb, notifications } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

const KIND_ICONS: Record<string, string> = {
  strategy_approved: "✓",
  strategy_pending: "📋",
  content_approved: "✓",
  content_pending: "📝",
  content_published: "🚀",
  report_ready: "📊",
  general: "💬",
};

const KIND_COLORS: Record<string, string> = {
  strategy_approved: "#10b981",
  strategy_pending: "#6366f1",
  content_approved: "#10b981",
  content_pending: "#f59e0b",
  content_published: "#2F5D62",
  report_ready: "#0A66C2",
  general: "#9ca3af",
};

// Build a synthetic notification feed for demo (real notifications come from DB)
function buildDemoNotifications(clientName: string) {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  return [
    {
      id: "n1",
      kind: "content_pending",
      title: "2 posts need your approval",
      body: "Your agency has submitted 2 new Instagram and TikTok posts for your review. Please approve them to keep the content calendar on schedule.",
      createdAt: daysAgo(1),
      read: false,
    },
    {
      id: "n2",
      kind: "strategy_approved",
      title: "Brand strategy is active",
      body: `Your brand strategy for ${clientName} has been finalised and is now guiding all content creation. You approved it on ${daysAgo(7).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.`,
      createdAt: daysAgo(7),
      read: true,
    },
    {
      id: "n3",
      kind: "content_published",
      title: "Post published: 'Pumpkin Spice Collection'",
      body: "Your seasonal Instagram post has gone live! It's already receiving strong engagement. View it in the Content Calendar tab.",
      createdAt: daysAgo(3),
      read: true,
    },
    {
      id: "n4",
      kind: "report_ready",
      title: "Monthly report is ready",
      body: "Your October performance report is now available. Highlights: 14% increase in reach, 22% growth in engagement rate, 3 viral posts. View it in the Monthly Report tab.",
      createdAt: daysAgo(10),
      read: true,
    },
    {
      id: "n5",
      kind: "general",
      title: "Welcome to your client portal",
      body: `Hi! Your agency has set up this portal so you can review and approve content, check your content calendar, and see how your social media is performing — all in one place.`,
      createdAt: daysAgo(14),
      read: true,
    },
  ];
}

export default async function PortalNotificationsPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid." />;

  const { client, org } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  // Fetch real notifications from the org
  const realNotifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.orgId, org.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  // If real notifs exist for this org, use them; otherwise use demo notifs
  const feed =
    realNotifs.length > 0
      ? realNotifs.map((n) => ({
          id: n.id,
          kind: n.kind,
          title: n.title,
          body: n.body ?? "",
          createdAt: n.createdAt,
          read: n.read,
        }))
      : buildDemoNotifications(client.name);

  const unread = feed.filter((n) => !n.read).length;

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="notifications" />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>Notifications</h1>
          {unread > 0 && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {unread} new
            </span>
          )}
        </div>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>
          Updates from your agency about {client.name}&apos;s social media programme.
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>
        {feed.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No notifications yet. Your agency will send updates here.
          </div>
        ) : (
          feed.map((notif, idx) => (
            <div
              key={notif.id}
              style={{
                display: "flex",
                gap: "14px",
                padding: "16px 20px",
                borderBottom: idx < feed.length - 1 ? "1px solid #f3f4f6" : "none",
                background: !notif.read ? "#fafff9" : "#fff",
                position: "relative",
              }}
            >
              {!notif.read && (
                <span
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#10b981",
                  }}
                />
              )}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                  background: `${KIND_COLORS[notif.kind] ?? "#9ca3af"}18`,
                }}
              >
                {KIND_ICONS[notif.kind] ?? "💬"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#1a1a1a",
                      marginBottom: "4px",
                    }}
                  >
                    {notif.title}
                  </p>
                  <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
                    {notif.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {notif.body && (
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>{notif.body}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
