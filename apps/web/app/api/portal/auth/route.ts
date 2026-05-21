import { NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import { portalTokens, clients, orgs } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const PORTAL_SIGNING_SECRET = process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me";
const TOKEN_TTL_HOURS = 72;

function signToken(payload: string): string {
  return crypto
    .createHmac("sha256", PORTAL_SIGNING_SECRET)
    .update(payload)
    .digest("hex");
}

/**
 * POST /api/portal/auth
 * Body: { clientId: string; email: string }
 *
 * - Creates a signed portal token for the given client + email
 * - Sends a magic link email via Resend (or stubs it in dev)
 * - Returns { sent: true } or { stubUrl: string } in dev
 */
export async function POST(req: Request) {
  try {
    const { clientId, email } = await req.json();

    if (!clientId || !email) {
      return NextResponse.json({ error: "clientId and email are required" }, { status: 400 });
    }

    const db = createDb(process.env.DATABASE_URL!);

    const [client] = await db
      .select({ id: clients.id, slug: clients.slug, orgId: clients.orgId, name: clients.name })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const [org] = await db
      .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.id, client.orgId))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    // Generate token
    const raw = `${clientId}:${email}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
    const tokenHash = signToken(raw);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await db.insert(portalTokens).values({
      clientId: client.id,
      tokenHash,
      email,
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const orgSlug = org.clerkOrgId ?? org.id;
    const magicLink = `${appUrl}/portal/${orgSlug}/${client.slug}/strategy?token=${tokenHash}`;

    // ── Send email ──────────────────────────────────────────────────────────

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "notifications@getpostflow.com";

    if (resendKey && resendKey.length > 10) {
      // Real Resend send
      const emailBody = buildClientStrategyEmail({
        clientName: client.name,
        orgName: org.name,
        magicLink,
        expiresAt,
      });

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `Your Brand Strategy is Ready for Review — ${client.name}`,
          html: emailBody,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error("[portal/auth] Resend error:", err);
        // Don't fail — return stubUrl as fallback so dev can proceed
        return NextResponse.json({ sent: false, stubUrl: magicLink, resendError: err });
      }

      return NextResponse.json({ sent: true });
    }

    // ── Stub mode (no Resend key) ───────────────────────────────────────────
    console.log(`[portal/auth] Stub mode — magic link for ${email}:\n${magicLink}`);
    return NextResponse.json({ sent: false, stubUrl: magicLink });
  } catch (err) {
    console.error("[portal/auth] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Email template ────────────────────────────────────────────────────────────

function buildClientStrategyEmail({
  clientName,
  orgName,
  magicLink,
  expiresAt,
}: {
  clientName: string;
  orgName: string;
  magicLink: string;
  expiresAt: Date;
}): string {
  const expiresFormatted = expiresAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#f8f9fa;color:#1a1a1a">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:28px 32px">
      <p style="color:white;font-size:20px;font-weight:700;margin:0">GetPostFlow</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">Brand Strategy Portal</p>
    </div>
    <!-- Body -->
    <div style="padding:32px">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">Your Brand Strategy is Ready</h1>
      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px">
        <strong>${orgName}</strong> has completed the brand strategy draft for <strong>${clientName}</strong>.
        Please review it and either approve or request changes.
      </p>
      <a
        href="${magicLink}"
        style="display:inline-block;background:#6366f1;color:white;text-decoration:none;border-radius:12px;padding:14px 28px;font-size:14px;font-weight:600;margin-bottom:20px"
      >
        Review Strategy →
      </a>
      <p style="font-size:12px;color:#9ca3af;margin:0">
        This link is valid until <strong>${expiresFormatted}</strong>.<br>
        If you did not expect this email, you can safely ignore it.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="font-size:11px;color:#9ca3af;margin:0">
        Having trouble? Copy and paste this URL into your browser:<br>
        <span style="word-break:break-all">${magicLink}</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
