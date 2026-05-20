import type {
  OAuthTokens,
  PostPayload,
  PublishResult,
  ScheduleResult,
  DateRange,
  AnalyticsBundle,
  Message,
  ReplyResult,
} from "./types.js";

// ─── Errors ───────────────────────────────────────────────────────────────────

export class NotImplementedError extends Error {
  constructor(method: string, platform: string) {
    super(`${platform}.${method} is not yet implemented`);
    this.name = "NotImplementedError";
  }
}

export class RedditAutoResponseBlockedError extends Error {
  constructor() {
    super(
      "Reddit auto-responses are blocked in v1. All Reddit interactions require human approval."
    );
    this.name = "RedditAutoResponseBlockedError";
  }
}

// ─── Connector interface ──────────────────────────────────────────────────────

export interface Connector {
  readonly platform: string;

  /**
   * Exchange an OAuth authorization code for tokens and persist them for the org.
   */
  authenticate(orgId: string, code: string): Promise<OAuthTokens>;

  /**
   * Use a refresh token to obtain a fresh access token.
   */
  refreshToken(token: OAuthTokens): Promise<OAuthTokens>;

  /**
   * Publish a post immediately.
   */
  publishPost(post: PostPayload): Promise<PublishResult>;

  /**
   * Schedule a post for future publication on the platform.
   */
  schedulePost(post: PostPayload, when: number): Promise<ScheduleResult>;

  /**
   * Fetch performance analytics for a specific post over a date range.
   */
  fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle>;

  /**
   * Fetch inbox messages received since the given timestamp.
   */
  fetchInbox(orgId: string, since: number): Promise<Message[]>;

  /**
   * Reply to an inbox thread.
   * NOTE: Reddit connector MUST throw RedditAutoResponseBlockedError here.
   */
  replyToMessage(threadId: string, content: string): Promise<ReplyResult>;
}
