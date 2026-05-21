import { NextRequest, NextResponse } from "next/server";
import { createDb, contentItems, portalTokens } from "@getpostflow/db";
import { eq, and, gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { contentItemId, decision, feedback, token } = await req.json();

    if (!contentItemId || !decision || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const db = createDb(process.env.DATABASE_URL!);

    // Validate token
    const [tokenRecord] = await db
      .select()
      .from(portalTokens)
      .where(and(eq(portalTokens.tokenHash, token), gt(portalTokens.expiresAt, new Date())))
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Verify content item belongs to this client
    const [item] = await db
      .select()
      .from(contentItems)
      .where(and(eq(contentItems.id, contentItemId), eq(contentItems.clientId, tokenRecord.clientId)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    // Update status
    const newStatus = decision === "approved" ? "approved" : "draft";
    await db
      .update(contentItems)
      .set({
        status: newStatus,
        historyTags: [...((item.historyTags as string[]) ?? []), decision === "approved" ? "client-approved" : "client-revision-requested"],
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentItemId));

    return NextResponse.json({ ok: true, newStatus });
  } catch (err) {
    console.error("[portal/content-decision]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
