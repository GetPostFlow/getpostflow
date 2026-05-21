import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createDb } from "@getpostflow/db";
import { clients, orgs, portalTokens } from "@getpostflow/db";
import { eq, ilike } from "drizzle-orm";
import crypto from "crypto";

const PORTAL_SIGNING_SECRET = process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me";

/**
 * GET /api/portal/test-token?clientId=<UUID>
 *   OR
 * GET /api/portal/test-token?clientName=acme+bakery
 *
 * Returns an HTML page with a clickable magic link for the given client.
 * Useful for dev/staging to generate portal test links quickly.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const clientId = searchParams.get("clientId");
    const clientName = searchParams.get("clientName");

    if (!clientId && !clientName) {
      return new NextResponse(
        buildErrorHtml("Provide <code>clientId</code> or <code>clientName</code> query param.<br/>Example: <code>/api/portal/test-token?clientName=acme+bakery</code>"),
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const db = createDb(process.env.DATABASE_URL!);

    // Resolve client
    const [client] = await db
      .select({ id: clients.id, slug: clients.slug, orgId: clients.orgId, name: clients.name, email: clients.primaryContactEmail })
      .from(clients)
      .where(
        clientId
          ? eq(clients.id, clientId)
          : ilike(clients.name, `%${clientName}%`)
      )
      .limit(1);

    if (!client) {
      return new NextResponse(
        buildErrorHtml("Client not found."),
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Resolve org
    const [org] = await db
      .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.id, client.orgId))
      .limit(1);

    if (!org) {
      return new NextResponse(
        buildErrorHtml("Org not found for this client."),
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const email = client.email ?? "demo@getpostflow.com";
    const raw = `${client.id}:${email}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
    const tokenHash = crypto
      .createHmac("sha256", PORTAL_SIGNING_SECRET)
      .update(raw)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    await db.insert(portalTokens).values({
      clientId: client.id,
      tokenHash,
      email,
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getpostflow.vercel.app";
    const orgSlug = org.clerkOrgId ?? org.id;
    const magicLink = `${appUrl}/portal/${orgSlug}/${client.slug}/strategy?token=${tokenHash}`;

    const html = buildMagicLinkHtml({
      magicLink,
      clientName: client.name,
      orgName: org.name,
      email,
      expiresAt: expiresAt.toISOString(),
    });

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[portal/test-token] Error:", err);
    return new NextResponse(
      buildErrorHtml(err instanceof Error ? err.message : "Internal server error"),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// ─── HTML builders ─────────────────────────────────────────────────────────────

function buildMagicLinkHtml(opts: {
  magicLink: string;
  clientName: string;
  orgName: string;
  email: string;
  expiresAt: string;
}) {
  const { magicLink, clientName, orgName, email, expiresAt } = opts;
  const expiresFormatted = new Date(expiresAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="3;url=${magicLink}" />
  <title>Client Portal Magic Link</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f0f10;
      color: #e5e5e5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1a1a1c;
      border: 1px solid #2e2e33;
      border-radius: 16px;
      padding: 40px;
      max-width: 540px;
      width: 100%;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1e3a2b;
      color: #4ade80;
      border: 1px solid #166534;
      border-radius: 99px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #f5f5f5;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 13px;
      color: #888;
      margin-bottom: 28px;
    }
    .meta {
      background: #111113;
      border: 1px solid #2e2e33;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 24px;
      font-size: 12px;
      color: #aaa;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }
    .meta strong { color: #ddd; display: block; }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 20px;
      background: #5b21b6;
      color: #fff;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      border-radius: 12px;
      transition: background 0.15s;
      margin-bottom: 12px;
    }
    .btn:hover { background: #6d28d9; }
    .hint {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .redirect-notice {
      background: #1c2a1e;
      border: 1px solid #254225;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 12px;
      color: #86efac;
      text-align: center;
      margin-top: 20px;
    }
    .link-box {
      margin-top: 20px;
      background: #111113;
      border: 1px solid #2e2e33;
      border-radius: 10px;
      padding: 12px 16px;
      word-break: break-all;
      font-size: 11px;
      color: #888;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
      Dev / Test
    </div>
    <h1>Client Portal Magic Link</h1>
    <p class="subtitle">A one-time access link has been generated for this client. Valid for 72 hours.</p>

    <div class="meta">
      <div><strong>Client</strong>${clientName}</div>
      <div><strong>Org</strong>${orgName}</div>
      <div><strong>Email</strong>${email}</div>
      <div><strong>Expires</strong>${expiresFormatted}</div>
    </div>

    <a class="btn" href="${magicLink}" target="_blank" rel="noopener noreferrer">
      Open Client Portal &rarr;
    </a>
    <p class="hint">Opens in a new tab &mdash; or auto-redirects in 3 seconds</p>

    <div class="redirect-notice">
      Auto-redirecting in 3 seconds&hellip;
    </div>

    <div class="link-box">${magicLink}</div>
  </div>
</body>
</html>`;
}

function buildErrorHtml(message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portal Test Token — Error</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f0f10; color: #e5e5e5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #1a1a1c; border: 1px solid #3b1c1c; border-radius: 16px; padding: 36px; max-width: 480px; width: 100%; }
    h1 { font-size: 18px; color: #f87171; margin-bottom: 12px; }
    p { font-size: 13px; color: #aaa; line-height: 1.6; }
    code { background: #111; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #f87171; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Error</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
