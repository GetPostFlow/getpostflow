import { notFound, redirect } from "next/navigation";
import { requireOrgAuth } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import { clients } from "@getpostflow/db";
import { eq, and, or } from "drizzle-orm";
import Link from "next/link";
import NewContentForm from "./_new-content-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewContentPage({ params }: Props) {
  const { id } = await params;
  const { orgRow: org } = await requireOrgAuth();

  const db = createDb(process.env.DATABASE_URL!);

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_RE.test(id);

  const [client] = await db
    .select({ id: clients.id, name: clients.name })
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
  if (!client) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/clients/${id}/content`}
          className="flex items-center gap-1 text-sm transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Content Calendar
        </Link>
        <span style={{ color: "var(--border-soft)" }}>/</span>
        <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          New Content
        </h1>
      </div>

      <NewContentForm clientId={client.id} clientName={client.name} />
    </div>
  );
}
