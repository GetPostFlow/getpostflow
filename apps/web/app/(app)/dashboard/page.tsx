import { createDb } from "@getpostflow/db";
import { clients, orgSubscriptions, contentItems } from "@getpostflow/db";
import { eq, sql, desc } from "drizzle-orm";
import { auth, currentUser } from "@getpostflow/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { orgId } = await auth();
  const user = await currentUser();
  if (!orgId) redirect("/sign-in");

  const db = createDb();

  // Fetch summary metrics
  const clientsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(eq(clients.clerkOrgId, orgId))
    .then((r) => r[0]?.count ?? 0);

  const pendingApprovals = await db
    .select({ count: sql<number>`count(*)` })
    .from(contentItems)
    .where(and(eq(contentItems.clerkOrgId, orgId), eq(contentItems.status, "pending_approval")))
    .then((r) => r[0]?.count ?? 0)
    .catch(() => 0);

  const recentClients = await db
    .select()
    .from(clients)
    .where(eq(clients.clerkOrgId, orgId))
    .orderBy(desc(clients.createdAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agency Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.firstName}. Here's what's happening across your clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
          <p className="text-3xl font-bold mt-2">{clientsCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
          <p className="text-3xl font-bold mt-2">{pendingApprovals}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
          <p className="text-3xl font-bold mt-2">4.8%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold">Recent Clients</h2>
            <a href="/dashboard/clients" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          <div className="divide-y divide-border">
            {recentClients.map((client: any) => (
              <div key={client.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.industry}</p>
                  </div>
                </div>
                <a href={`/dashboard/clients/${client.id}`} className="text-xs font-medium border border-border px-3 py-1 rounded hover:bg-secondary">
                  Manage
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function and(...args: any[]) {
  return args.filter(Boolean);
}
