export const analyticsDomains = [
  "content",
  "community",
  "audience",
  "lead",
  "funnel",
  "reporting"
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
  "funnel_conversions"
] as const;

export type AnalyticsDomain = (typeof analyticsDomains)[number];
export type MetricName = (typeof metricNames)[number];