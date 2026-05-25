import { createDb } from "@getpostflow/db";
import { eq, and, or } from "drizzle-orm";
import { clients, brandProfiles, contentItems } from "@getpostflow/db";
import { auth } from "@getpostflow/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Approvals Dashboard",
  description: "Review and approve client intake, strategies, and content",
};

export default async function ApprovalsDashboardPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/");

  const db = createDb();

  // 1. Pending Intake Reviews (Clients with status 'intake_pending' or 'ai_drafting')
  const pendingIntakes = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.orgId, orgId as string),
        or(eq(clients.status, "intake_pending"), eq(clients.status, "ai_drafting"))
      )
    );

  // 2. Pending Strategy Reviews (Brand profiles pending strategist review)
  const pendingStrategies = await db
    .select()
    .from(brandProfiles)
    .where(
      and(
        eq(brandProfiles.orgId, orgId as string),
        eq(brandProfiles.status, "strategist_pending")
      )
    );

  // 3. Pending Client Approvals (Content items waiting for client review)
  const pendingClientApprovals = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.orgId, orgId as string),
        eq(contentItems.status, "pending_review")
      )
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Approvals Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve items across all your clients
        </p>
      </div>

      <div className="grid gap-8">
        {/* Intake Reviews */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Intake Reviews
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {pendingIntakes.length}
            </span>
          </h2>
          <div className="grid gap-3">
            {pendingIntakes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No pending intake reviews</p>
            ) : (
              pendingIntakes.map((client: any) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">Status: {client.status}</p>
                  </div>
                  <Link href={`/dashboard/clients/${client.id}/intake`} className="text-xs font-medium px-3 py-1 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Strategy Reviews */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Strategy Reviews
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {pendingStrategies.length}
            </span>
          </h2>
          <div className="grid gap-3">
            {pendingStrategies.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No pending strategy reviews</p>
            ) : (
              pendingStrategies.map((strategy: any) => (
                <div key={strategy.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Brand Strategy</p>
                    <p className="text-xs text-muted-foreground">Updated: {new Date(strategy.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/dashboard/clients/${strategy.clientId}/strategy`} className="text-xs font-medium px-3 py-1 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Client Approvals */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Waiting for Client
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {pendingClientApprovals.length}
            </span>
          </h2>
          <div className="grid gap-3">
            {pendingClientApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No content waiting for client approval</p>
            ) : (
              pendingClientApprovals.map((content: any) => (
                <div key={content.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{content.title}</p>
                    <p className="text-xs text-muted-foreground">Platform: {content.platform}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                    Pending Client
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
