import { db } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import {
  intakeFormTable,
  brandStrategyTable,
  contentTable,
} from "@getpostflow/db/schema";
import { getOrgFromAuth } from "@getpostflow/auth/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Approvals",
  description: "View all pending approvals across your agency",
};

export default async function ApprovalsPage() {
  const org = await getOrgFromAuth();
  if (!org) redirect("/");

  const [intakeForms, strategies, content] = await Promise.all([
    db
      .select()
      .from(intakeFormTable)
      .where(eq(intakeFormTable.orgId, org.id)),
    db
      .select()
      .from(brandStrategyTable)
      .where(eq(brandStrategyTable.orgId, org.id)),
    db
      .select()
      .from(contentTable)
      .where(eq(contentTable.orgId, org.id)),
  ]);

  const pendingIntakes = intakeForms.filter((f) => f.status === "pending");
  const pendingStrategies = strategies.filter((s) => s.status === "pending");
  const pendingContent = content.filter((c) => c.status === "pending");

  const totalPending = pendingIntakes.length + pendingStrategies.length + pendingContent.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalPending > 0
            ? `${totalPending} items awaiting approval`
            : "All approvals are up to date"}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Intake Forms Pending Review */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Intake Forms Pending Review</h2>
            <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
              {pendingIntakes.length}
            </span>
          </div>
          {pendingIntakes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending intake forms</p>
          ) : (
            <div className="space-y-2">
              {pendingIntakes.map((intake) => (
                <Link
                  key={intake.id}
                  href={`/dashboard/intake-reviews`}
                  className="flex items-center justify-between p-3 bg-secondary rounded-md hover:bg-secondary/80 transition"
                >
                  <div>
                    <p className="text-sm font-medium">Brand Intake Form</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(intake.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    Review
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Strategies Pending Review */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Strategies Pending Review</h2>
            <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {pendingStrategies.length}
            </span>
          </div>
          {pendingStrategies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending strategies</p>
          ) : (
            <div className="space-y-2">
              {pendingStrategies.map((strategy) => (
                <Link
                  key={strategy.id}
                  href={`/dashboard/strategy-reviews`}
                  className="flex items-center justify-between p-3 bg-secondary rounded-md hover:bg-secondary/80 transition"
                >
                  <div>
                    <p className="text-sm font-medium">Brand Strategy</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(strategy.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                    Review
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Content Pending Client Approval */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Content Pending Client Approval</h2>
            <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
              {pendingContent.length}
            </span>
          </div>
          {pendingContent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending content approvals</p>
          ) : (
            <div className="space-y-2">
              {pendingContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/client-approvals`}
                  className="flex items-center justify-between p-3 bg-secondary rounded-md hover:bg-secondary/80 transition"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled {new Date(item.scheduledAt || new Date()).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    Pending
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
