import type { Metadata } from "next";
import InboxClient from "./_inbox-client";
import { requireOrgAuth, isAdminRole } from "@/lib/auth-org";
import { createDb, clients, clientAssignments } from "@getpostflow/db";
import { eq, and, inArray } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Inbox — GetPostFlow",
  description: "All incoming messages, comments, and DMs across your clients' connected social accounts.",
};

interface Props {
  searchParams: Promise<{ client?: string }>;
}

export default async function InboxPage({ searchParams }: Props) {
  const { client } = await searchParams;
  const { dbUserId, orgRow: org, role } = await requireOrgAuth();

  const db = createDb(process.env.DATABASE_URL!);

  let clientList: { id: string; name: string }[] = [];
  if (isAdminRole(role)) {
    clientList = await db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.orgId, org.id));
  } else {
    const assignments = await db
      .select({ clientId: clientAssignments.clientId })
      .from(clientAssignments)
      .where(and(eq(clientAssignments.orgId, org.id), eq(clientAssignments.userId, dbUserId)));
    const assignedIds = assignments.map((a) => a.clientId);
    if (assignedIds.length > 0) {
      clientList = await db
        .select({ id: clients.id, name: clients.name })
        .from(clients)
        .where(and(eq(clients.orgId, org.id), inArray(clients.id, assignedIds)));
    }
  }

  return (
    <div>
      {/* Definition banner */}
      <div
        className="mb-4 rounded-2xl border px-4 py-3"
        style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
      >
        <div className="flex items-start gap-3">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 flex-shrink-0" style={{ color: "var(--brand-primary)" }}>
            <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9.5l-1.5 2-1.5-2H3a1 1 0 0 1-1-1V3zm1 0v7h3.17l.83 1.1.83-1.1H13V3H3z" />
          </svg>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>What is the Inbox?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              All incoming <strong>messages, comments, and DMs</strong> from ALL your clients&apos; connected social accounts — in one unified feed.
              You reply here on behalf of your clients.
            </p>
          </div>
        </div>
      </div>

      {client && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs"
          style={{ background: "rgba(47,93,98,0.07)", border: "1px solid rgba(47,93,98,0.15)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1a5.5 5.5 0 0 0-5.5 5.5v2L1 10v1h14v-1l-1.5-1.5v-2A5.5 5.5 0 0 0 8 1zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" fill="var(--brand-primary)" />
          </svg>
          <span style={{ color: "var(--brand-primary)", fontWeight: 500 }}>
            Viewing conversations for selected client.
          </span>
          <a href="/dashboard/inbox" className="ml-auto text-xs underline" style={{ color: "var(--text-muted)" }}>
            Clear filter
          </a>
        </div>
      )}
      <InboxClient clientList={clientList} />
    </div>
  );
}
