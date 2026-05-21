import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import NewContentForm from "./_new-content-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewContentPage({ params }: Props) {
  const { id } = await params;
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);
  if (!org) notFound();

  const [client] = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.orgId, org.id)))
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
