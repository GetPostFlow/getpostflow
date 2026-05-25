/**
 * POST /api/accounts/connect
 *
 * Initiates an OAuth flow for a given platform.
 * Returns a redirect URL that the client should navigate to.
 *
 * Body: { platform: string; clientId: string }
 *
 * For Ayrshare-backed connectors (default in v1):
 *   - Returns the Ayrshare OAuth page URL for the requested platform.
 *   - Ayrshare handles the OAuth callback and token storage.
 *   - On completion, Ayrshare calls our webhook.
 *
 * For direct connectors (once approved):
 *   - Returns the platform's native OAuth URL.
 *   - Callback handled by /api/oauth/[platform]/callback.
 */

import { NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess, isAdminRole } from "@/lib/auth-org";

const AYRSHARE_OAUTH_BASE = "https://app.ayrshare.com/auth";

const PLATFORM_OAUTH_PATHS: Record<string, string> = {
  facebook: "/facebook",
  instagram: "/instagram",
  tiktok: "/tiktok",
  youtube: "/google",
  "youtube-shorts": "/google",
  linkedin: "/linkedin",
  pinterest: "/pinterest",
  reddit: "/reddit",
  discord: "/discord",
};

export async function POST(req: Request) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins can initiate OAuth connections
  if (!isAdminRole(auth.role)) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  let body: { platform?: string; clientId?: string };
  try {
    body = (await req.json()) as { platform?: string; clientId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { platform, clientId } = body;

  if (!platform || !clientId) {
    return NextResponse.json(
      { error: "platform and clientId are required" },
      { status: 400 }
    );
  }

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  // Reddit: only monitoring supported — no OAuth needed for posting via Ayrshare
  if (platform === "reddit") {
    return NextResponse.json(
      {
        error:
          "Reddit account connection provides monitoring only. Automated posting is not supported.",
      },
      { status: 400 }
    );
  }

  const path = PLATFORM_OAUTH_PATHS[platform];
  if (!path) {
    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/api/oauth/${platform}/callback?clientId=${clientId}`;
  const oauthUrl = `${AYRSHARE_OAUTH_BASE}${path}?redirectUrl=${encodeURIComponent(callbackUrl)}`;

  return NextResponse.json({ oauthUrl });
}

/**
 * GET /api/accounts/connect
 *
 * List connected social accounts for a client.
 * Query: clientId
 */
export async function GET(req: Request) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  try {
    const { createDb, socialAccounts } = await import("@getpostflow/db");
    const { eq } = await import("drizzle-orm");
    const db = createDb();

    const accounts = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.clientId, clientId));

    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("[accounts/connect] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
