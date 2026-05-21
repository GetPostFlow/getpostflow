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
  title: "Client Approvals — GetPostFlow",
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

export default async function ClientApprovalsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/dashboard");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  const allContent = org
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

  // Content pending client review (in_review status = sent to client for approval)
  const pendingApproval = allContent.filter((c) => c.status === "in_review");
  const approved = allContent.filter((c) => c.status === "approved");
  const published = allContent.filter((c) => c.status === "published");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Client Approvals
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Track content that has been sent to clients for approval. See what they&apos;ve approved, rejected, or haven&apos;t responded to yet.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Client Review", value: pendingApproval.length, highlight: true },
          { label: "Client Approved", value: approved.length },
          { label: "Published", value: published.length },
          { label: "Total Submitted", value: pendingApproval.length + approved.length + published.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: stat.highlight && stat.value > 0 ? "var(--brand-warning)" : "var(--text-primary)" }}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending approval */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Awaiting Client Response
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Content sent to clients that hasn&apos;t been approved or rejected yet.
              </p>
            </div>
            {pendingApproval.length > 0 && (
              <Badge variant="warning">{pendingApproval.length} pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingApproval.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>
              No content pending client approval right now.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingApproval.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                  style={{ borderColor: "rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.05)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: PLATFORM_COLOR[item.platform] ?? "var(--brand-primary)" }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {item.title ?? "Untitled"}
                      </p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--text-muted)" }}>
                        {item.platform} · {item.clientName}
                        {item.scheduledFor && ` · Scheduled ${new Date(item.scheduledFor).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="warning">Awaiting Approval</Badge>
                    <Link
                      href={`/dashboard/clients/${item.clientId}/content/${item.id}`}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                      style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved */}
      {approved.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Client Approved
              </h2>
              <Badge variant="success">{approved.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {approved.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                  style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: PLATFORM_COLOR[item.platform] ?? "var(--brand-primary)" }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {item.title ?? "Untitled"}
                      </p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--text-muted)" }}>
                        {item.platform} · {item.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="success">Approved</Badge>
                    <Link
                      href={`/dashboard/clients/${item.clientId}/content/${item.id}`}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                      style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pendingApproval.length === 0 && approved.length === 0 && (
        <EmptyState
          title="No content for approval"
          description="Submit content to clients for approval from the Content Queue or a Client Workspace."
          action={
            <Link
              href="/dashboard/content-queue"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              View Content Queue
            </Link>
          }
        />
      )}
    </div>
  );
}
