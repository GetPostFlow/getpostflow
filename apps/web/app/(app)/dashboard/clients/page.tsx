import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { EmptyState } from "@getpostflow/ui/empty-state";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  intake_pending: "Intake Pending",
  ai_drafting: "AI Drafting",
  ai_drafted: "AI Drafted",
  strategist_review: "Strategist Review",
  client_review: "Client Review",
  active: "Active",
  archived: "Archived",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  intake_pending: "warning",
  ai_drafting: "default",
  ai_drafted: "default",
  strategist_review: "warning",
  client_review: "warning",
  active: "success",
  archived: "muted",
};

export default async function ClientsPage() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id, slug: orgs.clerkOrgId })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  const clientList = org
    ? await db
        .select()
        .from(clients)
        .where(eq(clients.orgId, org.id))
        .orderBy(clients.createdAt)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Manage your client accounts and brand strategies.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "var(--brand-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Client
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: clientList.length },
          { label: "Active", value: clientList.filter((c) => c.status === "active").length },
          { label: "In Review", value: clientList.filter((c) => ["strategist_review", "client_review"].includes(c.status)).length },
          { label: "Pending Intake", value: clientList.filter((c) => c.status === "intake_pending").length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client list */}
      {clientList.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Create your first client to get started with the onboarding process."
          action={
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Create First Client
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {clientList.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="flex items-center justify-between rounded-2xl border p-4 transition hover:border-[var(--brand-primary)]/30 hover:shadow-sm"
              style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: "var(--brand-primary)" }}
                >
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {client.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {client.industry ?? "No industry"} · {client.primaryLocale.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[client.status] ?? "muted"}>
                  {STATUS_LABELS[client.status] ?? client.status}
                </Badge>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
