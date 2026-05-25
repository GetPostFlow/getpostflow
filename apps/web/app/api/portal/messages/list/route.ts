import { NextRequest, NextResponse } from "next/server";
import { createDb, portalMessages, clients } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";

/**
 * GET /api/portal/messages/list?clientId=...
 *
 * Retrieves all portal messages for a specific client.
 * Internal team only.
 */
export async function GET(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  // Verify client belongs to org
  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Fetch all messages for this client
  const messages = await db
    .select()
    .from(portalMessages)
    .where(eq(portalMessages.clientId, clientId))
    .orderBy(portalMessages.createdAt);

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
