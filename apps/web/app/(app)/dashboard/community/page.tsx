import type { Metadata } from "next";
import CommunityManagementClient from "./_community-client";
import { requireOrgAuth, isAdminRole } from "@/lib/auth-org";
import { createDb, clients, clientAssignments } from "@getpostflow/db";
import { eq, and, inArray } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Community Management — GetPostFlow",
  description: "Moderation queue, saved reply templates, and follow-up reminders for managing client community engagement.",
};

interface Props {
  searchParams: Promise<{ client?: string }>;
}

export default async function CommunityPage({ searchParams }: Props) {
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
            <path d="M5 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm-3 8c0-2.76 2.24-5 5-5 .34 0 .67.03 1 .09V15H2zm7 2v-5a5 5 0 0 1 4 4.9V15h-4z" />
          </svg>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>What is Community Management?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Tools to <strong>manage conversations</strong> — hide spam comments, use saved reply templates, and set follow-up reminders.
              Unlike the Inbox (where you reply), Community is about <em>moderating and organizing</em> your clients&apos; communities.
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
            <path d="M5 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm-3 8c0-2.76 2.24-5 5-5 .34 0 .67.03 1 .09V15H2zm7 2v-5a5 5 0 0 1 4 4.9V15h-4z" fill="var(--brand-primary)" />
          </svg>
          <span style={{ color: "var(--brand-primary)", fontWeight: 500 }}>
            Showing moderation queue for selected client.
          </span>
          <a href="/dashboard/community" className="ml-auto text-xs underline" style={{ color: "var(--text-muted)" }}>
            Clear filter
          </a>
        </div>
      )}
      <CommunityManagementClient clientList={clientList} />
    </div>
  );
}
