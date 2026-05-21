#!/usr/bin/env npx ts-node --esm
/**
 * seed:demo-analytics
 *
 * Seeds 30 days of analytics data for the demo client ("Acme Bakery").
 * Also creates demo ai_learning_insights and a sample report record.
 *
 * Usage:
 *   pnpm seed:demo-analytics
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  analyticsAggregates,
  aiLearningInsights,
  reports,
} from "@getpostflow/db";
import { generateDemoMetrics } from "@getpostflow/analytics";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    console.error("❌  DATABASE_URL / POSTGRES_URL not set. Set it in apps/web/.env.local");
    process.exit(1);
  }

  const db = createDb(databaseUrl);

  // ── Find demo org + client ──────────────────────────────────────────────────
  const [org] = await db.select().from(orgs).where(eq(orgs.slug, "demo-org")).limit(1);
  if (!org) {
    console.error("❌  Demo org not found. Run pnpm seed:demo-client first.");
    process.exit(1);
  }

  const [client] = await db.select().from(clients).where(eq(clients.orgId, org.id)).limit(1);
  if (!client) {
    console.error("❌  Demo client not found. Run pnpm seed:demo-client first.");
    process.exit(1);
  }

  console.log(`✅  Found demo client: ${client.name} (${client.id})`);

  // ── Generate 30 days of metrics ────────────────────────────────────────────
  const metrics = generateDemoMetrics(client.id, 30, ["instagram", "tiktok", "facebook"]);
  console.log(`📊  Generated ${metrics.length} daily metric records…`);

  let analyticsInserted = 0;
  for (const m of metrics) {
    try {
      await db.insert(analyticsAggregates).values({
        clientId: client.id,
        orgId: org.id,
        platform: m.platform,
        domain: "content",
        metricName: "engagements",
        metricValue: String(m.engagements),
        periodStart: m.date,
        periodEnd: m.date,
        dimensionKey: "content_type",
        dimensionValue: "mixed",
        metadata: {
          impressions: m.impressions,
          reach: m.reach,
          engagementRate: m.engagementRate,
          followerGrowth: m.followerGrowth,
          videoViews: m.videoViews,
          videoCompletionRate: m.videoCompletionRate,
          clickThroughRate: m.clickThroughRate,
        } as Record<string, unknown>,
      });
      analyticsInserted++;
    } catch (err: unknown) {
      // Ignore duplicate key on re-runs
      if (err instanceof Error && err.message.includes("duplicate")) continue;
      console.warn(`  ⚠️  Skipped analytics row: ${(err as Error).message}`);
    }
  }

  console.log(`  ✅  Inserted ${analyticsInserted} analytics aggregate rows`);

  // ── Seed ai_learning_insights ─────────────────────────────────────────────
  const sampleInsights = [
    {
      platform: "instagram",
      contentType: "carousel",
      prediction: 62,
      actual: 78,
      delta: 16,
      insightText: "Carousel posts outperformed single images by 40% on Instagram — high saves signal strong educational content.",
      recommendations: JSON.stringify([
        "Replicate carousel format on Instagram — it consistently outperforms single images.",
        "Add 10–15 targeted hashtags to extend organic reach.",
        "Post carousels on Tuesdays between 9–11am for maximum engagement.",
      ]),
    },
    {
      platform: "tiktok",
      contentType: "reel",
      prediction: 70,
      actual: 88,
      delta: 18,
      insightText: "TikTok hooks under 3s drove 2.3x more video completions — pattern interrupt in first second critical.",
      recommendations: JSON.stringify([
        "Keep TikTok videos under 30s with hook in first 3 seconds.",
        "Use trending audio to boost discoverability by 2–3x.",
        "Add text overlay in first frame to capture silent viewers.",
      ]),
    },
    {
      platform: "facebook",
      contentType: "post",
      prediction: 55,
      actual: 42,
      delta: -13,
      insightText: "Facebook text posts underperformed vs prediction — organic reach declining. Shift budget to boosted reels.",
      recommendations: JSON.stringify([
        "Reduce Facebook text-only posts and allocate to Reels format.",
        "Consider boosting top Instagram posts to Facebook for better reach.",
        "Add video thumbnails to improve click-through rate in feed.",
      ]),
    },
  ];

  for (const ins of sampleInsights) {
    try {
      await db.insert(aiLearningInsights).values({
        clientId: client.id,
        contentItemId: "00000000-0000-0000-0000-000000000001",
        platform: ins.platform,
        contentType: ins.contentType,
        prediction: ins.prediction,
        actual: ins.actual,
        delta: ins.delta,
        insightText: ins.insightText,
        recommendations: JSON.parse(ins.recommendations) as unknown[],
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("duplicate")) continue;
      console.warn(`  ⚠️  Skipped insight row: ${(err as Error).message}`);
    }
  }

  console.log(`  ✅  Inserted ${sampleInsights.length} AI learning insights`);

  // ── Seed a sample report record ───────────────────────────────────────────
  const now = new Date();
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);

  try {
    await db.insert(reports).values({
      clientId: client.id,
      orgId: org.id,
      type: "monthly",
      periodStart: periodStart.toISOString().split("T")[0]!,
      periodEnd: periodEnd.toISOString().split("T")[0]!,
      status: "sent",
      pdfUrl: null,
      summaryPayload: {
        generatedBy: "seed:demo-analytics",
        totalReach: metrics.reduce((s, m) => s + m.reach, 0),
        avgEngagementRate: (metrics.reduce((s, m) => s + m.engagementRate, 0) / metrics.length).toFixed(4),
      } as Record<string, unknown>,
      sentAt: periodEnd,
    });
    console.log("  ✅  Inserted sample monthly report record");
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("duplicate")) {
      console.log("  ℹ️  Report record already exists, skipping");
    } else {
      console.warn(`  ⚠️  Skipped report row: ${(err as Error).message}`);
    }
  }

  console.log("\n🎉  seed:demo-analytics complete!");
  console.log(`    Client:       ${client.name}`);
  console.log(`    Analytics:    ${analyticsInserted} rows across 3 platforms × 30 days`);
  console.log(`    Insights:     ${sampleInsights.length} AI learning samples`);
  console.log(`    Report:       1 sample monthly report`);
  console.log(`\n    Demo path:    /dashboard/analytics`);
  console.log(`    Reports path: /dashboard/clients/${client.id}/reports`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
