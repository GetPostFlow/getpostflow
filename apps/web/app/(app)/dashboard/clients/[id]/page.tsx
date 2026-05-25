"use client";

import { requireOrgAuth, requireClientAccess, isAdminRole } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import { clients, clientBrandStrategies, clientIntakeSubmissions, contentItems, clientAssignments, orgMemberships, users } from "@getpostflow/db";
import { eq, and, desc, or } from "drizzle-orm";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import Link from "next/link";
import React from "react";
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
  pending_review: "Pending Review",
  approved: "Approved",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
  client_published: "Client Published",
  archived: "Archived",
};

const CONTENT_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  pending_review: "warning",
  approved: "default",
  scheduled: "default",
  publishing: "default",
  published: "success",
  failed: "danger",
  client_published: "success",
  archived: "muted",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

type Tab = "overview" | "intake" | "strategy" | "content" | "portal" | "brand-kit" | "templates" | "accounts" | "analytics" | "activity" | "team";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "overview", label: "Client Overview", description: "Client info, status, and connected accounts" },
  { id: "intake", label: "Intake", description: "Brand intake form submitted by the client" },
  { id: "strategy", label: "Strategy", description: "AI-generated brand strategy with approval status" },
  { id: "content", label: "Content", description: "Content calendar and posts for this client" },
  { id: "portal", label: "Portal Preview", description: "View exactly what your client sees" },
  { id: "brand-kit", label: "Brand Kit", description: "Colors, fonts, logos, and voice tone" },
  { id: "templates", label: "Templates", description: "Content templates for this client" },
  { id: "accounts", label: "Accounts", description: "This client's connected social media accounts" },
  { id: "analytics", label: "Analytics", description: "Performance metrics for this client" },
  { id: "activity", label: "Activity", description: "Audit log of all actions for this client" },
  { id: "team", label: "Team", description: "Assign team members to this client" },
];

export default async function ClientWorkspacePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const activeTab: Tab = (TABS.find((t) => t.id === rawTab)?.id) ?? "overview";

  const { dbUserId, orgRow: org, role } = await requireOrgAuth();

  const db = createDb(process.env.DATABASE_URL!);

  // Guard: only include the UUID comparison when `id` is actually a valid UUID.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_RE.test(id);

  const [client] = await db
    .select()
    .from(clients)
    .where(
      and(
        isUuid
          ? or(eq(clients.id, id), eq(clients.slug, id))
          : eq(clients.slug, id),
        eq(clients.orgId, org.id)
      )
    )
    .limit(1);

  if (!client) {
    return <div>Client not found</div>;
  }

  await requireClientAccess({ dbUserId, clientId: client.id, orgId: org.id, role });

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
        {activeTab === "brand-kit" && (
          <BrandKitTabWrapper clientId={client.id} />
        )}
        {activeTab === "templates" && (
          <TemplatesTabWrapper clientId={client.id} clientName={client.name} />
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
        {activeTab === "team" && (
          <TeamTab client={client} />
        )}
      </div>
    </div>
  );
}

// ─── Tab Components ───────────────────────────────────────────────────────────

interface BrandVoiceData {
  tone?: string;
  audience?: string;
  pillars?: string[];
  package?: string;
  doSay?: string[];
  dontSay?: string[];
  examplePost?: string;
}

function OverviewTab({
  client,
  latestIntake,
  latestStrategy,
  recentContent,
}: {
  client: { id: string; name: string; status: string; industry: string | null; primaryLocale: string; primaryContactName: string | null; primaryContactEmail: string | null; slug: string; createdAt: Date; permissions: unknown };
  latestIntake: { isDraft: boolean } | undefined;
  latestStrategy: { status: string; versionInt: number } | undefined;
  recentContent: { id: string; status: string; platform: string | null; title: string; scheduledFor: Date | null; clientId: string }[];
}) {
  const brandVoice = ((client.permissions as Record<string, unknown>)?.brandVoice ?? null) as BrandVoiceData | null;
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
              {latestStrategy ? `v${latestStrategy.versionInt} - ${latestStrategy.status.replace(/_/g, " ")}` : "Not started yet."}
            </p>
            <Link
              href={`/dashboard/clients/${client.id}?tab=strategy`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              {latestStrategy ? "View Strategy" : "Start Strategy"}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Content</h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {recentContent.length} items created.
            </p>
            <Link
              href={`/dashboard/clients/${client.id}?tab=content`}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              View Content
            </Link>
          </CardContent>
        </Card>
      </div>
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Brand Intake Form</h2>
        </CardHeader>
        <CardContent>
          {!latestIntake ? (
            <p style={{ color: "var(--text-muted)" }}>No intake submitted yet.</p>
          ) : (
            <div className="space-y-2">
              <p style={{ color: "var(--text-muted)" }}>Status: {latestIntake.isDraft ? "Draft" : "Submitted"}</p>
            </div>
          )}
        </CardContent>
      </Card>
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Brand Strategy</h2>
        </CardHeader>
        <CardContent>
          {!latestStrategy ? (
            <p style={{ color: "var(--text-muted)" }}>No strategy generated yet.</p>
          ) : (
            <div className="space-y-2">
              <p style={{ color: "var(--text-muted)" }}>Version: {latestStrategy.versionInt}</p>
              <p style={{ color: "var(--text-muted)" }}>Status: {latestStrategy.status.replace(/_/g, " ")}</p>
            </div>
          )}
        </CardContent>
      </Card>
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
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Content Items</h2>
        </CardHeader>
        <CardContent>
          {recentContent.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No content created yet.</p>
          ) : (
            <div className="space-y-2">
              {recentContent.map((item) => (
                <div key={item.id} className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {item.title} - {item.platform} - {item.status}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PortalTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Client Portal Preview</h2>
        </CardHeader>
        <CardContent>
          <p style={{ color: "var(--text-muted)" }}>Portal preview coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandKitTabWrapper({ clientId }: { clientId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Brand Kit</h2>
        </CardHeader>
        <CardContent>
          <p style={{ color: "var(--text-muted)" }}>Brand kit management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TemplatesTabWrapper({ clientId, clientName }: { clientId: string; clientName: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Content Templates</h2>
        </CardHeader>
        <CardContent>
          <p style={{ color: "var(--text-muted)" }}>Templates management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountsTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Connected Accounts</h2>
        </CardHeader>
        <CardContent>
          <p style={{ color: "var(--text-muted)" }}>No connected accounts yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Analytics</h2>
        </CardHeader>
        <CardContent>
          <p style={{ color: "var(--text-muted)" }}>Analytics coming soon.</p>
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
  client: { id: string; name: string };
  latestIntake: { isDraft: boolean } | undefined;
  latestStrategy: { status: string; versionInt: number } | undefined;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Activity Log</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <p>Client created</p>
            {latestIntake && <p>Intake submitted</p>}
            {latestStrategy && <p>Strategy generated</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamTab({ client }: { client: { id: string; name: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Assigned Team</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Team members assigned to {client.name}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Team Assignment</h3>
        </CardHeader>
        <CardContent>
          <p style={{ color: "var(--text-muted)" }}>Team assignment feature coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
