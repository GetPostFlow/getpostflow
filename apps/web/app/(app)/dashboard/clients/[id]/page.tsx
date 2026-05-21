import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, clientBrandStrategies, clientIntakeSubmissions } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import Link from "next/link";
import { PortalLinkButton } from "./_portal-link-button";
import { ViewAsClientButton } from "./_view-as-client-button";

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

const STRATEGY_STATUS_LABELS: Record<string, string> = {
  ai_drafting: "AI Drafting",
  strategist_pending: "Pending Strategist Review",
  strategist_approved: "Strategist Approved",
  client_pending: "Pending Client Approval",
  client_approved: "Client Approved",
  active: "Active",
};

const STRATEGY_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  ai_drafting: "muted",
  strategist_pending: "warning",
  strategist_approved: "default",
  client_pending: "warning",
  client_approved: "success",
  active: "success",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientWorkspacePage({ params }: Props) {
  const { id } = await params;
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) notFound();

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.orgId, org.id)))
    .limit(1);

  if (!client) notFound();

  // Latest intake submission
  const [latestIntake] = await db
    .select()
    .from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, client.id))
    .orderBy(desc(clientIntakeSubmissions.id))
    .limit(1);

  // Latest brand strategy
  const [latestStrategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .orderBy(desc(clientBrandStrategies.versionInt))
    .limit(1);

  const hasIntakeDraft = latestIntake?.isDraft === true;
  const hasIntakeSubmitted = !!latestIntake && !latestIntake.isDraft;
  const canStartIntake = !hasIntakeSubmitted;

  const steps = [
    {
      number: 1,
      label: "Create Client",
      done: true,
      href: null,
    },
    {
      number: 2,
      label: "Complete Intake",
      done: hasIntakeSubmitted,
      active: canStartIntake,
      href: `/dashboard/clients/${client.id}/intake`,
    },
    {
      number: 3,
      label: "AI Draft Strategy",
      done: !!latestStrategy,
      active: hasIntakeSubmitted && !latestStrategy,
      href: null,
    },
    {
      number: 4,
      label: "Strategist Review",
      done: latestStrategy?.status === "strategist_approved" || latestStrategy?.status === "client_pending" || latestStrategy?.status === "client_approved" || latestStrategy?.status === "active",
      active: latestStrategy?.status === "strategist_pending",
      href: latestStrategy ? `/dashboard/clients/${client.id}/strategy/review` : null,
    },
    {
      number: 5,
      label: "Client Approval",
      done: latestStrategy?.status === "client_approved" || latestStrategy?.status === "active",
      active: latestStrategy?.status === "client_pending",
      href: null,
    },
    {
      number: 6,
      label: "Strategy Active",
      done: latestStrategy?.status === "active",
      active: false,
      href: null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-1 text-sm transition hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Clients
          </Link>
          <span style={{ color: "var(--border-soft)" }}>/</span>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--brand-primary)" }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {client.name}
                </h1>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {client.industry ?? "No industry"} · {client.primaryLocale.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ViewAsClientButton
            clientId={client.id}
            clientSlug={client.slug}
            orgSlug={org.clerkOrgId ?? org.id}
          />
          <PortalLinkButton clientId={client.id} />
          <Badge variant={STATUS_VARIANT[client.status] ?? "muted"}>
            {STATUS_LABELS[client.status] ?? client.status}
          </Badge>
        </div>
      </div>

      {/* Onboarding Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Onboarding Progress
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition"
                    style={{
                      background: step.done
                        ? "var(--brand-success)"
                        : step.active
                        ? "var(--brand-primary)"
                        : "var(--subtle)",
                      color: step.done || step.active ? "white" : "var(--text-muted)",
                    }}
                  >
                    {step.done ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className="text-[10px] text-center max-w-[70px] leading-tight"
                    style={{ color: step.active ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="h-px w-10 mx-1 mb-5"
                    style={{
                      background: steps[i + 1]?.done || step.done ? "var(--brand-success)" : "var(--border-soft)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Intake */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Brand Intake
              </h3>
              {hasIntakeSubmitted ? (
                <Badge variant="success">Submitted</Badge>
              ) : hasIntakeDraft ? (
                <Badge variant="warning">Draft</Badge>
              ) : (
                <Badge variant="muted">Not Started</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {hasIntakeSubmitted
                ? "Intake has been submitted and AI drafting has been initiated."
                : hasIntakeDraft
                ? "A draft intake has been started. Resume to complete."
                : "Collect brand information to generate an AI strategy draft."}
            </p>
            {canStartIntake && (
              <Link
                href={`/dashboard/clients/${client.id}/intake`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                {hasIntakeDraft ? "Resume Intake" : "Start Intake"}
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Brand Strategy */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Brand Strategy
              </h3>
              {latestStrategy ? (
                <Badge variant={STRATEGY_STATUS_VARIANT[latestStrategy.status] ?? "muted"}>
                  {STRATEGY_STATUS_LABELS[latestStrategy.status] ?? latestStrategy.status}
                </Badge>
              ) : (
                <Badge variant="muted">Not Started</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {latestStrategy
                ? `Strategy v${latestStrategy.versionInt} · ${STRATEGY_STATUS_LABELS[latestStrategy.status]}`
                : "Strategy will be auto-generated after intake is submitted."}
            </p>
            {latestStrategy && (
              <Link
                href={`/dashboard/clients/${client.id}/strategy/review`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                {latestStrategy.status === "strategist_pending" ? "Review Strategy" : "View Strategy"}
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase 3: Content Calendar + Asset Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Content Calendar
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Schedule, generate, and manage social media content across all platforms.
            </p>
            <Link
              href={`/dashboard/clients/${client.id}/content`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Open Calendar
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Asset Library
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Upload and manage images, videos, and documents for this client.
            </p>
            <Link
              href={`/dashboard/clients/${client.id}/assets`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
              style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
            >
              Open Assets
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Phase 6: Analytics + Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Performance Analytics
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              View engagement trends, platform comparison, content mix, and posting heatmap.
            </p>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Open Analytics
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Reports
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Generate branded PDF reports and schedule automatic monthly delivery to the client.
            </p>
            <Link
              href={`/dashboard/clients/${client.id}/reports`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
              style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
            >
              View Reports
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Client details */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Client Details
          </h3>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            {[
              { label: "Contact Name", value: client.primaryContactName },
              { label: "Contact Email", value: client.primaryContactEmail },
              { label: "Industry", value: client.industry },
              { label: "Primary Locale", value: client.primaryLocale?.toUpperCase() },
              { label: "Client Slug", value: client.slug },
              { label: "Created", value: new Date(client.createdAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt style={{ color: "var(--text-muted)" }}>{label}</dt>
                <dd className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                  {value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
