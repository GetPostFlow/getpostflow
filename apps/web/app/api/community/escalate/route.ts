import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";
import { createDb, auditLogs } from "@getpostflow/db";

export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    clientId: string;
    platform: string;
    messageId: string;
    senderHandle: string;
    messageText: string;
    reason: string;
  };

  if (!body.clientId || !body.platform || !body.messageId || !body.reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  await db.insert(auditLogs).values({
    orgId: auth.orgRow.id,
    clientId: body.clientId,
    action: "community_escalated",
    entityType: "community_message",
    entityId: body.messageId,
    payload: {
      platform: body.platform,
      senderHandle: body.senderHandle,
      reason: body.reason,
      messageText: body.messageText?.slice(0, 200),
    },
  });

  // TODO: Send email notification to hello@getpostflow.com for high-value leads
  // This is a placeholder for the actual email notification logic

  return NextResponse.json({ escalated: true });
}
