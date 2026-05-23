/**
 * POST /api/assets/sign-upload
 *
 * Clerk-authed endpoint (org users only).
 * Body: { clientId, filename, contentType, source }
 * Returns: { url, key, expiresIn, devMode? }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuth } from "@/lib/auth-org";
import { buildStorageKey, getUploadSignedUrl, R2_CONFIGURED } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { orgRow: org } = await requireOrgAuth();

    const body = (await req.json()) as {
      clientId?: string;
      filename: string;
      contentType: string;
      source?: string;
    };

    if (!body.filename || !body.contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    const key = buildStorageKey(org.id, body.filename);

    if (!R2_CONFIGURED) {
      return NextResponse.json({
        url: `http://localhost:3000/api/upload/dev-stub?key=${encodeURIComponent(key)}`,
        key,
        expiresIn: 3600,
        devMode: true,
      });
    }

    const result = await getUploadSignedUrl({
      key,
      contentType: body.contentType,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unauthorized") || msg.includes("redirect")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
