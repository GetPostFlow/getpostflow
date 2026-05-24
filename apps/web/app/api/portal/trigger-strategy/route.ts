import { NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import { portalTokens, clients, clientIntakeSubmissions, clientBrandStrategies, orgs, orgMemberships } from "@getpostflow/db";
import { eq, and, gt } from "drizzle-orm";

/**
 * POST /api/portal/trigger-strategy
 * Body: { clientId: string; token: string }
 *
 * - Validates token
 * - Loads latest intake
 * - Calls Manus AI (with fallback) to generate brand strategy
 * - Stores draft and transitions status to strategist_review
 * - Notifies internal team via email
 */
export async function POST(req: Request) {
  try {
    const { clientId, token } = await req.json();
    if (!clientId || !token) {
      return NextResponse.json({ error: "clientId and token are required" }, { status: 400 });
    }

    const db = createDb(process.env.DATABASE_URL!);

    // Verify token
    const [tokenRecord] = await db
      .select()
      .from(portalTokens)
      .where(and(eq(portalTokens.tokenHash, token), gt(portalTokens.expiresAt, new Date())))
      .limit(1);

    if (!tokenRecord || tokenRecord.clientId !== clientId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const [intake] = await db
      .select()
      .from(clientIntakeSubmissions)
      .where(eq(clientIntakeSubmissions.clientId, clientId))
      .orderBy(clientIntakeSubmissions.id)
      .limit(1);

    if (!intake) return NextResponse.json({ error: "No intake found" }, { status: 404 });

    // Generate strategy via Manus with fallback
    const { generateBrandStrategyViaManus } = await import("@getpostflow/ai");
    const draft = await generateBrandStrategyViaManus(intake.rawPayload as Record<string, unknown>);

    // Store draft
    await db.insert(clientBrandStrategies).values({
      clientId,
      versionInt: 1,
      status: "strategist_pending",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: {
        generatedAt: new Date().toISOString(),
        source: "manus",
      },
    });

    // Transition status
    await db
      .update(clients)
      .set({ status: "strategist_review" })
      .where(eq(clients.id, clientId));

    // Notify internal team
    const [org] = await db.select().from(orgs).where(eq(orgs.id, client.orgId)).limit(1);
    const teamMembers = await db
      .select({ userId: orgMemberships.userId })
      .from(orgMemberships)
      .where(eq(orgMemberships.orgId, client.orgId));

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@getpostflow.com";
    if (resendKey && resendKey.length > 10 && org) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const html = buildStrategyReadyInternalEmail({
        clientName: client.name,
        orgName: org.name,
        reviewUrl: `${appUrl}/dashboard/clients/${clientId}/strategy/review`,
      });

      // Send to all internal team members with emails (simplified: we don't store emails in memberships, so we log)
      // In production, resolve user emails from users table
      const { users } = await import("@getpostflow/db");
      const userIds = teamMembers.map((m) => m.userId);
      if (userIds.length > 0) {
        const userRows = await db.select({ email: users.email }).from(users).where(eq(users.id, userIds[0]));
        for (const u of userRows) {
          if (u.email) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: `GetPostFlow <${fromEmail}>`,
                to: [u.email],
                subject: `Strategy Ready for Internal Review — ${client.name}`,
                html,
              }),
            }).catch((err) => console.error("[trigger-strategy] Email failed:", err));
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[portal/trigger-strategy] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function buildStrategyReadyInternalEmail({
  clientName,
  orgName,
  reviewUrl,
}: {
  clientName: string;
  orgName: string;
  reviewUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#f8f9fa;color:#1a1a1a">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2F5D62 0%,#52b788 100%);padding:28px 32px">
      <p style="color:white;font-size:20px;font-weight:700;margin:0">GetPostFlow</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">Strategy Ready for Review</h1>
      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px">
        The AI-generated strategy for <strong>${clientName}</strong> (${orgName}) is ready for internal review.
        Please review, refine, and approve before sending to the client.
      </p>
      <a href="${reviewUrl}" style="display:inline-block;background:#2F5D62;color:white;text-decoration:none;border-radius:12px;padding:14px 28px;font-size:14px;font-weight:600;margin-bottom:20px">
        Review Strategy →
      </a>
    </div>
  </div>
</body>
</html>`;
}
