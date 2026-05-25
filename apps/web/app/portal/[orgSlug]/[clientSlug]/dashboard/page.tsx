import { createDb } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { clients, contentItems, brandProfiles } from "@getpostflow/db";
import { redirect } from "next/navigation";
import { auth } from "@getpostflow/auth";

export default async function PortalDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
}) {
  const { orgSlug, clientSlug } = await params;
  const { orgId } = await auth();
  if (!orgId) redirect("/");

  const db = createDb();
  
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.slug, clientSlug))
    .limit(1);

  if (!client) redirect("/portal/login");

  // Load dashboard data
  const [content, strategies] = await Promise.all([
    db
      .select()
      .from(contentItems)
      .where(eq(contentItems.clientId, client.id))
      .orderBy(desc(contentItems.createdAt))
      .limit(5),
    db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.clientId, client.id))
      .limit(1),
  ]);

  const pendingApprovals = content.filter((c: any) => c.status === "pending_review");
  const latestStrategy = strategies[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {client.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is an overview of your social media management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
          <p className="text-2xl font-bold mt-2 text-primary capitalize">{client.status.replace("_", " ")}</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Approvals</p>
          <p className="text-2xl font-bold mt-2 text-primary">{pendingApprovals.length}</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Strategy</p>
          <p className="text-2xl font-bold mt-2 text-primary">{latestStrategy ? "Approved" : "Drafting"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Content</h2>
          <div className="space-y-3">
            {content.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No content generated yet</p>
            ) : (
              content.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.title || "Social Post"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.platform} • {item.status}</p>
                  </div>
                  <a href={`/portal/${orgSlug}/${clientSlug}/content`} className="text-xs font-medium text-primary hover:underline">
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Next Steps</h2>
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl space-y-4">
            {client.status === "intake_pending" && (
              <p className="text-sm">Please complete your onboarding intake form to help us build your strategy.</p>
            )}
            {pendingApprovals.length > 0 && (
              <p className="text-sm">You have {pendingApprovals.length} posts waiting for your approval.</p>
            )}
            <a 
              href={`/portal/${orgSlug}/${clientSlug}/messages`}
              className="inline-block w-full py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Message the Team
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
