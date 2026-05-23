import { redirect } from "next/navigation";
import DashboardShell from "./shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth, clerkClient } = await import("@clerk/nextjs/server");
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  let clientList: { id: string; name: string }[] = [];

  // Resolve the org for this user and fetch the client list for the sidebar.
  try {
    const { createDb, users, orgMemberships, clients, orgs } = await import("@getpostflow/db");
    const { eq, inArray } = await import("drizzle-orm");
    const db = createDb();

    let resolvedOrgId: string | null = null;

    // 1. Happy path: Clerk session has an active orgId
    if (orgId) {
      const [org] = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.clerkOrgId, orgId)).limit(1);
      if (org) resolvedOrgId = org.id;
    }

    // 2. Fallback: Clerk API for user's org memberships
    if (!resolvedOrgId) {
      try {
        const clerk = await clerkClient();
        const clerkMemberships = await clerk.users.getOrganizationMembershipList({ userId, limit: 10 });
        for (const m of clerkMemberships.data) {
          const mOrgId = m.organization.id;
          const [org] = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.clerkOrgId, mOrgId)).limit(1);
          if (org) { resolvedOrgId = org.id; break; }
        }
      } catch {
        // Clerk API unavailable
      }
    }

    // 3. Final fallback: DB memberships, prefer real Clerk orgs
    if (!resolvedOrgId) {
      const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, userId)).limit(1);
      if (user) {
        const memberships = await db.select({ orgId: orgMemberships.orgId }).from(orgMemberships).where(eq(orgMemberships.userId, user.id));
        if (memberships.length === 0) {
          return <NoOrgScreen />;
        }
        const orgIds = memberships.map((m) => m.orgId);
        const orgRows = await db.select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId }).from(orgs).where(inArray(orgs.id, orgIds));
        const preferred = orgRows.find((o) => o.clerkOrgId?.startsWith("org_")) ?? orgRows[0];
        if (preferred) resolvedOrgId = preferred.id;
      }
    }

    if (resolvedOrgId) {
      clientList = await db
        .select({ id: clients.id, name: clients.name })
        .from(clients)
        .where(eq(clients.orgId, resolvedOrgId));
    }
  } catch {
    // DB check failed — still render the shell; page-level guards will catch missing data
  }

  return <DashboardShell clients={clientList}>{children}</DashboardShell>;
}

function NoOrgScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "var(--canvas, #f9fafb)",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "var(--surface, #fff)",
          borderRadius: 20,
          border: "1px solid var(--border-soft, #e5e7eb)",
          padding: "40px 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "rgba(47,93,98,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F5D62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary, #111827)",
            marginBottom: 10,
          }}
        >
          Account setup pending
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary, #6b7280)",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Your account was created but hasn&apos;t been linked to an organisation yet.
          This can happen when the Clerk webhook is delayed or hasn&apos;t fired.
          <br /><br />
          Sign out and back in to retry, or contact support if the issue persists.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/sign-in"
            style={{
              display: "inline-block",
              background: "#2F5D62",
              color: "#fff",
              borderRadius: 12,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in again
          </a>
          <a
            href="mailto:support@getpostflow.com"
            style={{
              display: "inline-block",
              background: "var(--subtle, #f3f4f6)",
              color: "var(--text-primary, #111827)",
              borderRadius: 12,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}

