/**
 * @getpostflow/analytics — Phase 6 expanded
 *
 * Exports metric names, domain categories, chart helpers,
 * and typed interfaces for the advanced analytics dashboard.
 */

// ─── Domains + metric names ───────────────────────────────────────────────────

export const analyticsDomains = [
  "content",
  "community",
  "audience",
  "lead",
  "funnel",
  "reporting",
  "video",
] as const;

export const metricNames = [
  "impressions",
  "reach",
  "engagements",
  "engagement_rate",
  "follower_growth",
  "response_time_minutes",
  "resolved_conversations",
  "qualified_leads",
  "funnel_conversions",
  "video_views",
  "video_completion_rate",
  "click_through_rate",
  "total_reach",
  "top_performing_posts",
] as const;

export type AnalyticsDomain = (typeof analyticsDomains)[number];
export type MetricName = (typeof metricNames)[number];

// ─── Supported platforms ──────────────────────────────────────────────────────

export const analyticsPlatforms = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "linkedin",
  "pinterest",
] as const;

export type AnalyticsPlatform = (typeof analyticsPlatforms)[number];

// ─── Time range options ───────────────────────────────────────────────────────

export const timeRanges = ["7d", "14d", "30d", "90d", "custom"] as const;
export type TimeRange = (typeof timeRanges)[number];

// ─── Core data interfaces ─────────────────────────────────────────────────────

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  platform: string;
  impressions: number;
  reach: number;
  engagements: number;
  engagementRate: number;
  followerGrowth: number;
  videoViews: number;
  videoCompletionRate: number;
  clickThroughRate: number;
}

export interface PlatformSummary {
  platform: string;
  totalImpressions: number;
  totalReach: number;
  totalEngagements: number;
  avgEngagementRate: number;
  followerGrowthTotal: number;
  topPostUrl?: string;
  topPostEngagements?: number;
}

export interface ContentTypeSummary {
  contentType: string;
  count: number;
  avgEngagementRate: number;
  totalReach: number;
}

export interface PostingHeatmapCell {
  dayOfWeek: number; // 0=Sun, 6=Sat
  hourOfDay: number; // 0-23
  avgEngagementRate: number;
  postCount: number;
}

export interface TopPost {
  contentItemId: string;
  platform: string;
  contentType: string;
  title: string;
  publishedAt: string;
  engagements: number;
  engagementRate: number;
  reach: number;
  impressions: number;
  thumbnailUrl?: string;
  platformPostUrl?: string;
}

export interface ClientComparison {
  clientId: string;
  clientName: string;
  totalReach: number;
  avgEngagementRate: number;
  totalEngagements: number;
  followerGrowthTotal: number;
  topPlatform: string;
}

// ─── Aggregate response shape (from analytics API) ───────────────────────────

export interface AnalyticsSummary {
  clientId: string;
  period: { start: string; end: string };
  totals: {
    impressions: number;
    reach: number;
    engagements: number;
    engagementRate: number;
    followerGrowth: number;
    videoViews: number;
    clickThroughRate: number;
  };
  dailyTimeSeries: DailyMetrics[];
  platformBreakdown: PlatformSummary[];
  contentTypeBreakdown: ContentTypeSummary[];
  postingHeatmap: PostingHeatmapCell[];
  topPosts: TopPost[];
  learningInsights: string[];
}

// ─── Demo data generator (used by seed:demo-analytics) ───────────────────────

