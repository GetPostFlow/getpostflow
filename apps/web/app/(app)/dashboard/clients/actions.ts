"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { generateBrandStrategy } from "@getpostflow/ai";

const db = () => createDb(process.env.DATABASE_URL!);

// ─── Create client ────────────────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const name = formData.get("name") as string;
  const industry = formData.get("industry") as string | null;
  const primaryContactName = formData.get("primaryContactName") as string | null;
  const primaryContactEmail = formData.get("primaryContactEmail") as string | null;

  if (!name?.trim()) throw new Error("Client name is required");

  // Generate slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const database = db();

  // Find org record
  const { orgs } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");
  const [org] = await database
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) throw new Error("Org not found");

  const { clients, clientIntakeSubmissions } = await import("@getpostflow/db");
  const [client] = await database
    .insert(clients)
    .values({
      orgId: org.id,
      name: name.trim(),
      slug,
      status: "intake_pending",
      industry: industry || null,
      primaryContactName: primaryContactName || null,
      primaryContactEmail: primaryContactEmail || null,
      targetLocales: ["en"],
    })
    .returning({ id: clients.id });

  // Create blank intake draft
  await database.insert(clientIntakeSubmissions).values({
    clientId: client.id,
    rawPayload: {},
    isDraft: true,
  });

  redirect(`/dashboard/clients/${client.id}/intake`);
}

// ─── Save intake draft ────────────────────────────────────────────────────────

export async function saveIntakeDraft(clientId: string, payload: Record<string, unknown>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const database = db();
  const { clientIntakeSubmissions } = await import("@getpostflow/db");
  const { eq, and } = await import("drizzle-orm");

  const [existing] = await database
    .select()
    .from(clientIntakeSubmissions)
    .where(
      and(
        eq(clientIntakeSubmissions.clientId, clientId),
        eq(clientIntakeSubmissions.isDraft, true)
      )
    )
    .limit(1);

  if (existing) {
    await database
      .update(clientIntakeSubmissions)
      .set({ rawPayload: payload })
      .where(eq(clientIntakeSubmissions.id, existing.id));
  } else {
    await database.insert(clientIntakeSubmissions).values({
      clientId,
      rawPayload: payload,
      isDraft: true,
    });
  }

  return { success: true };
}

// ─── Submit intake for AI drafting ───────────────────────────────────────────

export async function submitIntake(clientId: string, payload: Record<string, unknown>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const database = db();
  const { clientIntakeSubmissions, clients, clientBrandStrategies } = await import("@getpostflow/db");
  const { eq, and } = await import("drizzle-orm");

  // Save final intake
  const [existing] = await database
    .select()
    .from(clientIntakeSubmissions)
    .where(
      and(
        eq(clientIntakeSubmissions.clientId, clientId),
        eq(clientIntakeSubmissions.isDraft, true)
      )
    )
    .limit(1);

  const now = new Date();
  if (existing) {
    await database
      .update(clientIntakeSubmissions)
      .set({ rawPayload: payload, isDraft: false, submittedAt: now })
      .where(eq(clientIntakeSubmissions.id, existing.id));
  } else {
    await database.insert(clientIntakeSubmissions).values({
      clientId,
      rawPayload: payload,
      isDraft: false,
      submittedAt: now,
    });
  }

  // Transition client status to ai_drafting
  await database
    .update(clients)
    .set({ status: "ai_drafting" })
    .where(eq(clients.id, clientId));

  // Generate AI brand strategy
  try {
    const draft = await generateBrandStrategy(payload as Parameters<typeof generateBrandStrategy>[0]);

    // Store draft
    await database.insert(clientBrandStrategies).values({
      clientId,
      versionInt: 1,
      status: "strategist_pending",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: {
        generatedAt: now.toISOString(),
        stubMode: process.env.AI_STUB_MODE === "true",
      },
    });

    // Transition client status
    await database
      .update(clients)
      .set({ status: "strategist_review" })
      .where(eq(clients.id, clientId));
  } catch {
    // AI failure — mark as ai_drafted so strategist can retry
    await database
      .update(clients)
      .set({ status: "ai_drafted" })
      .where(eq(clients.id, clientId));
  }

  redirect(`/dashboard/clients/${clientId}/strategy/review`);
}

