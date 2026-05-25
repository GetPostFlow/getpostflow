import { createDb, clients, brandProfiles, contentItems } from "@getpostflow/db";
import { eq, and, or } from "drizzle-orm";
import { requireOrgAuth } from "@/lib/auth-org";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ApprovalsDashboardPage() {
  const { orgRow } = await requireOrgAuth();
  if (!orgRow) redirect("/sign-in");

  const db = createDb();

  // 1. Pending Intake Reviews (Clients with status 'intake_pending' or 'ai_drafting')
  const pendingIntakes = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.orgId, orgRow.id),
        or(eq(clients.status, "intake_pending"), eq(clients.status, "ai_drafting"))
      )
    );

  // 2. Pending Strategy Reviews (Brand profiles pending strategist review)
  const pendingStrategies = await db
    .select()
    .from(brandProfiles)
    .where(
      and(
        eq(brandProfiles.clientId, sql`any(select id from clients where org_id = ${orgRow.id})`),
        eq(brandProfiles.status, "strategist_pending")
      )
    );

  // 3. Pending Client Approvals (Content items waiting for client review)
  const pendingClientApprovals = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.orgId, orgRow.id),
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
      </div>
    </div>
  );
}

import { sql } from "drizzle-orm";
