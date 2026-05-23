import { notFound } from "next/navigation";
import { requireOrgAuth } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import {
  contentItems,
  contentVersions,
  clients,
  approvals,
} from "@getpostflow/db";
import { eq, and, desc, or } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import ContentEditorClient from "./_content-editor-client";

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

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  publishing: "Publishing…",
  published: "Published",
  client_published: "Client Published",
  failed: "Failed",
  archived: "Archived",
};

interface Props {
  params: Promise<{ id: string; contentId: string }>;
}

export default async function ContentEditorPage({ params }: Props) {
  const { id, contentId } = await params;
  const { orgRow: org } = await requireOrgAuth();

  const db = createDb(process.env.DATABASE_URL!);

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_RE.test(id);

  const [client] = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(
      and(
        isUuid
          ? or(eq(clients.id, id), eq(clients.slug, id))
          : eq(clients.slug, id),
        eq(clients.orgId, org.id)
      )
    )
    .limit(1);
  if (!client) notFound();

  const [item] = await db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.id, contentId), eq(contentItems.clientId, client.id)))
    .limit(1);
  if (!item) notFound();

  const versions = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentItemId, contentId))
    .orderBy(desc(contentVersions.versionInt))
    .limit(20);

  // Fetch any approval threads for this content item
  const contentApprovals = await db
    .select()
    .from(approvals)
    .where(and(eq(approvals.targetEntityId, contentId), eq(approvals.targetEntityType, "content_item")))
    .orderBy(desc(approvals.createdAt))
    .limit(5);

  const draft = item.draftPayload as Record<string, unknown>;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/dashboard/clients/${id}/content`}
            className="flex items-center gap-1 text-sm transition hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Calendar
          </Link>
          <span style={{ color: "var(--border-soft)" }}>/</span>
          <h1
            className="text-sm font-semibold truncate max-w-[300px]"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title}
          </h1>
          <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>
            {STATUS_LABELS[item.status] ?? item.status}
          </Badge>
        </div>
      </div>

      {/* Version history banner */}
      {versions.length > 1 && (
        <div
          className="rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-soft)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-muted)" }}>
            <path d="M8 1v7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span style={{ color: "var(--text-muted)" }}>
            {versions.length} versions saved · Latest: v{versions[0]?.versionInt ?? 1}
            {versions[0]?.changeSummary ? ` — ${versions[0].changeSummary}` : ""}
          </span>
        </div>
      )}

      {/* Approval thread */}
      {contentApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Approval Thread
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {contentApprovals.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-soft)" }}
                >
                  <Badge variant={a.status === "approved" ? "success" : a.status === "rejected" ? "danger" : "warning"}>
                    {a.status}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {(a.notes ?? "No notes")}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main editor */}
      <ContentEditorClient
        contentItem={{
          id: item.id,
          title: item.title,
          status: item.status,
          platform: item.platform ?? "instagram",
          contentType: item.contentType,
          locale: item.locale,
          scheduledFor: item.scheduledFor?.toISOString() ?? null,
          publishedUrl: item.publishedUrl ?? null,
          draftPayload: draft,
        }}
        versions={versions.map((v) => ({
          id: v.id,
          versionInt: v.versionInt,
          body: v.body,
          changeSummary: v.changeSummary ?? null,
          createdAt: v.createdAt.toISOString(),
        }))}
        clientId={client.id}
      />
    </div>
  );
}
