// ─── OAuth / Token types ────────────────────────────────────────────────────

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
  scope?: string;
  raw?: Record<string, unknown>;
}

// ─── Post payload ────────────────────────────────────────────────────────────

export type MediaType = "image" | "video" | "reel" | "short" | "story";

export interface MediaAsset {
  url: string;
  type: MediaType;
  altText?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export interface PostPayload {
  orgId: string;
  text: string;
  media?: MediaAsset[];
  locale?: string;
  hashtags?: string[];
  /** Platform-specific overrides (e.g. boardId for Pinterest, channelId for Discord) */
  platformMeta?: Record<string, unknown>;
}

// ─── Publish result ───────────────────────────────────────────────────────────

export interface PublishResult {
  platformPostId: string;
  url?: string;
  publishedAt: number; // unix ms
  raw?: Record<string, unknown>;
}

// ─── Schedule result ──────────────────────────────────────────────────────────

export interface ScheduleResult {
  platformScheduleId: string;
  scheduledFor: number; // unix ms
  raw?: Record<string, unknown>;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DateRange {
  from: number; // unix ms
  to: number;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
}

export interface AnalyticsBundle {
  postId: string;
  range: DateRange;
  metrics: AnalyticsMetric[];
  raw?: Record<string, unknown>;
}

// ─── Inbox / messages ────────────────────────────────────────────────────────

export interface Message {
  messageId: string;
  threadId: string;
  authorId: string;
  content: string;
  receivedAt: number; // unix ms
  platform: string;
  raw?: Record<string, unknown>;
}

// ─── Reply result ────────────────────────────────────────────────────────────

export interface ReplyResult {
  platformReplyId: string;
  sentAt: number; // unix ms
  raw?: Record<string, unknown>;
}
