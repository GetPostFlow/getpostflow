import { NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import { portalTokens, clients, clientIntakeSubmissions, clientBrandStrategies, orgs } from "@getpostflow/db";
import { eq, and, gt } from "drizzle-orm";

/**
 * POST /api/portal/intake
 * Body: { clientId: string; token: string; payload: object }
 *
 * - Validates portal token
 * - Saves intake submission
 * - Transitions client status to ai_drafting
 * - Triggers AI strategy generation (async via Manus / fallback)
 * - Sends confirmation email
 */
export async function POST(req: Request) {
  try {
    const { clientId, token, payload } = await req.json();
    if (!clientId || !token || !payload) {
      return NextResponse.json({ error: "clientId, token, and payload are required" }, { status: 400 });
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

    // Save intake submission
    await db.insert(clientIntakeSubmissions).values({
      clientId,
      rawPayload: payload,
      isDraft: false,
      submittedAt: new Date(),
    });

    // Transition client status
    await db
      .update(clients)
      .set({ status: "ai_drafting" })
      .where(eq(clients.id, clientId));

    // Trigger AI strategy generation (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    fetch(`${appUrl}/api/portal/trigger-strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, token }),
    }).catch((err) => console.error("[portal/intake] Strategy trigger failed:", err));

    // Send intake confirmation email
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
    if (client?.primaryContactEmail) {
      const [org] = await db.select().from(orgs).where(eq(orgs.id, client.orgId)).limit(1);
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@getpostflow.com";
      if (resendKey && resendKey.length > 10) {
        const html = buildIntakeConfirmationEmail({ clientName: client.name, orgName: org?.name ?? "GetPostFlow" });
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `GetPostFlow <${fromEmail}>`,
            to: [client.primaryContactEmail],
            subject: `Intake Received — We're Crafting Your Strategy`,
            html,
          }),
        }).catch((err) => console.error("[portal/intake] Confirmation email failed:", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[portal/intake] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function buildIntakeConfirmationEmail({ clientName, orgName }: { clientName: string; orgName: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#f8f9fa;color:#1a1a1a">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2F5D62 0%,#52b788 100%);padding:28px 32px">
      <p style="color:white;font-size:20px;font-weight:700;margin:0">GetPostFlow</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">Intake Received</h1>
      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px">
        Hi ${clientName},<br/><br/>
        Thank you for completing your intake form. Our team at ${orgName} is now reviewing your information and crafting your brand strategy.
        You will receive another email once your strategy is ready for review.
      </p>
    </div>
  </div>
</body>
</html>`;
}
