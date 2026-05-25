import { NextRequest, NextResponse } from "next/server";
import { createDb, socialAccounts } from "@getpostflow/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/accounts/callback
 *
 * OAuth callback handler for all platforms.
 * Stores a stub social account row with the authorization code as a placeholder token.
 *
 * Query params:
 *   platform  — required
 *   clientId  — required
 *   code      — authorization code from platform
 *   state     — optional CSRF state
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const clientId = searchParams.get("clientId");
  const code = searchParams.get("code");

  if (!platform || !clientId) {
    return NextResponse.json({ error: "Missing platform or clientId" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  // In a full implementation, exchange code for tokens here.
  // For Phase 7 stub: store the code as a placeholder token and mark active.
  const accountName = `${platform}_account_${Date.now()}`;

  const [account] = await db
    .insert(socialAccounts)
    .values({
      orgId: "00000000-0000-0000-0000-000000000000", // will be resolved via client lookup in production
      clientId,
      platform,
      accountName,
      externalAccountId: code ?? `stub_${Date.now()}`,
      encryptedTokens: code ? { code } : {},
      isActive: true,
      lastSyncedAt: new Date(),
    })
    .returning();

  // Redirect back to accounts page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/dashboard/accounts?connected=${platform}`);
}
