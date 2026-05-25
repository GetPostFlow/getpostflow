/**
 * Shared portal auth helper.
 * Validates the token and returns { tokenRecord, org, client } or null.
 */
import { createDb, portalTokens, orgs, clients } from "@getpostflow/db";
import { eq, and, gt } from "drizzle-orm";

export async function validatePortalToken(
  token: string,
  orgSlug: string,
  clientSlug: string
) {
  const db = createDb(process.env.DATABASE_URL!);

  const [tokenRecord] = await db
    .select()
    .from(portalTokens)
    .where(and(eq(portalTokens.tokenHash, token), gt(portalTokens.expiresAt, new Date())))
    .limit(1);

  if (!tokenRecord) return null;

  const [org] = await db.select().from(orgs).where(eq(orgs.clerkOrgId, orgSlug)).limit(1);
  const orgRecord = org ?? (await db.select().from(orgs).limit(1).then((r) => r[0]));
  if (!orgRecord) return null;

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.orgId, orgRecord.id), eq(clients.slug, clientSlug)))
    .limit(1);

  if (!client) return null;
  if (tokenRecord.clientId !== client.id) return null;

  return { tokenRecord, org: orgRecord, client };
}

export function InvalidToken({ reason }: { reason: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: "24px",
        }}
      >
        ✕
      </div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>
        Invalid or Expired Link
      </h2>
      <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "400px", margin: "0 auto 24px" }}>
        {reason}
      </p>
    </div>
  );
}

export function PortalNav({
  orgSlug,
  clientSlug,
  token,
  active,
}: {
  orgSlug: string;
  clientSlug: string;
  token: string;
  active: "dashboard" | "strategy" | "content" | "calendar" | "notifications" | "report" | "uploads" | "messages" | "billing" | "settings";
}) {
  const base = `/portal/${orgSlug}/${clientSlug}`;
  const q = `?token=${token}`;

  const items = [
    { id: "dashboard", label: "Dashboard", href: `${base}/dashboard${q}` },
    { id: "strategy", label: "Brand Strategy", href: `${base}/strategy${q}` },
    { id: "content", label: "Content Approval", href: `${base}/content${q}` },
    { id: "calendar", label: "Content Calendar", href: `${base}/calendar${q}` },
    { id: "uploads", label: "Upload Content", href: `${base}/uploads${q}` },
    { id: "messages", label: "Messages", href: `${base}/messages${q}` },
    { id: "notifications", label: "Notifications", href: `${base}/notifications${q}` },
    { id: "report", label: "Monthly Report", href: `${base}/report${q}` },
    { id: "billing", label: "Billing", href: `${base}/billing${q}` },
    { id: "settings", label: "Settings", href: `${base}/settings${q}` },
  ] as const;

  return (
    <nav
      style={{
        display: "flex",
        gap: "6px",
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        padding: "5px",
        marginBottom: "28px",
        overflowX: "auto",
        flexWrap: "wrap",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          style={{
            padding: "7px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            background: active === item.id ? "#2F5D62" : "transparent",
            color: active === item.id ? "#fff" : "#6b7280",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
            boxShadow: active === item.id ? "0 1px 3px rgba(47,93,98,0.25)" : "none",
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
