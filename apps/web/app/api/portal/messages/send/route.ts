import { NextRequest, NextResponse } from "next/server";
import { createDb, portalMessages, clients, users, orgMemberships } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";

/**
 * POST /api/portal/messages/send
 *
 * Body: { clientId: string; body: string }
 *
 * Internal team sends a message to a client via the portal.
 */
export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dbUserId, orgRow: org } = auth;
  const { clientId, body } = (await req.json()) as {
    clientId: string;
    body: string;
  };

  if (!clientId || !body?.trim()) {
    return NextResponse.json({ error: "clientId and body are required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  // Verify client belongs to org
  const [client] = await db
    .select({ id: clients.id, primaryContactEmail: clients.primaryContactEmail })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.orgId, org.id)))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Get sender name
  const [user] = await db
    .select({ fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, dbUserId))
    .limit(1);

  const senderName = user?.fullName || user?.email || "Team";

  // Insert message
  const [msg] = await db
    .insert(portalMessages)
    .values({
      clientId: client.id,
      senderType: "team",
      senderName,
      body: body.trim(),
    })
    .returning();

  // TODO: Send email notification to client if configured
  // if (client.primaryContactEmail) {
  //   await sendPortalMessageNotificationEmail({
  //     to: client.primaryContactEmail,
  //     senderName,
  //     message: body.trim(),
  //   });
  // }

  return NextResponse.json({
    message: {
      id: msg!.id,
      senderType: msg!.senderType,
      senderName: msg!.senderName,
      body: msg!.body,
      createdAt: msg!.createdAt.toISOString(),
    },
  });
}
