import { NotImplementedError } from "../../connector";
import type { Connector } from "../../connector";
import type {
  OAuthTokens,
  PostPayload,
  PublishResult,
  ScheduleResult,
  DateRange,
  AnalyticsBundle,
  Message,
  ReplyResult,
} from "../../types";

/**
 * YouTube connector — NOT SUPPORTED by Buffer.
 *
 * Buffer does not support YouTube posting. This stub throws NotImplementedError
 * for all methods. Use the direct YouTube connector (packages/social/src/connectors/youtube.ts)
 * or wait for YouTube Data API v3 app approval.
 */
export class BufferYouTubeConnector implements Connector {
  readonly platform = "youtube";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }
  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }
  async publishPost(_post: PostPayload): Promise<PublishResult> {
    throw new NotImplementedError("publishPost", this.platform);
  }
  async schedulePost(_post: PostPayload, _when: number): Promise<ScheduleResult> {
    throw new NotImplementedError("schedulePost", this.platform);
  }
  async fetchAnalytics(_postId: string, _range: DateRange): Promise<AnalyticsBundle> {
    throw new NotImplementedError("fetchAnalytics", this.platform);
  }
  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
  }
}

/**
 * YouTube Shorts connector — NOT SUPPORTED by Buffer.
 * Same limitations as BufferYouTubeConnector.
 */
export class BufferYouTubeShortsConnector implements Connector {
  readonly platform = "youtube-shorts";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }
  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }
  async publishPost(_post: PostPayload): Promise<PublishResult> {
    throw new NotImplementedError("publishPost", this.platform);
  }
  async schedulePost(_post: PostPayload, _when: number): Promise<ScheduleResult> {
    throw new NotImplementedError("schedulePost", this.platform);
  }
  async fetchAnalytics(_postId: string, _range: DateRange): Promise<AnalyticsBundle> {
    throw new NotImplementedError("fetchAnalytics", this.platform);
  }
  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
  }
}

/**
 * TikTok connector — NOT SUPPORTED by Buffer.
 * Throws NotImplementedError for all methods. Use direct TikTok API when approved.
 */
export class BufferTikTokConnector implements Connector {
  readonly platform = "tiktok";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }
  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }
  async publishPost(_post: PostPayload): Promise<PublishResult> {
    throw new NotImplementedError("publishPost", this.platform);
  }
  async schedulePost(_post: PostPayload, _when: number): Promise<ScheduleResult> {
    throw new NotImplementedError("schedulePost", this.platform);
  }
  async fetchAnalytics(_postId: string, _range: DateRange): Promise<AnalyticsBundle> {
    throw new NotImplementedError("fetchAnalytics", this.platform);
  }
  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
  }
}

/**
 * Reddit connector — NOT SUPPORTED by Buffer.
 * Throws NotImplementedError for all methods.
 */
export class BufferRedditConnector implements Connector {
  readonly platform = "reddit";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }
  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }
  async publishPost(_post: PostPayload): Promise<PublishResult> {
    throw new NotImplementedError("publishPost", this.platform);
  }
  async schedulePost(_post: PostPayload, _when: number): Promise<ScheduleResult> {
    throw new NotImplementedError("schedulePost", this.platform);
  }
  async fetchAnalytics(_postId: string, _range: DateRange): Promise<AnalyticsBundle> {
    throw new NotImplementedError("fetchAnalytics", this.platform);
  }
  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
  }
}

/**
 * Discord connector — NOT SUPPORTED by Buffer.
 * Throws NotImplementedError for all methods.
 */
export class BufferDiscordConnector implements Connector {
  readonly platform = "discord";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }
  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }
  async publishPost(_post: PostPayload): Promise<PublishResult> {
    throw new NotImplementedError("publishPost", this.platform);
  }
  async schedulePost(_post: PostPayload, _when: number): Promise<ScheduleResult> {
    throw new NotImplementedError("schedulePost", this.platform);
  }
  async fetchAnalytics(_postId: string, _range: DateRange): Promise<AnalyticsBundle> {
    throw new NotImplementedError("fetchAnalytics", this.platform);
  }
  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
  }
}
