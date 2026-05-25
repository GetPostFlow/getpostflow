import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";
import { createDb, funnelRules, auditLogs } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";

interface FunnelActionPayload {
  clientId: string;
  platform: string;
  messageText: string;
  messageId: string;
  senderHandle: string;
  sentiment?: "positive" | "neutral" | "negative";
  intent?: "awareness" | "interest" | "conversion";
}

function isReddit(platform: string): boolean {
  return platform.toLowerCase() === "reddit";
}

function isComplaint(text: string): boolean {
  const complaintWords = ["complaint", "terrible", "awful", "worst", "hate", "scam", "fraud", "disappointed", "angry", "refund", "cancel"];
  const lower = text.toLowerCase();
  return complaintWords.some((w) => lower.includes(w));
}

function isHighIntentDM(text: string): boolean {
  const intentWords = ["buy", "purchase", "order", "pricing", "quote", "book", "schedule", "demo", "trial", "interested in", "how much"];
  const lower = text.toLowerCase();
  return intentWords.some((w) => lower.includes(w));
}

export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as FunnelActionPayload;
  const { clientId, platform, messageText, messageId, senderHandle } = body;

  if (!clientId || !platform || !messageText || !messageId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  // ── Safety Rules ────────────────────────────────────────────────────────────

  // 1. Reddit: NO auto-responses
  if (isReddit(platform)) {
    await db.insert(auditLogs).values({
      orgId: auth.orgRow.id,
      clientId,
      action: "funnel_blocked_reddit",
      entityType: "community_message",
      entityId: messageId,
      payload: { platform, reason: "Reddit auto-response blocked", senderHandle },
    });
    return NextResponse.json({ action: "blocked", reason: "Reddit auto-response is not allowed" });
  }

  // 2. Complaints / negative sentiment: always escalate
  const sentiment = body.sentiment ?? (isComplaint(messageText) ? "negative" : "neutral");
  if (sentiment === "negative" || isComplaint(messageText)) {
    await db.insert(auditLogs).values({
      orgId: auth.orgRow.id,
      clientId,
      action: "funnel_escalated",
      entityType: "community_message",
      entityId: messageId,
      payload: { platform, reason: "Negative sentiment / complaint detected", senderHandle, messageText: messageText.slice(0, 200) },
    });
    return NextResponse.json({ action: "escalated", reason: "Negative sentiment detected — human review required" });
  }

  // 3. High-intent DMs: notify agency
  if (isHighIntentDM(messageText)) {
    await db.insert(auditLogs).values({
      orgId: auth.orgRow.id,
      clientId,
      action: "funnel_high_intent",
      entityType: "community_message",
      entityId: messageId,
      payload: { platform, senderHandle, messageText: messageText.slice(0, 200) },
    });
    // TODO: send email to hello@getpostflow.com
  }

  // ── Funnel Rules Engine ─────────────────────────────────────────────────────

  const stage = body.intent ?? "awareness";
  const rules = await db
    .select()
    .from(funnelRules)
    .where(
      and(
        eq(funnelRules.clientId, clientId),
        eq(funnelRules.orgId, auth.orgRow.id),
        eq(funnelRules.stage, stage),
        eq(funnelRules.enabled, true)
      )
    );

  const actions: Array<{ type: string; payload: Record<string, unknown> }> = [];

  for (const rule of rules) {
    const keywords = (rule.keywords as string[]) ?? [];
    const matchesKeyword = keywords.length === 0 || keywords.some((k) => messageText.toLowerCase().includes(k.toLowerCase()));
    if (!matchesKeyword) continue;

    switch (rule.actionType) {
      case "auto_like":
        actions.push({ type: "auto_like", payload: { messageId, platform } });
        break;
      case "auto_reply":
        actions.push({
          type: "auto_reply",
          payload: { messageId, platform, replyText: rule.replyTemplate ?? "Thank you for your feedback!" },
        });
        break;
      case "dm_initiate":
        actions.push({
          type: "dm_initiate",
          payload: { senderHandle, platform, message: rule.replyTemplate ?? "Hi! We'd love to help." },
        });
        break;
      case "lead_qualify":
        actions.push({
          type: "lead_qualify",
          payload: { senderHandle, platform, questions: rule.replyTemplate?.split("\n").filter(Boolean) ?? ["What brings you here today?"] },
        });
        break;
      case "cta_link":
        actions.push({
          type: "cta_link",
          payload: { senderHandle, platform, url: rule.ctaUrl ?? "" },
        });
        break;
      default:
        break;
    }
  }

  await db.insert(auditLogs).values({
    orgId: auth.orgRow.id,
    clientId,
    action: "funnel_executed",
    entityType: "community_message",
    entityId: messageId,
    payload: { platform, stage, actionsCount: actions.length, senderHandle },
  });

  return NextResponse.json({ actions, stage, sentiment });
}
