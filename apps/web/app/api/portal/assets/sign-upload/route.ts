/**
 * POST /api/portal/assets/sign-upload
 *
 * Portal-authed (token-based, no Clerk).
 * Body: { token, orgSlug, clientSlug, filename, contentType, source }
 * Returns: { url, key, expiresIn, devMode? }
 */
import { NextRequest, NextResponse } from "next/server";
import { validatePortalToken } from "@/app/portal/_portal-helpers";
import { buildStorageKey, getUploadSignedUrl, R2_CONFIGURED } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    token: string;
    orgSlug: string;
    clientSlug: string;
    filename: string;
    contentType: string;
    source?: string;
  };

  if (!body.token || !body.orgSlug || !body.clientSlug || !body.filename || !body.contentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validated = await validatePortalToken(body.token, body.orgSlug, body.clientSlug);
  if (!validated) {
    return NextResponse.json({ error: "Invalid or expired portal token" }, { status: 401 });
  }

  const { org } = validated;
  const key = buildStorageKey(org.id, body.filename);

  if (!R2_CONFIGURED) {
    return NextResponse.json({
      url: `http://localhost:3000/api/upload/dev-stub?key=${encodeURIComponent(key)}`,
      key,
      expiresIn: 3600,
      devMode: true,
    });
  }

  const result = await getUploadSignedUrl({ key, contentType: body.contentType });
  return NextResponse.json(result);
}
