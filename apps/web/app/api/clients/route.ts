import { NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess, isAdminRole } from "@/lib/auth-org";
import { createDb, clients, clientAssignments } from "@getpostflow/db";
import { eq, and, inArray } from "drizzle-orm";

export async function GET() {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { dbUserId, role, orgRow: org } = auth;

  const db = createDb(process.env.DATABASE_URL!);

  if (isAdminRole(role)) {
    const rows = await db
      .select({
        id: clients.id,
        slug: clients.slug,
        name: clients.name,
        status: clients.status,
        industry: clients.industry,
        primaryContactName: clients.primaryContactName,
        primaryContactEmail: clients.primaryContactEmail,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .where(eq(clients.orgId, org.id))
      .orderBy(clients.createdAt);
    return NextResponse.json({ clients: rows });
  }

  // Employee: only assigned clients
  const assignments = await db
    .select({ clientId: clientAssignments.clientId })
    .from(clientAssignments)
    .where(
      and(
        eq(clientAssignments.orgId, org.id),
        eq(clientAssignments.userId, dbUserId)
      )
    );

  const assignedIds = assignments.map((a) => a.clientId);
  if (assignedIds.length === 0) {
    return NextResponse.json({ clients: [] });
  }

  const rows = await db
    .select({
      id: clients.id,
      slug: clients.slug,
      name: clients.name,
      status: clients.status,
      industry: clients.industry,
      primaryContactName: clients.primaryContactName,
      primaryContactEmail: clients.primaryContactEmail,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(and(eq(clients.orgId, org.id), inArray(clients.id, assignedIds)))
    .orderBy(clients.createdAt);

  return NextResponse.json({ clients: rows });
}
