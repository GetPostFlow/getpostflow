"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { generateBrandStrategy } from "@getpostflow/ai";

const db = () => createDb(process.env.DATABASE_URL!);

// ─── RBAC helpers ─────────────────────────────────────────────────────────────

async function requireAuthAndRole() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const database = db();
  const { users, orgMemberships } = await import("@getpostflow/db");
  const { eq, and } = await import("drizzle-orm");

  const [user] = await database.select({ id: users.id }).from(users).where(eq(users.clerkUserId, userId)).limit(1);
  if (!user) redirect("/sign-in");

  const [membership] = await database
    .select({ role: orgMemberships.role })
    .from(orgMemberships)
    .where(and(eq(orgMemberships.orgId, orgId), eq(orgMemberships.userId, user.id)))
    .limit(1);

  const role = membership?.role ?? "support";
  const isAdmin = role === "org_owner" || role === "org_admin";
  return { userId, orgId, dbUserId: user.id, role, isAdmin };
}

async function enforceClientAccess(clientId: string, orgId: string, isAdmin: boolean, dbUserId: string) {
  if (isAdmin) return;
  const database = db();
  const { clientAssignments } = await import("@getpostflow/db");
  const { eq, and } = await import("drizzle-orm");

  const [assignment] = await database
    .select()
    .from(clientAssignments)
    .where(and(eq(clientAssignments.clientId, clientId), eq(clientAssignments.userId, dbUserId)))
    .limit(1);

  if (!assignment) throw new Error("Forbidden: You do not have access to this client.");
}

