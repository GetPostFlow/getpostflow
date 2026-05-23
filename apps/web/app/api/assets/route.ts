import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createDb, assets } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const db = createDb(process.env.DATABASE_URL!);
  const rows = await db
    .select()
    .from(assets)
    .where(eq(assets.clientId, clientId))
    .limit(50);

  return NextResponse.json({
    assets: rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      contentType: r.mimeType ?? "application/octet-stream",
      sizeBytes: r.sizeBytes,
      publicUrl: r.publicUrl,
      source: r.source,
      createdAt: r.createdAt,
    })),
  });
}
