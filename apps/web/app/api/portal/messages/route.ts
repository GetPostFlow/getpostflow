import { NextRequest, NextResponse } from "next/server";
import { validatePortalToken } from "@/app/portal/_portal-helpers";
import { createDb, portalMessages } from "@getpostflow/db";

export async function POST(req: NextRequest) {
  try {
    const { token, orgSlug, clientSlug, body } = (await req.json()) as {
      token: string;
      orgSlug: string;
      clientSlug: string;
      body: string;
    };

    if (!token || !orgSlug || !clientSlug || !body?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const validated = await validatePortalToken(token, orgSlug, clientSlug);
    if (!validated) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { client } = validated;
    const db = createDb(process.env.DATABASE_URL!);

    const [msg] = await db
      .insert(portalMessages)
      .values({
        clientId: client.id,
        senderType: "client",
        senderName: client.primaryContactName ?? "Client",
        body: body.trim(),
      })
      .returning();

    return NextResponse.json({
      message: {
        id: msg!.id,
        senderType: msg!.senderType,
        senderName: msg!.senderName,
        body: msg!.body,
        createdAt: msg!.createdAt.toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