// ─── Create client ────────────────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const { userId, orgId, isAdmin } = await requireAuthAndRole();
  if (!isAdmin) throw new Error("Forbidden: Only admins can create clients.");

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
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();
  await enforceClientAccess(clientId, orgId, isAdmin, dbUserId);

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
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();
  await enforceClientAccess(clientId, orgId, isAdmin, dbUserId);

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
    const draft = await generateBrandStrategy(payload as unknown as Parameters<typeof generateBrandStrategy>[0]);

    // Store draft
    await database.insert(clientBrandStrategies).values({
      clientId,
      orgId: orgId,
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
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();

  const database = db();
  const { clientBrandStrategies, clients } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");

  if (!isAdmin) {
    await enforceClientAccess(strategy.clientId, orgId, isAdmin, dbUserId);
  }

  await database
    .update(clientBrandStrategies)
    .set({ status: "client_pending", editedPayload })
    .where(eq(clientBrandStrategies.id, strategyId));

  await database
    .update(clients)
    .set({ status: "client_review" })
    .where(eq(clients.id, strategy.clientId));

  // Send magic link to primary contact email if available
  const [clientRecord] = await database
    .select({ primaryContactEmail: clients.primaryContactEmail, slug: clients.slug, orgId: clients.orgId, name: clients.name })
    .from(clients)
    .where(eq(clients.id, strategy.clientId))
    .limit(1);

  let stubUrl: string | undefined;
  if (clientRecord?.primaryContactEmail) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const res = await fetch(`${appUrl}/api/portal/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: strategy.clientId, email: clientRecord.primaryContactEmail }),
      });
      const data = await res.json();
      if (data.stubUrl) stubUrl = data.stubUrl as string;

      // Send notification email via central system
      if (data.sent) {
        const { sendStrategySentToClientEmail } = await import("@getpostflow/notifications");
        await sendStrategySentToClientEmail({
          to: clientRecord.primaryContactEmail,
          clientName: clientRecord.name,
          magicLink: data.stubUrl ?? "",
        }).catch((err) => console.error("[strategistApprove] Notification email failed:", err));
      }
    } catch (e) {
      console.error('[strategistApprove] Failed to send magic link:', e);
    }
  }

  return { success: true, clientId: strategy.clientId, stubUrl };
}

// ─── Add strategist comment ───────────────────────────────────────────────────

export async function addStrategistComment(
  strategyId: string,
  comment: string,
  section?: string
) {
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();

  const database = db();
  const { clientBrandStrategies } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");
  if (!isAdmin) {
    await enforceClientAccess(strategy.clientId, orgId, isAdmin, dbUserId);
  }

  const comments = [...((strategy.strategistComments as unknown[]) ?? [])];
  comments.push({
    id: crypto.randomUUID(),
    authorId: dbUserId,
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

// ─── Request strategy changes ─────────────────────────────────────────────────

export async function requestStrategyChanges(strategyId: string, comment: string) {
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();

  const database = db();
  const { clientBrandStrategies, clients, auditLogs } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");
  if (!isAdmin) {
    await enforceClientAccess(strategy.clientId, orgId, isAdmin, dbUserId);
  }

  await database
    .update(clientBrandStrategies)
    .set({ status: "strategist_pending" })
    .where(eq(clientBrandStrategies.id, strategyId));

  await database
    .update(clients)
    .set({ status: "strategist_review" })
    .where(eq(clients.id, strategy.clientId));

  await database.insert(auditLogs).values({
    orgId: strategy.orgId,
    clientId: strategy.clientId,
    action: "strategy_changes_requested",
    entityType: "brand_strategy",
    entityId: strategyId,
    payload: { comment, requestedBy: dbUserId },
  });

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

  // Notify internal team
  try {
    const [client] = await database.select().from(clients).where(eq(clients.id, strategy.clientId)).limit(1);
    if (client) {
      const { sendStrategyApprovedByClientEmail } = await import("@getpostflow/notifications");
      const { orgMemberships, users } = await import("@getpostflow/db");
      const team = await database
        .select({ userId: orgMemberships.userId })
        .from(orgMemberships)
        .where(eq(orgMemberships.orgId, client.orgId));
      const userIds = team.map((t) => t.userId);
      if (userIds.length > 0) {
        const userRows = await database.select({ email: users.email }).from(users).where(eq(users.id, userIds[0]));
        for (const u of userRows) {
          if (u.email) {
            await sendStrategyApprovedByClientEmail({ to: u.email, clientName: client.name }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error("[clientApproveStrategy] Notification failed:", err);
  }

  return { success: true };
}

// ─── Strategist: regenerate a section ────────────────────────────────────────

export async function regenerateSection(
  strategyId: string,
  sectionKey: string
) {
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();

  const database = db();
  const { clientBrandStrategies, clientIntakeSubmissions } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const [strategy] = await database
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.id, strategyId))
    .limit(1);

  if (!strategy) throw new Error("Strategy not found");
  if (!isAdmin) {
    await enforceClientAccess(strategy.clientId, orgId, isAdmin, dbUserId);
  }

  const [intake] = await database
    .select()
    .from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, strategy.clientId))
    .limit(1);

  const { generateBrandStrategySection } = await import("@getpostflow/ai");
  type SectionKey = Parameters<typeof generateBrandStrategySection>[1];
  const currentDraft = strategy.editedPayload as Parameters<typeof generateBrandStrategySection>[2];

  const updated = await generateBrandStrategySection(
    (intake?.rawPayload ?? {}) as Parameters<typeof generateBrandStrategySection>[0],
    sectionKey as SectionKey,
    currentDraft
  );

  const newEdited = { ...(strategy.editedPayload as Record<string, unknown>), ...updated };

  await database
    .update(clientBrandStrategies)
    .set({ editedPayload: newEdited })
    .where(eq(clientBrandStrategies.id, strategyId));

  return { success: true, section: updated };
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

  // Notify internal team of revision request
  try {
    const [client] = await database.select().from(clients).where(eq(clients.id, strategy.clientId)).limit(1);
    if (client) {
      const { sendStrategyReadyForInternalReviewEmail } = await import("@getpostflow/notifications");
      const { orgMemberships, users } = await import("@getpostflow/db");
      const team = await database
        .select({ userId: orgMemberships.userId })
        .from(orgMemberships)
        .where(eq(orgMemberships.orgId, client.orgId));
      const userIds = team.map((t) => t.userId);
      if (userIds.length > 0) {
        const userRows = await database.select({ email: users.email }).from(users).where(eq(users.id, userIds[0]));
        for (const u of userRows) {
          if (u.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            await sendStrategyReadyForInternalReviewEmail({
              to: u.email,
              clientName: client.name,
              reviewUrl: `${appUrl}/dashboard/clients/${client.id}/strategy/review`,
            }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error("[clientRequestChanges] Notification failed:", err);
  }

  return { success: true };
}

// ─── Client portal: reject strategy ────────────────────────────────────────────

export async function clientRejectStrategy(
  strategyId: string,
  tokenHash: string,
  comment: string
) {
  const database = db();
  const { clientBrandStrategies, clients, portalTokens, auditLogs } = await import("@getpostflow/db");
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

  // Audit log
  await database.insert(auditLogs).values({
    orgId: strategy.orgId,
    clientId: strategy.clientId,
    action: "strategy_rejected_by_client",
    entityType: "brand_strategy",
    entityId: strategyId,
    payload: { comment },
  });

  // Notify internal team
  try {
    const [client] = await database.select().from(clients).where(eq(clients.id, strategy.clientId)).limit(1);
    if (client) {
      const { sendStrategyReadyForInternalReviewEmail } = await import("@getpostflow/notifications");
      const { orgMemberships, users } = await import("@getpostflow/db");
      const team = await database
        .select({ userId: orgMemberships.userId })
        .from(orgMemberships)
        .where(eq(orgMemberships.orgId, client.orgId));
      const userIds = team.map((t) => t.userId);
      if (userIds.length > 0) {
        const userRows = await database.select({ email: users.email }).from(users).where(eq(users.id, userIds[0]));
        for (const u of userRows) {
          if (u.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            await sendStrategyReadyForInternalReviewEmail({
              to: u.email,
              clientName: client.name,
              reviewUrl: `${appUrl}/dashboard/clients/${client.id}/strategy/review`,
            }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error("[clientRejectStrategy] Notification failed:", err);
  }

  return { success: true };
}

// ─── Send magic link to client ────────────────────────────────────────────────

export async function sendStrategyMagicLink(clientId: string, email: string) {
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();
  if (!isAdmin) {
    await enforceClientAccess(clientId, orgId, isAdmin, dbUserId);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${appUrl}/api/portal/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, email }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to send magic link");
  }

  const data = await res.json();

  if (data.stubUrl) {
    // Dev mode: return stub URL for testing
    return { sent: false, stubUrl: data.stubUrl as string };
  }

  return { sent: true };
}

// ─── Generate portal test link for dashboard ──────────────────────────────────

export async function generatePortalTestLink(clientId: string): Promise<{ url: string }> {
  const { dbUserId, isAdmin, orgId } = await requireAuthAndRole();
  if (!isAdmin) {
    await enforceClientAccess(clientId, orgId, isAdmin, dbUserId);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/api/portal/test-token?clientId=${encodeURIComponent(clientId)}`;
  return { url };
}