export function generateDemoMetrics(
  clientId: string,
  days = 30,
  platforms: AnalyticsPlatform[] = ["instagram", "tiktok", "facebook"]
): DailyMetrics[] {
  const metrics: DailyMetrics[] = [];
  const now = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0]!;

    for (const platform of platforms) {
      // Simulate realistic growth trend with noise
      const growth = 1 + (days - d) / days * 0.3;
      const noise = () => 0.8 + Math.random() * 0.4;

      const baseImpressions: Record<string, number> = {
        instagram: 2400,
        tiktok: 8000,
        facebook: 1200,
        linkedin: 800,
        youtube: 1500,
        pinterest: 600,
      };

      const base = (baseImpressions[platform] ?? 1000) * growth * noise();

      const impressions = Math.round(base);
      const reach = Math.round(impressions * (0.65 + Math.random() * 0.2));
      const engagementRate = 0.025 + Math.random() * 0.055; // 2.5–8%
      const engagements = Math.round(reach * engagementRate);
      const followerGrowth = Math.round(reach * 0.003 * noise());
      const videoViews = platform === "tiktok" || platform === "instagram"
        ? Math.round(impressions * 0.6 * noise())
        : 0;
      const videoCompletionRate = videoViews > 0 ? 0.3 + Math.random() * 0.5 : 0;
      const clickThroughRate = 0.005 + Math.random() * 0.02;

      metrics.push({
        date: dateStr,
        platform,
        impressions,
        reach,
        engagements,
        engagementRate,
        followerGrowth,
        videoViews,
        videoCompletionRate,
        clickThroughRate,
      });
    }
  }

  return metrics;
}

export function buildHeatmap(): PostingHeatmapCell[] {
  const heatmap: PostingHeatmapCell[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isBusinessHour = hour >= 9 && hour <= 17;
      const isEvening = hour >= 19 && hour <= 22;
      const isWeekday = day >= 1 && day <= 5;

      let base = 0.02;
      if (isBusinessHour && isWeekday) base = 0.05;
      if (isEvening) base = 0.06;
      if (day === 2 || day === 3) base *= 1.2;
      const avgEngagementRate = base + Math.random() * 0.02;

      heatmap.push({
        dayOfWeek: day,
        hourOfDay: hour,
        avgEngagementRate,
        postCount: Math.floor(Math.random() * 8),
      });
    }
  }

  return heatmap;
}

export function aggregatePlatformSummaries(metrics: DailyMetrics[]): PlatformSummary[] {
  const byPlatform = new Map<string, DailyMetrics[]>();
  for (const m of metrics) {
    const arr = byPlatform.get(m.platform) ?? [];
    arr.push(m);
    byPlatform.set(m.platform, arr);
  }

  const summaries: PlatformSummary[] = [];
  for (const [platform, ms] of byPlatform.entries()) {
    const total = (key: keyof DailyMetrics) =>
      ms.reduce((sum, m) => sum + (m[key] as number), 0);
    const avg = (key: keyof DailyMetrics) => total(key) / ms.length;

    summaries.push({
      platform,
      totalImpressions: total("impressions"),
      totalReach: total("reach"),
      totalEngagements: total("engagements"),
      avgEngagementRate: avg("engagementRate"),
      followerGrowthTotal: total("followerGrowth"),
    });
  }

  return summaries.sort((a, b) => b.totalEngagements - a.totalEngagements);
}

export function buildContentTypeBreakdown(
  totalPosts = 24
): ContentTypeSummary[] {
  const types = ["post", "carousel", "reel", "story"];
  const weights = [0.35, 0.25, 0.3, 0.1];

  return types.map((contentType, i) => ({
    contentType,
    count: Math.round(totalPosts * (weights[i] ?? 0.25)),
    avgEngagementRate: 0.03 + (i === 2 ? 0.03 : 0) + Math.random() * 0.02,
    totalReach: Math.round(50000 * (weights[i] ?? 0.25) * (0.8 + Math.random() * 0.4)),
  }));
}

export function computeOverallSummary(metrics: DailyMetrics[]): AnalyticsSummary["totals"] {
  const sum = (key: keyof DailyMetrics) =>
    metrics.reduce((acc, m) => acc + (m[key] as number), 0);

  return {
    impressions: sum("impressions"),
    reach: sum("reach"),
    engagements: sum("engagements"),
    engagementRate: metrics.length > 0 ? sum("engagementRate") / metrics.length : 0,
    followerGrowth: sum("followerGrowth"),
    videoViews: sum("videoViews"),
    clickThroughRate: metrics.length > 0 ? sum("clickThroughRate") / metrics.length : 0,
  };
}
