import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { StatTile } from "@getpostflow/ui/stat-tile";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { createDb } from "@getpostflow/db";
import { orgs, orgSubscriptions } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const [user, { orgId }] = await Promise.all([currentUser(), auth()]);
  const firstName = user?.firstName ?? "there";

  let isTrialing = false;

  if (orgId) {
    try {
      const db = createDb(process.env.DATABASE_URL!);
      const [org] = await db
        .select({ id: orgs.id })
        .from(orgs)
        .where(eq(orgs.clerkOrgId, orgId))
        .limit(1);

      if (org) {
        const [sub] = await db
          .select({ status: orgSubscriptions.status })
          .from(orgSubscriptions)
          .where(eq(orgSubscriptions.orgId, org.id))
          .limit(1);
        isTrialing = sub?.status === "trialing";
      }
    } catch {
      // DB unavailable — don't show the banner
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "var(--text-primary)" }}
        >
          Welcome back, {firstName}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Here's what's happening with your social accounts.
        </p>
      </div>

      {/* Trial notice — only shown when subscription is actively trialing */}
      {isTrialing && (
        <div
          className="flex items-center gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: "rgba(47,93,98,0.2)", backgroundColor: "rgba(47,93,98,0.05)" }}
        >
          <span className="text-lg">🎉</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--brand-primary)" }}>
              Your 14-day free trial has started
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              No card required. Upgrade anytime from{" "}
              <a href="/dashboard/billing" className="underline underline-offset-2" style={{ color: "var(--brand-primary)" }}>
                Billing
              </a>
              .
            </p>
          </div>
          <Badge variant="success" className="ml-auto">Starter trial</Badge>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Connected Accounts"
          value="0 / 4"
          change="Add your first account"
          changePositive={true}
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a3 3 0 1 0 0 6A3 3 0 0 0 8 1z" />
            </svg>
          }
        />
        <StatTile
          label="Posts This Month"
          value="0"
          change="Start creating content"
          changePositive={true}
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2h10a1 1 0 0 1 1 1v7l-4 4H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
            </svg>
          }
        />
        <StatTile
          label="Inbox Messages"
          value="0"
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z" />
            </svg>
          }
        />
        <StatTile
          label="Active Clients"
          value="0"
          change="Add your first client"
          changePositive={true}
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 4a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm-3.5 9c0-3.31 2.69-6 6-6s6 2.69 6 6H2z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Connect your first account
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Connect Instagram, Facebook, LinkedIn, X, TikTok, or YouTube to start posting.
            </p>
            <a
              href="/dashboard/accounts"
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Connect account
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Create your first post
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Use AI to generate multilingual content tailored to your brand voice.
            </p>
            <a
              href="/dashboard/content"
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ background: "var(--subtle)", color: "var(--brand-primary)" }}
            >
              Create content
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Invite your team
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Add team members and assign roles to collaborate on content and approvals.
            </p>
            <a
              href="/dashboard/settings/team"
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ background: "var(--subtle)", color: "var(--brand-primary)" }}
            >
              Invite member
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