// ─── Strategist approve ───────────────────────────────────────────────────────

export async function strategistApproveStrategy(strategyId: string, editedPayload: Record<string, unknown>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const database = db();
  const { clientBrandStrategies, clients } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");

  await database
    .update(clientBrandStrategies)
    .set({ status: "client_pending", editedPayload })
    .where(eq(clientBrandStrategies.id, strategyId));

  await database
    .update(clients)
    .set({ status: "client_review" })
    .where(eq(clients.id, strategy.clientId));

  // Create notification + send email (handled separately)
  return { success: true, clientId: strategy.clientId };
}

// ─── Add strategist comment ───────────────────────────────────────────────────

export async function addStrategistComment(
  strategyId: string,
  comment: string,
  section?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const database = db();
  const { clientBrandStrategies } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");

  const comments = [...((strategy.strategistComments as unknown[]) ?? [])];
  comments.push({
    id: crypto.randomUUID(),
    authorId: userId,
    authorName: "Strategist",
    body: comment,
    section,
    createdAt: new Date().toISOString(),
  });

  await database
    .update(clientBrandStrategies)
    .set({ strategistComments: comments })
    .where(eq(clientBrandStrategies.id, strategyId));

  return { success: true };
}

// ─── Client portal: approve strategy ─────────────────────────────────────────

export async function clientApproveStrategy(strategyId: string, tokenHash: string) {
  const database = db();
  const { clientBrandStrategies, clients, portalTokens } = await import("@getpostflow/db");
  const { eq, and, gt } = await import("drizzle-orm");

  // Verify token
  const [token] = await database
    .select()
    .from(portalTokens)
    .where(
      and(
        eq(portalTokens.tokenHash, tokenHash),
        gt(portalTokens.expiresAt, new Date()),
      )
    )
    .limit(1);

  if (!token) throw new Error("Invalid or expired token");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");
  if (strategy.clientId !== token.clientId) throw new Error("Unauthorized");

  const now = new Date();
  await database
    .update(clientBrandStrategies)
    .set({ status: "active", approvedAt: now })
    .where(eq(clientBrandStrategies.id, strategyId));

  await database
    .update(clients)
    .set({ status: "active" })
    .where(eq(clients.id, strategy.clientId));

  // Mark token as used
  await database
    .update(portalTokens)
    .set({ usedAt: now })
    .where(eq(portalTokens.id, token.id));

  return { success: true };
}

// ─── Client portal: request changes ──────────────────────────────────────────

export async function clientRequestChanges(
  strategyId: string,
  tokenHash: string,
  comment: string
) {
  const database = db();
  const { clientBrandStrategies, clients, portalTokens } = await import("@getpostflow/db");
  const { eq, and, gt } = await import("drizzle-orm");

  const [token] = await database
    .select()
    .from(portalTokens)
    .where(
      and(
        eq(portalTokens.tokenHash, tokenHash),
        gt(portalTokens.expiresAt, new Date()),
      )
    )
    .limit(1);

  if (!token) throw new Error("Invalid or expired token");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy || strategy.clientId !== token.clientId) throw new Error("Unauthorized");

  const clientComments = [...((strategy.clientComments as unknown[]) ?? [])];
  clientComments.push({
    id: crypto.randomUUID(),
    authorId: token.email,
    authorName: token.email,
    body: comment,
    createdAt: new Date().toISOString(),
  });

  await database
    .update(clientBrandStrategies)
    .set({ status: "strategist_pending", clientComments })
    .where(eq(clientBrandStrategies.id, strategyId));

  await database
    .update(clients)
    .set({ status: "strategist_review" })
    .where(eq(clients.id, strategy.clientId));

  return { success: true };
}
