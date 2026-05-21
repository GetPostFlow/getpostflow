/**
 * Learning Loop — Phase 6
 *
 * After content is published, compares predicted vs actual engagement,
 * generates human-readable insights, and feeds them back into future
 * content-engine prompts per client.
 */

import { route } from "./router";
import { scoreContent } from "./content-engine";
import type { ContentDraft, SupportedPlatform } from "./content-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActualMetrics {
  impressions: number;
  reach: number;
  engagements: number;
  engagementRate: number; // 0–1
  videoViews?: number;
  videoCompletionRate?: number; // 0–1
  clickThroughRate?: number; // 0–1
  followerGrowth?: number;
}

export interface LearningInput {
  clientId: string;
  contentItemId: string;
  platform: SupportedPlatform;
  contentType: string;
  draft: ContentDraft;
  predictedScore: number; // 0–1, from scoreContent()
  actual: ActualMetrics;
  publishedAt: Date;
}

export interface LearningInsight {
  clientId: string;
  contentItemId: string;
  platform: SupportedPlatform;
  contentType: string;
  prediction: number;
  actual: number; // normalised 0–1 derived from actualMetrics
  delta: number; // actual − prediction
  insightText: string;
  recommendations: string[];
  appliedAt: Date;
}

// ─── Normalise raw metrics to a 0–1 engagement score ─────────────────────────

export function normaliseActual(metrics: ActualMetrics): number {
  // Weighted blend of available signals
  const components: number[] = [];
  const weights: number[] = [];

  if (metrics.engagementRate > 0) {
    // Typical ER benchmark: 3–6% is good → cap at 10%
    components.push(Math.min(metrics.engagementRate / 0.1, 1));
    weights.push(0.4);
  }

  if (metrics.videoCompletionRate !== undefined) {
    components.push(metrics.videoCompletionRate);
    weights.push(0.25);
  }

  if (metrics.clickThroughRate !== undefined) {
    // CTR benchmark: 1–2% is good → cap at 5%
    components.push(Math.min(metrics.clickThroughRate / 0.05, 1));
    weights.push(0.2);
  }

  if (metrics.followerGrowth !== undefined && metrics.reach > 0) {
    const growthRatio = metrics.followerGrowth / metrics.reach;
    components.push(Math.min(growthRatio / 0.02, 1));
    weights.push(0.15);
  }

  if (components.length === 0) return 0.5; // default fallback

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const score = components.reduce((sum, c, i) => sum + c * (weights[i]! / totalWeight), 0);
  return Math.min(1, Math.max(0, score));
}

// ─── Rule-based insights (fast path, no AI call needed) ───────────────────────

function buildRuleBasedInsights(input: LearningInput, actualScore: number): string[] {
  const insights: string[] = [];
  const { platform, contentType, draft, actual } = input;

  // Engagement rate insights
  if (actual.engagementRate > 0.06) {
    insights.push(`High engagement on ${platform} (${(actual.engagementRate * 100).toFixed(1)}% ER) — above 6% benchmark.`);
  } else if (actual.engagementRate < 0.02 && actual.engagementRate > 0) {
    insights.push(`Low engagement on ${platform} (${(actual.engagementRate * 100).toFixed(1)}% ER) — below 2% threshold. Consider richer visuals or stronger CTA.`);
  }

  // Video hook performance
  if ((contentType === "reel" || contentType === "video_script") && actual.videoCompletionRate !== undefined) {
    if (actual.videoCompletionRate > 0.7) {
      const hookText = draft.videoScript?.hook ?? "Video hook";
      insights.push(`Strong video retention (${(actual.videoCompletionRate * 100).toFixed(0)}% completion). Hook "${hookText.slice(0, 60)}..." performed well.`);
    } else if (actual.videoCompletionRate < 0.3) {
      insights.push(`Video drop-off is high (${(actual.videoCompletionRate * 100).toFixed(0)}% completion). Shorten the hook or add a pattern interrupt in first 3s.`);
    }
  }

  // Carousel vs post
  if (contentType === "carousel" && actualScore > 0.7) {
    insights.push(`Carousel content outperformed baseline by ${Math.round((actualScore - input.predictedScore) * 100)}pts on ${platform}.`);
  }

  // Platform-specific
  if (platform === "instagram" && draft.hashtags.length >= 10 && actual.engagementRate > 0.04) {
    insights.push(`Hashtag-rich Instagram post (${draft.hashtags.length} tags) drove above-average engagement.`);
  }

  if (platform === "tiktok" && actual.videoViews !== undefined && actual.videoViews > 1000) {
    insights.push(`TikTok post reached ${actual.videoViews.toLocaleString()} views — trending content format validated.`);
  }

  // Prediction delta
  const delta = actualScore - input.predictedScore;
  if (delta > 0.15) {
    insights.push(`Outperformed AI prediction by ${Math.round(delta * 100)} points — content resonated stronger than expected.`);
  } else if (delta < -0.15) {
    insights.push(`Underperformed AI prediction by ${Math.abs(Math.round(delta * 100))} points — review audience targeting or post timing.`);
  }

  return insights;
}

