import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess, isAdminRole } from "@/lib/auth-org";
import { createDb, clientAssignments, users } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clientId } = await params;
  const { dbUserId, orgRow: org, role } = auth;

  await requireClientAccess({ dbUserId, clientId, orgId: org.id, role });

  const db = createDb(process.env.DATABASE_URL!);

  const rows = await db
    .select({
      id: clientAssignments.id,
      userId: clientAssignments.userId,
      role: clientAssignments.role,
      createdAt: clientAssignments.createdAt,
    })
    .from(clientAssignments)
    .where(and(eq(clientAssignments.clientId, clientId), eq(clientAssignments.orgId, org.id)));

  const userIds = rows.map((r) => r.userId);
  const userRows = userIds.length > 0
    ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, userIds[0]!))
    : [];
  // Note: drizzle eq with array not ideal; fetch all and map
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const assignments = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    role: r.role,
    userName: userMap.get(r.userId)?.name ?? undefined,
    userEmail: userMap.get(r.userId)?.email ?? undefined,
  }));

  return NextResponse.json({ assignments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clientId } = await params;
  const { dbUserId, orgRow: org, role } = auth;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const body = (await req.json()) as { userId?: string; role?: string };
  if (!body.userId || !body.role) {
    return NextResponse.json({ error: "userId and role required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  // Upsert assignment
  const existing = await db
    .select()
    .from(clientAssignments)
    .where(
      and(
        eq(clientAssignments.clientId, clientId),
        eq(clientAssignments.userId, body.userId),
        eq(clientAssignments.orgId, org.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(clientAssignments)
      .set({ role: body.role as "strategist" | "content_manager" | "support" })
      .where(eq(clientAssignments.id, existing[0]!.id));
  } else {
    await db.insert(clientAssignments).values({
      orgId: org.id,
      clientId,
      userId: body.userId,
      role: body.role as "strategist" | "content_manager" | "support",
    });
  }

  const rows = await db
    .select({
      id: clientAssignments.id,
      userId: clientAssignments.userId,
      role: clientAssignments.role,
      createdAt: clientAssignments.createdAt,
    })
    .from(clientAssignments)
    .where(and(eq(clientAssignments.clientId, clientId), eq(clientAssignments.orgId, org.id)));

  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const assignments = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    role: r.role,
    userName: userMap.get(r.userId)?.name ?? undefined,
    userEmail: userMap.get(r.userId)?.email ?? undefined,
  }));

  return NextResponse.json({ assignments });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clientId } = await params;
  const { orgRow: org, role } = auth;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  await db
    .delete(clientAssignments)
    .where(
      and(
        eq(clientAssignments.clientId, clientId),
        eq(clientAssignments.userId, userId),
        eq(clientAssignments.orgId, org.id)
      )
    );

  const rows = await db
    .select({
      id: clientAssignments.id,
      userId: clientAssignments.userId,
      role: clientAssignments.role,
      createdAt: clientAssignments.createdAt,
    })
    .from(clientAssignments)
    .where(and(eq(clientAssignments.clientId, clientId), eq(clientAssignments.orgId, org.id)));

  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const assignments = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    role: r.role,
    userName: userMap.get(r.userId)?.name ?? undefined,
    userEmail: userMap.get(r.userId)?.email ?? undefined,
  }));

  return NextResponse.json({ assignments });
}
