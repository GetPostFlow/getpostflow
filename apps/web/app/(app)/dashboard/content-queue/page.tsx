import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, contentItems } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { EmptyState } from "@getpostflow/ui/empty-state";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Queue — GetPostFlow",
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  tiktok: "#000000",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  pinterest: "#E60023",
  discord: "#5865F2",
  reddit: "#FF4500",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
  client_published: "Client Published",
  archived: "Archived",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  pending_review: "warning",
  approved: "default",
  scheduled: "default",
  publishing: "default",
  published: "success",
  failed: "danger",
  client_published: "success",
  archived: "muted",
};

interface Props {
  searchParams: Promise<{ client?: string; status?: string; platform?: string }>;
}

export default async function ContentQueuePage({ searchParams }: Props) {
  const { client: clientFilter, status: statusFilter, platform: platformFilter } = await searchParams;

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

  const clientIds = clientList.map((c) => c.id);

  // Fetch content across all clients
  const allContent = org && clientIds.length > 0
    ? await db
        .select({
          id: contentItems.id,
          clientId: contentItems.clientId,
          platform: contentItems.platform,
          status: contentItems.status,
          title: contentItems.title,
          scheduledFor: contentItems.scheduledFor,
          createdAt: contentItems.createdAt,
          clientName: clients.name,
        })
        .from(contentItems)
        .innerJoin(clients, eq(contentItems.clientId, clients.id))
        .where(eq(clients.orgId, org.id))
        .orderBy(desc(contentItems.createdAt))
        .limit(100)
    : [];

  // Apply filters
  const filtered = allContent.filter((item) => {
    if (clientFilter && item.clientId !== clientFilter) return false;
    if (statusFilter && item.status !== statusFilter) return false;
    if (platformFilter && item.platform !== platformFilter) return false;
    return true;
  });

  const counts = {
    draft: allContent.filter((c) => c.status === "draft").length,
    in_review: allContent.filter((c) => c.status === "pending_review").length,
    approved: allContent.filter((c) => c.status === "approved").length,
    scheduled: allContent.filter((c) => c.status === "scheduled").length,
    published: allContent.filter((c) => c.status === "published").length,
    failed: allContent.filter((c) => c.status === "failed").length,
  };

  function filterHref(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if ((updates.client ?? clientFilter) && updates.client !== "") params.set("client", updates.client ?? clientFilter ?? "");
    if ((updates.status ?? statusFilter) && updates.status !== "") params.set("status", updates.status ?? statusFilter ?? "");
    if ((updates.platform ?? platformFilter) && updates.platform !== "") params.set("platform", updates.platform ?? platformFilter ?? "");
    const q = params.toString();
    return `/dashboard/content-queue${q ? `?${q}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Content Queue
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            All content items across all clients. Filter by client, platform, or status.
          </p>
        </div>
        {clientFilter ? (
          <Link
            href={`/dashboard/clients/${clientFilter}/content/new`}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Create Content
          </Link>
        ) : (
          <div
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
            style={{ background: "var(--brand-primary)", color: "white" }}
            title="Select a client first to create content"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Create Content
          </div>
        )}
      </div>

      {/* Status tiles */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(counts).map(([status, count]) => (
          <Link key={status} href={filterHref({ status: statusFilter === status ? "" : status })}>
            <Card>
              <CardContent>
                <p className="text-[10px] mt-2 capitalize" style={{ color: "var(--text-muted)" }}>
                  {status.replace(/_/g, " ")}
                </p>
                <p
                  className="text-xl font-bold mt-0.5"
                  style={{ color: statusFilter === status ? "var(--brand-primary)" : "var(--text-primary)" }}
                >
                  {count}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Filter:</span>

        {/* Client filter */}
        <select
          className="rounded-xl border px-3 py-1.5 text-xs"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
          value={clientFilter ?? ""}
          onChange={() => {}}
          disabled
          aria-label="Filter by client (use links)"
        >
          <option value="">All clients</option>
          {clientList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Client links */}
        <div className="flex gap-1 flex-wrap">
          <Link
            href={filterHref({ client: "" })}
            className="rounded-lg px-3 py-1 text-xs font-medium transition"
            style={{
              background: !clientFilter ? "var(--brand-primary)" : "var(--subtle)",
              color: !clientFilter ? "white" : "var(--text-secondary)",
            }}
          >
            All
          </Link>
          {clientList.map((c) => (
            <Link
              key={c.id}
              href={filterHref({ client: clientFilter === c.id ? "" : c.id })}
              className="rounded-lg px-3 py-1 text-xs font-medium transition"
              style={{
                background: clientFilter === c.id ? "var(--brand-primary)" : "var(--subtle)",
                color: clientFilter === c.id ? "white" : "var(--text-secondary)",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Active filter notice */}
      {(clientFilter || statusFilter || platformFilter) && (
        <div
          className="flex items-center gap-2 rounded-xl border p-3 text-xs"
          style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--brand-primary)" }}>
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.5h1.5V9h-1.5V4.5zm0 5.5h1.5v1.5h-1.5V10z" />
          </svg>
          <span style={{ color: "var(--text-secondary)" }}>
            Showing {filtered.length} of {allContent.length} items
            {clientFilter && ` for ${clientList.find((c) => c.id === clientFilter)?.name ?? clientFilter}`}
            {statusFilter && ` · status: ${STATUS_LABELS[statusFilter] ?? statusFilter}`}
          </span>
          <Link href="/dashboard/content-queue" className="ml-auto font-medium transition hover:opacity-70" style={{ color: "var(--brand-primary)" }}>
            Clear filters
          </Link>
        </div>
      )}

      {/* Content list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No content items"
          description={allContent.length === 0 ? "Create content from a client workspace to get started." : "No items match your current filters."}
          action={
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Go to Clients
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Content Items ({filtered.length})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/clients/${item.clientId}/content/${item.id}`}
                  className="flex items-center justify-between rounded-xl p-3 transition hover:bg-[var(--subtle)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: PLATFORM_COLOR[item.platform ?? ""] ?? "var(--brand-primary)" }}
                    />
                    <span className="text-xs font-medium capitalize flex-shrink-0 w-20" style={{ color: "var(--text-muted)" }}>
                      {item.platform ?? "post"}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {item.title ?? "Untitled"}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      — {item.clientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                    {item.scheduledFor && (
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(item.scheduledFor).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
