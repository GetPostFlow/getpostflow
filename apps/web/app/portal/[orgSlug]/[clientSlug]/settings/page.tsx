import { createDb } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { subscriptions } from "@getpostflow/db";
import { getPortalClient } from "@getpostflow/auth/server";
import { redirect } from "next/navigation";

export default async function PortalSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
}) {
  const { orgSlug, clientSlug } = await params;
  const client = await getPortalClient(orgSlug, clientSlug);
  if (!client) redirect("/portal/login");

  const db = createDb();

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.orgId, client.orgId))
    .limit(1);

  const refundDeadline = subscription?.createdAt 
    ? new Date(new Date(subscription.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000)
    : null;
  const canRefund = refundDeadline ? new Date() < refundDeadline : false;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and account details.
        </p>
      </div>

      <section className="p-6 bg-card border border-border rounded-xl space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subscription Plan</h2>
          <p className="text-lg font-bold mt-2">{subscription?.planCode || "Starter"} Plan</p>
          <p className="text-sm text-muted-foreground">Status: <span className="text-primary font-medium capitalize">{subscription?.status || "Active"}</span></p>
        </div>

        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Billing Period</h2>
          <p className="text-sm mt-2">
            Next billing date: <span className="font-medium">{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Refund Policy</h2>
          <p className="text-sm mt-2">
            {canRefund 
              ? `You are within the 14-day refund window. Deadline: ${refundDeadline?.toLocaleDateString()}`
              : "The 14-day refund window has passed."}
          </p>
        </div>

        <div className="pt-6 flex gap-3">
          <button className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
            Downgrade Plan
          </button>
          <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary/30">
            Cancel Subscription
          </button>
        </div>
      </section>

      <section className="p-6 bg-secondary/10 border border-secondary/20 rounded-xl">
        <h2 className="text-sm font-semibold">Need help?</h2>
        <p className="text-sm text-muted-foreground mt-1">If you have questions about your billing or need to update your account details, please contact our support team.</p>
        <a 
          href={`/portal/${orgSlug}/${clientSlug}/messages`}
          className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
        >
          Open Support Chat
        </a>
      </section>
    </div>
  );
}
