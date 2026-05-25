import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, contentTemplates } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/clients/[id]/templates
 *
 * Query: contentType (optional)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clientId } = await params;

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType");

  const db = createDb(process.env.DATABASE_URL!);
  let query = db
    .select()
    .from(contentTemplates)
    .where(and(eq(contentTemplates.clientId, clientId), eq(contentTemplates.orgId, auth.orgRow.id)))
    .orderBy(desc(contentTemplates.createdAt))
    .$dynamic();

  if (contentType) {
    query = query.where(eq(contentTemplates.contentType, contentType));
  }

  const rows = await query;
  return NextResponse.json({
    templates: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  });
}

/**
 * POST /api/clients/[id]/templates
 *
 * Body: { title, contentType?, body, tags?, variables? }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clientId } = await params;

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  const body = (await req.json()) as {
    title: string;
    contentType?: string;
    body: string;
    tags?: string[];
    variables?: string[];
  };

  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);
  const [tpl] = await db
    .insert(contentTemplates)
    .values({
      clientId,
      orgId: auth.orgRow.id,
      title: body.title.trim(),
      contentType: body.contentType ?? "post",
      body: body.body.trim(),
      tags: body.tags ?? [],
      variables: body.variables ?? extractVariables(body.body),
    })
    .returning();

  return NextResponse.json({
    template: {
      ...tpl,
      createdAt: tpl!.createdAt.toISOString(),
      updatedAt: tpl!.updatedAt.toISOString(),
    },
  });
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ""))));
}
