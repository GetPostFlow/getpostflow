import { NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";

// White-label feature flag — OFF in v1 for all plans.
const WHITE_LABEL_ENABLED = false;

export async function GET(req: Request) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  if (!WHITE_LABEL_ENABLED) {
    return NextResponse.json(
      { error: "Feature not available", code: "FEATURE_DISABLED" },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true, profile: null });
}

export async function PUT(req: Request) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { clientId?: string };
  if (!body.clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId: body.clientId, orgId: auth.orgRow.id, role: auth.role });

  if (!WHITE_LABEL_ENABLED) {
    return NextResponse.json(
      { error: "Feature not available", code: "FEATURE_DISABLED" },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true });
}