// ─── AI-enhanced insight generation ─────────────────────────────────────────

async function generateAiInsight(input: LearningInput, actualScore: number, ruleInsights: string[]): Promise<{ insightText: string; recommendations: string[] }> {
  const isStub =
    process.env.AI_STUB_MODE === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (isStub) {
    return buildStubInsight(input, actualScore, ruleInsights);
  }

  const prompt = `You are a social media analytics expert. Analyse this content performance data and provide ONE concise insight and 3 specific recommendations.

Platform: ${input.platform}
Content Type: ${input.contentType}
Post Body (first 200 chars): ${input.draft.body.slice(0, 200)}
Hashtags: ${input.draft.hashtags.join(", ")}
CTA: ${input.draft.callToAction}

Predicted Score: ${(input.predictedScore * 100).toFixed(0)}/100
Actual Score: ${(actualScore * 100).toFixed(0)}/100
Delta: ${((actualScore - input.predictedScore) > 0 ? "+" : "")}${((actualScore - input.predictedScore) * 100).toFixed(0)} points

Metrics:
- Impressions: ${input.actual.impressions.toLocaleString()}
- Reach: ${input.actual.reach.toLocaleString()}
- Engagement Rate: ${(input.actual.engagementRate * 100).toFixed(2)}%
${input.actual.videoCompletionRate !== undefined ? `- Video Completion: ${(input.actual.videoCompletionRate * 100).toFixed(0)}%` : ""}
${input.actual.clickThroughRate !== undefined ? `- CTR: ${(input.actual.clickThroughRate * 100).toFixed(2)}%` : ""}

Rule-based observations:
${ruleInsights.join("\n")}

Return JSON only:
{
  "insightText": "One 1-2 sentence summary of what this post result teaches us",
  "recommendations": ["Specific action 1", "Specific action 2", "Specific action 3"]
}`;

  try {
    const result = await route({
      task: "caption",
      prompt,
      opts: { maxTokens: 512, temperature: 0.4 },
    });
    const text = (result as { text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]) as { insightText: string; recommendations: string[] };
    return parsed;
  } catch {
    return buildStubInsight(input, actualScore, ruleInsights);
  }
}

function buildStubInsight(
  input: LearningInput,
  actualScore: number,
  ruleInsights: string[]
): { insightText: string; recommendations: string[] } {
  const delta = actualScore - input.predictedScore;
  const platformLabel = input.platform.charAt(0).toUpperCase() + input.platform.slice(1);
  const er = (input.actual.engagementRate * 100).toFixed(1);

  const insightText =
    delta >= 0
      ? `${platformLabel} ${input.contentType} content outperformed prediction with ${er}% engagement rate — ${ruleInsights[0] ?? "format and timing contributed to success."}`
      : `${platformLabel} ${input.contentType} content underperformed vs prediction (${er}% ER). ${ruleInsights[0] ?? "Review hook and CTA for improvement."}`;

  const recommendations = [
    delta >= 0
      ? `Replicate this ${input.contentType} format on ${input.platform} — it consistently outperforms.`
      : `Revise ${input.contentType} hook for ${input.platform} — engagement rate is below benchmark.`,
    input.actual.videoCompletionRate !== undefined && input.actual.videoCompletionRate < 0.5
      ? "Shorten video by 20–30% and front-load the hook in the first 3 seconds."
      : "Maintain current video length — completion rate is within acceptable range.",
    input.draft.hashtags.length < 5
      ? `Add more targeted hashtags (current: ${input.draft.hashtags.length}) — aim for 8–15 on ${input.platform}.`
      : `Hashtag strategy is effective (${input.draft.hashtags.length} tags). Test niche variations to expand reach.`,
  ];

  return { insightText, recommendations };
}

