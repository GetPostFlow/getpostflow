import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, contentItems } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import Link from "next/link";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#000000",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  pinterest: "#E60023",
  reddit: "#FF4500",
  discord: "#5865F2",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  reddit: "Reddit",
  discord: "Discord",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  client_published: "Client Published",
  failed: "Failed",
  archived: "Archived",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  pending_review: "warning",
  approved: "default",
  scheduled: "default",
  publishing: "warning",
  published: "success",
  client_published: "success",
  failed: "danger",
  archived: "muted",
};

interface Props {
  searchParams: Promise<{ client?: string }>;
}

export default async function ContentPage({ searchParams }: Props) {
  const { client: selectedClientId } = await searchParams;
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/dashboard");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  const clientList = org
    ? await db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.orgId, org.id))
    : [];

  // Fetch recent content — scoped to selected client if one is chosen
  const recentItems = org
    ? await db
        .select()
        .from(contentItems)
        .where(
          selectedClientId
            ? eq(contentItems.clientId, selectedClientId)
            : eq(contentItems.orgId, org.id)
        )
        .orderBy(desc(contentItems.createdAt))
        .limit(20)
    : [];

  const selectedClient = clientList.find((c) => c.id === selectedClientId);
  const newContentHref = selectedClientId
    ? `/dashboard/clients/${selectedClientId}/content/new`
    : clientList.length === 1
    ? `/dashboard/clients/${clientList[0].id}/content/new`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Content
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {selectedClient
              ? `Showing content for ${selectedClient.name}.`
              : "Content calendars across all clients."}
          </p>
        </div>
        {newContentHref ? (
          <Link
            href={newContentHref}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Content
          </Link>
        ) : (
          <div className="group relative">
            <button
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition cursor-not-allowed opacity-60"
              style={{ background: "var(--brand-primary)" }}
              title="Select a client first"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              New Content
            </button>
            <div
              className="absolute right-0 top-full mt-1 hidden group-hover:block z-10 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", color: "var(--text-muted)" }}
            >
              Select a client from the top bar first
            </div>
          </div>
        )}
      </div>

      {/* Per-client links */}
      {clientList.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {clientList.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}/content`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{
                border: `1px solid ${c.id === selectedClientId ? "var(--brand-primary)" : "var(--border-soft)"}`,
                color: c.id === selectedClientId ? "var(--brand-primary)" : "var(--text-secondary)",
                background: "var(--surface)",
              }}
            >
              {c.name} &rarr; Full Calendar
            </Link>
          ))}
        </div>
      )}

      {/* Recent content */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Recent Content ({recentItems.length})
          </h2>
        </CardHeader>
        <CardContent>
          {clientList.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                No clients yet. Add a client to start creating content.
              </p>
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                Add First Client
              </Link>
            </div>
          ) : recentItems.length === 0 ? (
            <div className="py-12 text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "var(--subtle)" }}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                  <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 3v1h8V5H4zm0 3v1h8V8H4zm0 3v1h5v-1H4z" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                No content yet
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                {selectedClient
                  ? `Create your first post for ${selectedClient.name}.`
                  : "Select a client to start creating posts."}
              </p>
              {newContentHref ? (
                <Link
                  href={newContentHref}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: "var(--brand-primary)" }}
                >
                  Create First Post
                </Link>
              ) : (
                <Link
                  href="/dashboard/clients"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: "var(--brand-primary)" }}
                >
                  Go to Clients
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-soft)" }}>
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/clients/${item.clientId}/content/${item.id}`}
                  className="flex items-center gap-4 py-3 px-1 transition hover:opacity-80"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: PLATFORM_COLORS[item.platform ?? "instagram"] }}
                  />
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0"
                    style={{
                      background: `${PLATFORM_COLORS[item.platform ?? "instagram"]}18`,
                      color: PLATFORM_COLORS[item.platform ?? "instagram"],
                    }}
                  >
                    {PLATFORM_LABELS[item.platform ?? "instagram"] ?? item.platform}
                  </span>
                  <span className="flex-1 text-sm truncate font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </span>
                  <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {item.scheduledFor
                      ? new Date(item.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Unscheduled"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
