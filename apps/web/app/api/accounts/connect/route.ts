import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, isAdminRole } from "@/lib/auth-org";
import { createDb, socialAccounts } from "@getpostflow/db";
import { eq } from "drizzle-orm";

/**
 * POST /api/accounts/connect
 *
 * Initiates OAuth flow for a platform. Returns oauthUrl.
 * Body: { platform: string; clientId: string }
 */
export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(auth.role)) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const body = (await req.json()) as { platform?: string; clientId?: string };
  const { platform, clientId } = body;

  if (!platform || !clientId) {
    return NextResponse.json({ error: "platform and clientId are required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/api/accounts/callback?platform=${encodeURIComponent(platform)}&clientId=${encodeURIComponent(clientId)}`;

  // Build per-platform OAuth URLs (stubs — redirect to platform dev console)
  const oauthUrls: Record<string, string> = {
    linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=r_liteprofile%20r_emailaddress%20w_member_social`,
    facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.META_APP_ID ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=pages_read_engagement%2Cpages_manage_posts%2Cinstagram_basic%2Cinstagram_content_publish`,
    instagram: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.META_APP_ID ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=instagram_basic%2Cinstagram_content_publish`,
    x: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=tweet.read%20tweet.write%20users.read%20offline.access`,
    tiktok: `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=user.info.basic%2Cvideo.publish`,
    youtube: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly`,
    reddit: `https://www.reddit.com/api/v1/authorize?response_type=code&client_id=${process.env.REDDIT_CLIENT_ID ?? ""}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read%20submit`,
  };

  const oauthUrl = oauthUrls[platform];
  if (!oauthUrl) {
    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
  }

  return NextResponse.json({ oauthUrl, callbackUrl });
}