// ─── Main: processLearning ────────────────────────────────────────────────────

/**
 * Process a single published content item's performance against prediction.
 * Returns a LearningInsight that should be stored in ai_learning_samples.
 */
export async function processLearning(input: LearningInput): Promise<LearningInsight> {
  const predictedScore = input.predictedScore ?? scoreContent(input.draft);
  const actualScore = normaliseActual(input.actual);
  const delta = actualScore - predictedScore;

  const ruleInsights = buildRuleBasedInsights(input, actualScore);
  const { insightText, recommendations } = await generateAiInsight(
    { ...input, predictedScore },
    actualScore,
    ruleInsights
  );

  return {
    clientId: input.clientId,
    contentItemId: input.contentItemId,
    platform: input.platform,
    contentType: input.contentType,
    prediction: predictedScore,
    actual: actualScore,
    delta,
    insightText,
    recommendations,
    appliedAt: new Date(),
  };
}

// ─── Batch: processLearningBatch ──────────────────────────────────────────────

/**
 * Process multiple learning inputs, returning insights sorted by delta magnitude.
 */
export async function processLearningBatch(inputs: LearningInput[]): Promise<LearningInsight[]> {
  const insights = await Promise.all(inputs.map(processLearning));
  return insights.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

// ─── Aggregate insights for prompt injection ─────────────────────────────────

export interface ClientLearningContext {
  clientId: string;
  platform: SupportedPlatform;
  topInsights: string[];
  recommendations: string[];
  bestPerformingFormats: string[];
  worstPerformingFormats: string[];
}

/**
 * Aggregate learning insights for a client+platform into a prompt-injectable context.
 * Pass this to content-engine's generateContent() as part of campaignBrief.
 */
export function aggregateInsights(insights: LearningInsight[], clientId: string, platform: SupportedPlatform): ClientLearningContext {
  const relevant = insights.filter((i) => i.clientId === clientId && i.platform === platform);

  if (relevant.length === 0) {
    return {
      clientId,
      platform,
      topInsights: [],
      recommendations: [],
      bestPerformingFormats: [],
      worstPerformingFormats: [],
    };
  }

  // Best insights are those with highest positive delta
  const topInsights = relevant
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)
    .map((i) => i.insightText);

  // Collect all recommendations, deduplicate
  const allRecs = relevant.flatMap((i) => i.recommendations);
  const recommendations = [...new Set(allRecs)].slice(0, 5);

  // Best/worst performing content types by average actual score
  const byType = new Map<string, number[]>();
  for (const insight of relevant) {
    const arr = byType.get(insight.contentType) ?? [];
    arr.push(insight.actual);
    byType.set(insight.contentType, arr);
  }

  const typeScores: { type: string; avg: number }[] = [];
  for (const [type, scores] of byType.entries()) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    typeScores.push({ type, avg });
  }
  typeScores.sort((a, b) => b.avg - a.avg);

  const bestPerformingFormats = typeScores.slice(0, 2).map((t) => t.type);
  const worstPerformingFormats = typeScores.slice(-2).map((t) => t.type);

  return {
    clientId,
    platform,
    topInsights,
    recommendations,
    bestPerformingFormats,
    worstPerformingFormats,
  };
}

/**
 * Build a concise string for injection into content-engine campaignBrief.
 */
