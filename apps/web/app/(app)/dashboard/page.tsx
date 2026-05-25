import { createDb, clients, contentItems, orgSubscriptions } from "@getpostflow/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireOrgAuth } from "@/lib/auth-org";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { orgRow } = await requireOrgAuth();
  if (!orgRow) redirect("/sign-in");

  const db = createDb();

  // 1. Top Row: KPI Cards
  const [clientCount, pendingApprovals, activeSubs] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.orgId, orgRow.id))
      .then((r) => Number(r[0].count)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.orgId, orgRow.id),
          eq(contentItems.status, "pending_review")
        )
      )
      .then((r) => Number(r[0].count)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orgSubscriptions)
      .where(
        and(
          eq(orgSubscriptions.orgId, orgRow.id),
          eq(orgSubscriptions.status, "active")
        )
      )
      .then((r) => Number(r[0].count)),
  ]);

  // 2. Middle Row: Recent Clients
  const recentClients = await db
    .select()
    .from(clients)
    .where(eq(clients.orgId, orgRow.id))
    .orderBy(desc(clients.createdAt))
    .limit(5);

  // 3. Bottom Row: Urgent Action Items
  const urgentActions = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.orgId, orgRow.id),
        eq(contentItems.status, "pending_review")
      )
    )
    .orderBy(desc(contentItems.createdAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agency Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time performance and action items for your agency.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Clients</p>
          <p className="text-3xl font-bold mt-2">{clientCount}</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Approvals</p>
          <p className="text-3xl font-bold mt-2 text-primary">{pendingApprovals}</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Subscriptions</p>
          <p className="text-3xl font-bold mt-2">{activeSubs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Clients</h2>
            <Link href="/dashboard/clients" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No clients found.</p>
            ) : (
              recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{client.status.replace("_", " ")}</p>
                  </div>
                  <Link href={`/dashboard/clients/${client.id}`} className="text-xs font-medium px-3 py-1 bg-background border border-border rounded-md hover:bg-secondary/50">
                    Manage
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Urgent Actions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Urgent Actions</h2>
            <Link href="/dashboard/approvals" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {urgentActions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">All caught up! No urgent actions.</p>
            ) : (
              urgentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{action.title || "Content Review"}</p>
                    <p className="text-xs text-muted-foreground">Platform: {action.platform} • Pending Approval</p>
                  </div>
                  <Link href={`/dashboard/clients/${action.clientId}/content`} className="text-xs font-medium px-3 py-1 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
