import { createDb } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { subscriptionTable } from "@getpostflow/db/schema";
import { getPortalClient } from "@getpostflow/auth/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
  description: "Client portal settings",
};

export default async function ClientPortalSettings({
  params,
}: {
  params: { orgSlug: string; clientSlug: string };
}) {
  const client = await getPortalClient();
  if (!client) redirect("/");

  const subscription = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.clientId, client.id))
    .then((r) => r[0]);

  const billingDate = subscription?.createdAt
    ? new Date(subscription.createdAt)
    : null;
  const refundDeadline = billingDate
    ? new Date(billingDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    : null;
  const canRefund =
    refundDeadline && new Date() < refundDeadline
      ? true
      : false;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and subscription
        </p>
      </div>

      {/* Billing Information */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Billing Date</p>
            <p className="font-medium">
              {billingDate
                ? billingDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Subscription Status</p>
            <p className="font-medium text-green-600">Active</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{subscription?.plan || "Standard"}</p>
          </div>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <h2 className="text-lg font-semibold mb-3">Refund Policy</h2>
        <p className="text-sm mb-3">
          You have 14 days from your billing date to request a refund. After this
          period, no refunds will be issued.
        </p>
        <div className="bg-white rounded p-3 mb-3">
          <p className="text-xs text-muted-foreground mb-1">Refund Deadline</p>
          <p className="font-semibold">
            {refundDeadline
              ? refundDeadline.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Not available"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {canRefund
              ? "You are eligible for a refund"
              : "Refund period has expired"}
          </p>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription Management</h2>
        <div className="space-y-3">
          <button className="w-full px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition">
            Downgrade Plan
          </button>
          <button className="w-full px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
        <p className="text-sm text-muted-foreground mb-3">
          For billing inquiries or subscription changes, please contact our support
          team.
        </p>
        <a
          href={`/portal/${params.orgSlug}/${params.clientSlug}/messages`}
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
