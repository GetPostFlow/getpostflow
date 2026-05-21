import { redirect } from "next/navigation";
import DashboardShell from "./shell";

// Stub/preview mode guard: if no real Clerk key is configured, redirect to sign-in
// rather than calling auth() which would throw with a placeholder key.
const STUB_CLERK_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const stubMode =
  !clerkKey ||
  clerkKey === STUB_CLERK_KEY ||
  clerkKey.length <= 30 ||
  (!clerkKey.startsWith("pk_live_") && !clerkKey.startsWith("pk_test_"));

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (stubMode) {
    redirect("/sign-in");
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check if the user has an org membership; if not, show the no-org screen
  // instead of letting them see a broken dashboard.
  try {
    const { createDb, users, orgMemberships } = await import("@getpostflow/db");
    const { eq } = await import("drizzle-orm");
    const db = createDb();

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .limit(1);

    if (user) {
      const [membership] = await db
        .select({ id: orgMemberships.id })
        .from(orgMemberships)
        .where(eq(orgMemberships.userId, user.id))
        .limit(1);

      if (!membership) {
        // User is in Clerk but has no org — show setup page instead of crashing
        return <NoOrgScreen />;
      }
    }
  } catch {
    // DB check failed — still render the shell; page-level guards will catch missing data
  }

  return <DashboardShell>{children}</DashboardShell>;
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

