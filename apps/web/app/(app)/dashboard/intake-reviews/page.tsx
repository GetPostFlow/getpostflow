import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, clientIntakeSubmissions } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { EmptyState } from "@getpostflow/ui/empty-state";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intake Reviews — GetPostFlow",
};

export default async function IntakeReviewsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/dashboard");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  const intakes = org
    ? await db
        .select({
          id: clientIntakeSubmissions.id,
          clientId: clientIntakeSubmissions.clientId,
          isDraft: clientIntakeSubmissions.isDraft,
          createdAt: clientIntakeSubmissions.createdAt,
          clientName: clients.name,
          clientStatus: clients.status,
          clientIndustry: clients.industry,
        })
        .from(clientIntakeSubmissions)
        .innerJoin(clients, eq(clientIntakeSubmissions.clientId, clients.id))
        .where(eq(clients.orgId, org.id))
        .orderBy(desc(clientIntakeSubmissions.createdAt))
    : [];

  const submitted = intakes.filter((i) => !i.isDraft);
  const drafts = intakes.filter((i) => i.isDraft);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Intake Reviews
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Review brand intake forms submitted by clients. Use these to create or generate AI brand strategies.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Intakes", value: intakes.length },
          { label: "Submitted", value: submitted.length },
          { label: "Drafts", value: drafts.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submitted intakes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Submitted Intakes
            </h2>
            <Badge variant="default">{submitted.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {submitted.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>
              No submitted intakes yet. They will appear here when clients complete their brand intake forms.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {submitted.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between rounded-xl border p-4 transition hover:border-[var(--brand-primary)]/30"
                  style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      {intake.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {intake.clientName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {intake.clientIndustry ?? "No industry"} · Submitted {new Date(intake.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="success">Submitted</Badge>
                    <Link
                      href={`/dashboard/clients/${intake.clientId}/intake`}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      Review Intake
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft intakes */}
      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Draft Intakes
              </h2>
              <Badge variant="warning">{drafts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {drafts.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                  style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "var(--text-muted)" }}
                    >
                      {intake.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {intake.clientName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Draft started {new Date(intake.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="warning">Draft</Badge>
                    <Link
                      href={`/dashboard/clients/${intake.clientId}/intake`}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                      style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {intakes.length === 0 && (
        <EmptyState
          title="No intake forms yet"
          description="Intake forms appear here after clients submit their brand information or you start the intake process."
          action={
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              View Clients
            </Link>
          }
        />
      )}
    </div>
  );
}
