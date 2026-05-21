import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, clientBrandStrategies, clientIntakeSubmissions, contentItems } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import Link from "next/link";
import { PortalLinkButton } from "./_portal-link-button";

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

const CONTENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
};

const CONTENT_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  in_review: "warning",
  approved: "default",
  scheduled: "default",
  published: "success",
  failed: "danger",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

type Tab = "overview" | "intake" | "strategy" | "content" | "portal" | "accounts" | "analytics" | "activity";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "overview", label: "Client Overview", description: "Client info, status, and connected accounts" },
  { id: "intake", label: "Intake", description: "Brand intake form submitted by the client" },
  { id: "strategy", label: "Strategy", description: "AI-generated brand strategy with approval status" },
  { id: "content", label: "Content", description: "Content calendar and posts for this client" },
  { id: "portal", label: "Portal Preview", description: "View exactly what your client sees" },
  { id: "accounts", label: "Accounts", description: "This client's connected social media accounts" },
  { id: "analytics", label: "Analytics", description: "Performance metrics for this client" },
  { id: "activity", label: "Activity", description: "Audit log of all actions for this client" },
];

export default async function ClientWorkspacePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const activeTab: Tab = (TABS.find((t) => t.id === rawTab)?.id) ?? "overview";

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

  const [latestIntake] = await db
    .select()
    .from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, client.id))
    .orderBy(desc(clientIntakeSubmissions.id))
    .limit(1);

  const [latestStrategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .orderBy(desc(clientBrandStrategies.versionInt))
    .limit(1);

  const recentContent = await db
    .select({
      id: contentItems.id,
      clientId: contentItems.clientId,
      platform: contentItems.platform,
      status: contentItems.status,
      title: contentItems.title,
      scheduledFor: contentItems.scheduledFor,
      createdAt: contentItems.createdAt,
    })
    .from(contentItems)
    .where(eq(contentItems.clientId, client.id))
    .orderBy(desc(contentItems.createdAt))
    .limit(10);

  const hasIntakeSubmitted = !!latestIntake && !latestIntake.isDraft;
  const hasIntakeDraft = latestIntake?.isDraft === true;

  function tabHref(tabId: Tab) {
    return `/dashboard/clients/${client.id}?tab=${tabId}`;
  }

  return (
    <div className="flex flex-col gap-0 min-h-full">
      {/* ── Header ── */}
      <div
        className="flex items-start justify-between px-6 pt-2 pb-4 border-b"
        style={{ borderColor: "var(--border-soft)" }}
      >
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
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white flex-shrink-0"
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

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* View Client Portal — prominent CTA */}
          <PortalLinkButton clientId={client.id} />
          <Badge variant={STATUS_VARIANT[client.status] ?? "muted"}>
            {STATUS_LABELS[client.status] ?? client.status}
          </Badge>
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      <div
        className="flex items-center gap-1 px-6 py-2 border-b overflow-x-auto"
        style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tabHref(tab.id)}
              title={tab.description}
              className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition"
              style={{
                background: isActive ? "var(--brand-primary)" : "transparent",
                color: isActive ? "white" : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 p-6">
        {activeTab === "overview" && (
          <OverviewTab
            client={client}
            latestIntake={latestIntake}
            latestStrategy={latestStrategy}
            recentContent={recentContent}
          />
        )}
        {activeTab === "intake" && (
          <IntakeTab client={client} latestIntake={latestIntake} hasIntakeSubmitted={hasIntakeSubmitted} hasIntakeDraft={hasIntakeDraft} />
        )}
        {activeTab === "strategy" && (
          <StrategyTab client={client} latestStrategy={latestStrategy} />
        )}
        {activeTab === "content" && (
          <ContentTab client={client} recentContent={recentContent} />
        )}
        {activeTab === "portal" && (
          <PortalTab client={client} />
        )}
        {activeTab === "accounts" && (
          <AccountsTab client={client} />
        )}
        {activeTab === "analytics" && (
          <AnalyticsTab client={client} />
        )}
        {activeTab === "activity" && (
          <ActivityTab client={client} latestIntake={latestIntake} latestStrategy={latestStrategy} />
        )}
      </div>
    </div>
  );
}

