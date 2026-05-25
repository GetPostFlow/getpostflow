import { NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";
import { createDb, orgMemberships, users } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgRow: org } = auth;

  const db = createDb(process.env.DATABASE_URL!);

  const memberships = await db
    .select({
      userId: orgMemberships.userId,
      role: orgMemberships.role,
    })
    .from(orgMemberships)
    .where(eq(orgMemberships.orgId, org.id));

  const userIds = memberships.map((m) => m.userId);

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const members = memberships.map((m) => ({
    id: m.userId,
    name: userMap.get(m.userId)?.name ?? undefined,
    email: userMap.get(m.userId)?.email ?? undefined,
    role: m.role,
  }));

  return NextResponse.json({ members });
}
