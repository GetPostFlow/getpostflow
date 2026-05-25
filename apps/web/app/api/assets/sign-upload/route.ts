/**
 * POST /api/assets/sign-upload
 *
 * Clerk-authed endpoint (org users only).
 * Body: { clientId, filename, contentType, source }
 * Returns: { url, key, expiresIn, devMode? }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { buildStorageKey, getUploadSignedUrl, R2_CONFIGURED } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireOrgAuthWithRoleApi();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (body.clientId) {
      await requireClientAccess({ dbUserId: auth.dbUserId, clientId: body.clientId, orgId: auth.orgRow.id, role: auth.role });
    }

    const key = buildStorageKey(auth.orgRow.id, body.filename);

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
    if (msg.includes("Unauthorized") || msg.includes("redirect") || msg.includes("Forbidden")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
