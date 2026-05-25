import { createDb } from "@getpostflow/db";
import { and, eq } from "drizzle-orm";
import {
  clientTable,
  contentTable,
  brandStrategyTable,
} from "@getpostflow/db/schema";
import { getPortalClient } from "@getpostflow/auth/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
  description: "Client portal dashboard",
};

export default async function ClientPortalDashboard({
  params,
}: {
  params: { orgSlug: string; clientSlug: string };
}) {
  const client = await getPortalClient();
  if (!client) redirect("/");

  const clientData = await db
    .select()
    .from(clientTable)
    .where(eq(clientTable.id, client.id))
    .then((r) => r[0]);

  if (!clientData) redirect("/");

  const [pendingContent, strategies, recentActivity] = await Promise.all([
    db
      .select()
      .from(contentTable)
      .where(
        and(
          eq(contentTable.clientId, client.id),
          eq(contentTable.status, "pending")
        )
      ),
    db
      .select()
      .from(brandStrategyTable)
      .where(eq(brandStrategyTable.clientId, client.id)),
    db
      .select()
      .from(contentTable)
      .where(eq(contentTable.clientId, client.id))
      .orderBy(contentTable.createdAt)
      .limit(5),
  ]);

  const approvedStrategies = strategies.filter((s) => s.status === "approved");
  const pendingStrategies = strategies.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {clientData.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is your campaign overview
        </p>
      </div>

      {/* Top Row: Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Status */}
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Current Status</p>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{
                background:
                  pendingContent.length > 0
                    ? "var(--brand-warning)"
                    : "var(--brand-success)",
              }}
            />
            <p className="font-semibold">
              {pendingContent.length > 0
                ? "Content Review"
                : approvedStrategies.length > 0
                  ? "Active Campaign"
                  : "Strategy Pending"}
            </p>
          </div>
        </div>

        {/* Next Scheduled Post */}
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Next Scheduled Post</p>
          {recentActivity.length > 0 ? (
            <p className="font-semibold">
              {new Date(
                recentActivity[0].scheduledAt || new Date()
              ).toLocaleDateString()}
            </p>
          ) : (
            <p className="font-semibold text-muted-foreground">No posts scheduled</p>
          )}
        </div>

        {/* Recent Performance */}
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Recent Performance</p>
          <p className="font-semibold">
            {recentActivity.length} posts this month
          </p>
        </div>
      </div>

      {/* Middle Row: Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Awaiting Approval */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Content Awaiting Your Approval</h2>
            <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
              {pendingContent.length}
            </span>
          </div>
          {pendingContent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No content awaiting approval
            </p>
          ) : (
            <a
              href={`/portal/${params.orgSlug}/${params.clientSlug}/content`}
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Review {pendingContent.length} item(s)
            </a>
          )}
        </div>

        {/* Strategies Awaiting Approval */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Strategies Awaiting Your Approval</h2>
            <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {pendingStrategies.length}
            </span>
          </div>
          {pendingStrategies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All strategies approved
            </p>
          ) : (
            <a
              href={`/portal/${params.orgSlug}/${params.clientSlug}/strategy`}
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Review {pendingStrategies.length} strategy(ies)
            </a>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-md"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
                  {item.status as string}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