export function buildLearningContextString(ctx: ClientLearningContext): string {
  if (ctx.topInsights.length === 0) return "";

  const parts: string[] = [
    `[Learning Loop Context for ${ctx.platform}]`,
  ];

  if (ctx.topInsights.length > 0) {
    parts.push(`Top insights:\n${ctx.topInsights.map((i) => `- ${i}`).join("\n")}`);
  }

  if (ctx.bestPerformingFormats.length > 0) {
    parts.push(`Best performing formats: ${ctx.bestPerformingFormats.join(", ")}`);
  }

  if (ctx.recommendations.length > 0) {
    parts.push(`Apply these improvements:\n${ctx.recommendations.slice(0, 3).map((r) => `- ${r}`).join("\n")}`);
  }

  return parts.join("\n\n");
}

// ─── Video analytics helpers ───────────────────────────────────────────────────

export interface VideoPerformanceData {
  contentItemId: string;
  platform: SupportedPlatform;
  views: number;
  watchTimeSeconds: number;
  durationSeconds: number;
  completionRate: number; // 0–1
  dropOffPoints: { timestampSeconds: number; retentionRate: number }[];
  abTestVariant?: "A" | "B";
}

export interface AbTestResult {
  winner: "A" | "B" | "tie";
  variantAScore: number;
  variantBScore: number;
  confidence: number; // 0–1
  recommendation: string;
}

/**
 * Compare two A/B test video variants and pick a winner.
 * Called after 24h when both have enough views.
 */
export function evaluateAbTest(variantA: VideoPerformanceData, variantB: VideoPerformanceData): AbTestResult {
  const scoreA = variantA.completionRate * 0.5 + (variantA.views > 0 ? Math.min(variantA.views / 1000, 1) : 0) * 0.5;
  const scoreB = variantB.completionRate * 0.5 + (variantB.views > 0 ? Math.min(variantB.views / 1000, 1) : 0) * 0.5;

  const delta = Math.abs(scoreA - scoreB);
  const confidence = Math.min(delta / 0.1, 1); // 10-point gap = full confidence

  let winner: "A" | "B" | "tie";
  if (delta < 0.03) {
    winner = "tie";
  } else {
    winner = scoreA > scoreB ? "A" : "B";
  }

  const recommendation =
    winner === "tie"
      ? "No clear winner — run test for another 24 hours or increase traffic."
      : `Variant ${winner} wins with ${(delta * 100).toFixed(1)} point lead. Promote variant ${winner} and use its hook style in future videos.`;

  return { winner, variantAScore: scoreA, variantBScore: scoreB, confidence, recommendation };
}

/**
 * Suggest trending audio tags for TikTok/Reels/Shorts based on platform and niche.
 * In production this would call a trending API; for now returns curated suggestions.
 */
export function suggestTrendingAudio(platform: SupportedPlatform, niche: string): string[] {
  const baseHashtags = ["#trendingsound", "#fyp", "#viral"];

  const nicheMap: Record<string, string[]> = {
    food: ["#foodtok", "#recipetok", "#foodies"],
    fitness: ["#fittok", "#gymtok", "#workout"],
    fashion: ["#fashiontok", "#ootd", "#styletok"],
    tech: ["#techtok", "#techreview", "#gadgets"],
    beauty: ["#beautytok", "#makeuptutorial", "#skincare"],
    travel: ["#traveltok", "#wanderlust", "#travelgram"],
    business: ["#businesstips", "#entrepreneurlife", "#growthhacks"],
    education: ["#learnontiktok", "#didyouknow", "#edutok"],
  };

  const nicheKey = Object.keys(nicheMap).find((k) =>
    niche.toLowerCase().includes(k)
  );

  const nicheSpecific = nicheKey ? (nicheMap[nicheKey] ?? []) : [];

  const platformExtra: Partial<Record<SupportedPlatform, string[]>> = {
    tiktok: ["#tiktoktrending", "#ForYouPage"],
    instagram: ["#reels", "#reelsinstagram", "#instareels"],
    youtube: ["#shorts", "#youtubeshorts"],
  };

  return [...baseHashtags, ...nicheSpecific, ...(platformExtra[platform] ?? [])].slice(0, 10);
}