// ─── Tab Components ───────────────────────────────────────────────────────────

function OverviewTab({
  client,
  latestIntake,
  latestStrategy,
  recentContent,
}: {
  client: { id: string; name: string; status: string; industry: string | null; primaryLocale: string; primaryContactName: string | null; primaryContactEmail: string | null; slug: string; createdAt: Date };
  latestIntake: { isDraft: boolean } | undefined;
  latestStrategy: { status: string; versionInt: number } | undefined;
  recentContent: { id: string; status: string; platform: string | null; title: string; scheduledFor: Date | null; clientId: string }[];
}) {
  const hasIntakeSubmitted = !!latestIntake && !latestIntake.isDraft;

  const steps = [
    { number: 1, label: "Client Created", done: true },
    { number: 2, label: "Intake Complete", done: hasIntakeSubmitted },
    { number: 3, label: "Strategy Drafted", done: !!latestStrategy },
    { number: 4, label: "Strategist Review", done: latestStrategy?.status === "strategist_approved" || latestStrategy?.status === "client_pending" || latestStrategy?.status === "client_approved" || latestStrategy?.status === "active" },
    { number: 5, label: "Client Approved", done: latestStrategy?.status === "client_approved" || latestStrategy?.status === "active" },
    { number: 6, label: "Live", done: latestStrategy?.status === "active" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Onboarding Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Onboarding Progress
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-0 flex-wrap">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition"
                    style={{
                      background: step.done ? "var(--brand-success)" : "var(--subtle)",
                      color: step.done ? "white" : "var(--text-muted)",
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
                  <span className="text-[10px] text-center max-w-[70px] leading-tight" style={{ color: "var(--text-muted)" }}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="h-px w-10 mx-1 mb-5"
                    style={{ background: steps[i + 1]?.done || step.done ? "var(--brand-success)" : "var(--border-soft)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Intake Status", value: !latestIntake ? "Not Started" : latestIntake.isDraft ? "Draft" : "Submitted" },
          { label: "Strategy Version", value: latestStrategy ? `v${latestStrategy.versionInt}` : "—" },
          { label: "Content Items", value: recentContent.length.toString() },
          { label: "Strategy Status", value: latestStrategy ? latestStrategy.status.replace(/_/g, " ") : "—" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-xs mt-2 capitalize" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p className="text-lg font-bold mt-1 capitalize" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Brand Intake</h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {hasIntakeSubmitted ? "Intake submitted." : latestIntake?.isDraft ? "Draft in progress." : "Not started yet."}
            </p>
            <Link
              href={`/dashboard/clients/${client.id}/intake`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              {hasIntakeSubmitted ? "View Intake" : latestIntake?.isDraft ? "Resume Intake" : "Start Intake"}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Brand Strategy</h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {latestStrategy ? `v${latestStrategy.versionInt} — ${latestStrategy.status.replace(/_/g, " ")}` : "Auto-generated after intake."}
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

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Content Calendar</h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {recentContent.length > 0 ? `${recentContent.length} content items.` : "No content yet."}
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
      </div>

      {/* Client details */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Client Details</h3>
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
                <dd className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function IntakeTab({
  client,
  latestIntake,
  hasIntakeSubmitted,
  hasIntakeDraft,
}: {
  client: { id: string; name: string };
  latestIntake: { isDraft: boolean } | undefined;
  hasIntakeSubmitted: boolean;
  hasIntakeDraft: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Brand Intake Form</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Brand information collected from {client.name}. Used to generate AI strategy.
          </p>
        </div>
        {hasIntakeSubmitted ? (
          <Badge variant="success">Submitted</Badge>
        ) : hasIntakeDraft ? (
          <Badge variant="warning">Draft</Badge>
        ) : (
          <Badge variant="muted">Not Started</Badge>
        )}
      </div>

      {!latestIntake ? (
        <Card>
          <CardContent>
            <div className="py-8 text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "var(--subtle)" }}
              >
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                  <path d="M2 2h12v2H2V2zm0 4h12v2H2V6zm0 4h7v2H2v-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No intake form yet</p>
              <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-muted)" }}>
                Start the intake to collect brand information and generate an AI strategy draft.
              </p>
              <Link
                href={`/dashboard/clients/${client.id}/intake`}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                Start Intake
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              {hasIntakeSubmitted
                ? "Intake has been submitted. View the full form below."
                : "An intake draft is in progress. Resume to complete it."}
            </p>
            <Link
              href={`/dashboard/clients/${client.id}/intake`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              {hasIntakeSubmitted ? "View Full Intake" : "Resume Intake"}
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StrategyTab({
  client,
  latestStrategy,
}: {
  client: { id: string; name: string };
  latestStrategy: { status: string; versionInt: number } | undefined;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Brand Strategy</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            AI-generated strategy draft with strategist edits and client approval status.
          </p>
        </div>
        {latestStrategy && (
          <Badge variant={STRATEGY_STATUS_VARIANT[latestStrategy.status] ?? "muted"}>
            {STRATEGY_STATUS_LABELS[latestStrategy.status] ?? latestStrategy.status}
          </Badge>
        )}
      </div>

      {!latestStrategy ? (
        <Card>
          <CardContent>
            <div className="py-8 text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "var(--subtle)" }}
              >
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                  <path d="M8 1l7 4v2L8 11 1 7V5l7-4zm0 2.3L3.5 6 8 8.7 12.5 6 8 3.3zM1 10l7 4 7-4v2l-7 4-7-4v-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No strategy yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Strategy is auto-generated after the intake form is submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Strategy v{latestStrategy.versionInt}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Status: <span className="capitalize">{latestStrategy.status.replace(/_/g, " ")}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={`/dashboard/clients/${client.id}/strategy/review`}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                  style={{ background: "var(--brand-primary)" }}
                >
                  {latestStrategy.status === "strategist_pending" ? "Review & Approve" : "View Strategy"}
                </Link>
                {latestStrategy.status === "client_pending" && (
                  <span
                    className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium"
                    style={{ background: "var(--subtle)", color: "var(--text-muted)" }}
                  >
                    Awaiting client approval
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Approval Flow</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {[
                  { label: "AI Draft", done: true },
                  { label: "Strategist Review", done: ["strategist_approved", "client_pending", "client_approved", "active"].includes(latestStrategy.status) },
                  { label: "Client Approval", done: ["client_approved", "active"].includes(latestStrategy.status) },
                  { label: "Active", done: latestStrategy.status === "active" },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: step.done ? "var(--brand-success)" : "var(--subtle)" }}
                    >
                      {step.done && (
                        <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: step.done ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ContentTab({
  client,
  recentContent,
}: {
  client: { id: string; name: string };
  recentContent: { id: string; status: string; platform: string | null; title: string; scheduledFor: Date | null; clientId: string }[];
}) {
  const counts = {
    draft: recentContent.filter((c) => c.status === "draft").length,
    in_review: recentContent.filter((c) => c.status === "in_review").length,
    approved: recentContent.filter((c) => c.status === "approved").length,
    scheduled: recentContent.filter((c) => c.status === "scheduled").length,
    published: recentContent.filter((c) => c.status === "published").length,
    failed: recentContent.filter((c) => c.status === "failed").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Content</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Content calendar and posts for {client.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/clients/${client.id}/content/new`}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Content
          </Link>
          <Link
            href={`/dashboard/clients/${client.id}/content`}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
          >
            Full Calendar
          </Link>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(counts).map(([status, count]) => (
          <Card key={status}>
            <CardContent>
              <p className="text-[10px] mt-2 capitalize" style={{ color: "var(--text-muted)" }}>
                {status.replace(/_/g, " ")}
              </p>
              <p className="text-xl font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent content list */}
      {recentContent.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No content yet</p>
              <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-muted)" }}>Create your first content item for this client.</p>
              <Link
                href={`/dashboard/clients/${client.id}/content/new`}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                Create Content
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Content</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {recentContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/clients/${client.id}/content/${item.id}`}
                  className="flex items-center justify-between rounded-xl p-3 transition hover:bg-[var(--subtle)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: item.platform === "instagram" ? "#E1306C" : item.platform === "facebook" ? "#1877F2" : item.platform === "linkedin" ? "#0A66C2" : "var(--brand-primary)" }}
                    />
                    <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{item.platform}</span>
                    <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {item.title ?? "Untitled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={CONTENT_STATUS_VARIANT[item.status] ?? "muted"}>
                      {CONTENT_STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                    {item.scheduledFor && (
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(item.scheduledFor).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PortalTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Portal Preview</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          View exactly what {client.name} sees when they open their client portal.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="py-8 flex flex-col items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--subtle)" }}
            >
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none" style={{ color: "var(--brand-primary)" }}>
                <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 2h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Open Client Portal for {client.name}
              </p>
              <p className="text-xs mt-1 max-w-sm" style={{ color: "var(--text-muted)" }}>
                The client portal is a simplified view where {client.name} can approve strategies and content.
                No login is required — it uses a secure magic link.
              </p>
            </div>

            <PortalLinkButton clientId={client.id} />
          </div>
        </CardContent>
      </Card>

      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          What your client sees in their portal:
        </p>
        <ul className="flex flex-col gap-1.5">
          {[
            "Strategy Review — approve or request changes to their brand strategy",
            "Content Review — approve or reject scheduled posts",
            "Calendar — view-only content calendar",
            "Reports — monthly performance reports (PDF)",
            "Notifications — history of all emails sent",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 flex-shrink-0" style={{ color: "var(--brand-primary)" }}>
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.7 5.3L7.5 10.5 4.3 7.3l1.4-1.4 1.8 1.8 2.8-2.8 1.4 1.4z" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { id: "tiktok", label: "TikTok", color: "#000000" },
  { id: "twitter", label: "X (Twitter)", color: "#1DA1F2" },
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "pinterest", label: "Pinterest", color: "#E60023" },
];

function AccountsTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Connected Accounts</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Social media accounts belonging to <strong>{client.name}</strong> — connected so you can post on their behalf.
        </p>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "var(--brand-primary)", background: "rgba(47, 93, 98, 0.05)" }}
      >
        <p className="text-xs font-medium" style={{ color: "var(--brand-primary)" }}>
          These are your <strong>client&apos;s</strong> social media accounts — not your team&apos;s accounts.
          Connecting them allows you to schedule and publish posts on behalf of {client.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="flex items-center justify-between rounded-2xl border p-4"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: platform.color }}
              >
                {platform.label.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{platform.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Not connected</p>
              </div>
            </div>
            <Link
              href={`/dashboard/accounts`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
              style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
            >
              Connect
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Analytics</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Performance metrics for {client.name}.
        </p>
      </div>
      <Card>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Analytics coming soon</p>
            <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-muted)" }}>
              View full analytics across all clients in the Analytics section.
            </p>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Open Analytics
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityTab({
  client,
  latestIntake,
  latestStrategy,
}: {
  client: { id: string; name: string; createdAt: Date };
  latestIntake: { isDraft: boolean; createdAt?: Date } | undefined;
  latestStrategy: { status: string; versionInt: number; createdAt?: Date } | undefined;
}) {
  const events = [
    latestStrategy && {
      label: `Strategy v${latestStrategy.versionInt} — ${latestStrategy.status.replace(/_/g, " ")}`,
      type: "strategy" as const,
      date: latestStrategy.createdAt ? new Date(latestStrategy.createdAt).toLocaleDateString() : "—",
    },
    latestIntake && {
      label: latestIntake.isDraft ? "Intake draft saved" : "Intake form submitted",
      type: "intake" as const,
      date: latestIntake.createdAt ? new Date(latestIntake.createdAt).toLocaleDateString() : "—",
    },
    {
      label: "Client created",
      type: "client" as const,
      date: new Date(client.createdAt).toLocaleDateString(),
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Activity Log</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Audit log of all actions for {client.name}.
        </p>
      </div>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-0">
            {events.map((event, i) => (
              event && (
                <div key={i} className="flex items-start gap-4 py-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "var(--brand-primary)" }}
                    />
                    {i < events.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "var(--border-soft)", minHeight: "20px" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>{event.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{event.date}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
