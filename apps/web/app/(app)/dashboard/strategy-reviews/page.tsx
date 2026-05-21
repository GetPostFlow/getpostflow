import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, clientBrandStrategies } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { EmptyState } from "@getpostflow/ui/empty-state";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strategy Reviews — GetPostFlow",
};

const STRATEGY_STATUS_LABELS: Record<string, string> = {
  ai_drafting: "AI Drafting",
  strategist_pending: "Pending Your Review",
  strategist_approved: "Strategist Approved",
  client_pending: "Pending Client Approval",
  client_approved: "Client Approved",
  active: "Active",
};

const STRATEGY_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  ai_drafting: "muted",
  strategist_pending: "warning",
  strategist_approved: "default",
  client_pending: "warning",
  client_approved: "success",
  active: "success",
};

export default async function StrategyReviewsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/dashboard");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  const strategies = org
    ? await db
        .select({
          id: clientBrandStrategies.id,
          clientId: clientBrandStrategies.clientId,
          status: clientBrandStrategies.status,
          versionInt: clientBrandStrategies.versionInt,
          createdAt: clientBrandStrategies.createdAt,
          clientName: clients.name,
          clientIndustry: clients.industry,
        })
        .from(clientBrandStrategies)
        .innerJoin(clients, eq(clientBrandStrategies.clientId, clients.id))
        .where(eq(clients.orgId, org.id))
        .orderBy(desc(clientBrandStrategies.createdAt))
    : [];

  const pendingReview = strategies.filter((s) => s.status === "strategist_pending");
  const awaitingClient = strategies.filter((s) => s.status === "client_pending");
  const approved = strategies.filter((s) => s.status === "client_approved" || s.status === "active");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Strategy Reviews
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Review AI-generated strategy drafts, edit them, and approve for client review. Once you approve, the client receives a link to review and approve their strategy.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Your Review", value: pendingReview.length, highlight: true },
          { label: "Awaiting Client", value: awaitingClient.length },
          { label: "Client Approved", value: approved.length },
          { label: "Total Strategies", value: strategies.length },
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

      {/* Pending your review */}
      {pendingReview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Needs Your Review
              </h2>
              <Badge variant="warning">{pendingReview.length} pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {pendingReview.map((strategy) => (
                <div
                  key={strategy.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                  style={{ borderColor: "var(--brand-warning, #F59E0B)", background: "rgba(245, 158, 11, 0.05)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      {strategy.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {strategy.clientName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Strategy v{strategy.versionInt} · AI draft ready · {new Date(strategy.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="warning">Needs Review</Badge>
                    <Link
                      href={`/dashboard/clients/${strategy.clientId}/strategy/review`}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      Review Strategy
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All strategies */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            All Strategies
          </h2>
        </CardHeader>
        <CardContent>
          {strategies.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>
              No strategies yet. They appear here after intake forms are submitted and AI generates drafts.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="flex items-center justify-between rounded-xl border p-4 transition hover:border-[var(--brand-primary)]/30"
                  style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      {strategy.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {strategy.clientName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        v{strategy.versionInt} · {new Date(strategy.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={STRATEGY_STATUS_VARIANT[strategy.status] ?? "muted"}>
                      {STRATEGY_STATUS_LABELS[strategy.status] ?? strategy.status}
                    </Badge>
                    <Link
                      href={`/dashboard/clients/${strategy.clientId}/strategy/review`}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                      style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
                    >
                      {strategy.status === "strategist_pending" ? "Review" : "View"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {strategies.length === 0 && pendingReview.length === 0 && (
        <EmptyState
          title="No strategies yet"
          description="Strategies are auto-generated after clients submit their intake forms."
          action={
            <Link
              href="/dashboard/intake-reviews"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              View Intake Reviews
            </Link>
          }
        />
      )}
    </div>
  );
}
