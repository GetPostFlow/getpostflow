import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, brandKits } from "@getpostflow/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/clients/[id]/brand-kit
 *
 * Returns the brand kit for a client.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clientId } = await params;

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  const db = createDb(process.env.DATABASE_URL!);
  const [kit] = await db.select().from(brandKits).where(eq(brandKits.clientId, clientId)).limit(1);

  if (!kit) return NextResponse.json({ kit: null });

  return NextResponse.json({
    kit: {
      ...kit,
      createdAt: kit.createdAt.toISOString(),
      updatedAt: kit.updatedAt.toISOString(),
    },
  });
}

/**
 * PUT /api/clients/[id]/brand-kit
 *
 * Upsert the brand kit for a client.
 * Body: { logos?, colors?, typography?, styleGuide?, voiceTone?, dosAndDonts? }
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clientId } = await params;

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  const body = (await req.json()) as {
    logos?: Record<string, string>;
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    styleGuide?: string;
    voiceTone?: string;
    dosAndDonts?: { dos: string[]; donts: string[] };
  };

  const db = createDb(process.env.DATABASE_URL!);
  const [existing] = await db.select().from(brandKits).where(eq(brandKits.clientId, clientId)).limit(1);

  if (existing) {
    const [updated] = await db
      .update(brandKits)
      .set({
        logos: body.logos ?? existing.logos,
        colors: body.colors ?? existing.colors,
        typography: body.typography ?? existing.typography,
        styleGuide: body.styleGuide ?? existing.styleGuide,
        voiceTone: body.voiceTone ?? existing.voiceTone,
        dosAndDonts: body.dosAndDonts ?? existing.dosAndDonts,
        updatedAt: new Date(),
      })
      .where(eq(brandKits.id, existing.id))
      .returning();
    return NextResponse.json({ kit: { ...updated, createdAt: updated!.createdAt.toISOString(), updatedAt: updated!.updatedAt.toISOString() } });
  }

  const [kit] = await db
    .insert(brandKits)
    .values({
      clientId,
      logos: body.logos ?? {},
      colors: body.colors ?? {},
      typography: body.typography ?? {},
      styleGuide: body.styleGuide,
      voiceTone: body.voiceTone,
      dosAndDonts: body.dosAndDonts ?? { dos: [], donts: [] },
    })
    .returning();

  return NextResponse.json({
    kit: {
      ...kit,
      createdAt: kit!.createdAt.toISOString(),
      updatedAt: kit!.updatedAt.toISOString(),
    },
  });
}
