import { createDb } from "@getpostflow/db";
import { clientTable, subscriptionTable, contentTable } from "@getpostflow/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { auth, currentUser } from "@getpostflow/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";

export default async function DashboardPage() {
  const { orgId } = await auth();
  const user = await currentUser();
  if (!orgId) redirect("/sign-in");

  const db = createDb();

  // Fetch summary metrics
  const clientsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientTable)
    .where(eq(clientTable.orgId, orgId))
    .then((r) => r[0]?.count ?? 0);

  const activeSubscriptions = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptionTable)
    .where(eq(subscriptionTable.status, "active"))
    .then((r) => r[0]?.count ?? 0);

  const pendingApprovals = await db
    .select({ count: sql<number>`count(*)` })
    .from(contentTable)
    .where(eq(contentTable.status, "pending_approval"))
    .then((r) => r[0]?.count ?? 0);

  const recentClients = await db
    .select()
    .from(clientTable)
    .where(eq(clientTable.orgId, orgId))
    .orderBy(desc(clientTable.createdAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agency Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.firstName}. Here's what's happening across your clients.
        </p>
      </div>

      {/* Top Row: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
          <p className="text-3xl font-bold mt-2">{clientsCount}</p>
          <p className="text-xs text-green-600 mt-2">Active accounts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
          <p className="text-3xl font-bold mt-2">{pendingApprovals}</p>
          <p className="text-xs text-yellow-600 mt-2">Requires attention</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
          <p className="text-3xl font-bold mt-2">{activeSubscriptions}</p>
          <p className="text-xs text-green-600 mt-2">Monthly recurring</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
          <p className="text-3xl font-bold mt-2">4.8%</p>
          <p className="text-xs text-green-600 mt-2">+0.2% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Middle Left: Client Status Board */}
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
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {client.status}
                  </span>
                  <a href={`/dashboard/clients/${client.id}`} className="text-xs font-medium border border-border px-3 py-1 rounded hover:bg-secondary">
                    Manage
                  </a>
                </div>
              </div>
            ))}
            {recentClients.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No clients added yet.
              </div>
            )}
          </div>
        </div>

        {/* Middle Right: Urgent Action Items */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Urgent Actions</h2>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3">
              <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600 font-bold">!</div>
              <div>
                <p className="text-sm font-medium text-red-900">3 Strategy Approvals Overdue</p>
                <p className="text-xs text-red-700 mt-0.5">Follow up with clients immediately</p>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3">
              <div className="w-8 h-8 rounded bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">?</div>
              <div>
                <p className="text-sm font-medium text-yellow-900">New Intake Form Submitted</p>
                <p className="text-xs text-yellow-700 mt-0.5">"EcoWare Solutions" needs strategy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
