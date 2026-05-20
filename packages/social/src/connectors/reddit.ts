import { NotImplementedError, RedditAutoResponseBlockedError } from "../connector";
import type { Connector } from "../connector";
import type {
  OAuthTokens,
  PostPayload,
  PublishResult,
  ScheduleResult,
  DateRange,
  AnalyticsBundle,
  Message,
  ReplyResult,
} from "../types";

/**
 * Reddit connector.
 *
 * POLICY: All Reddit interactions require human approval in v1.
 * replyToMessage and any auto-engagement path MUST throw
 * RedditAutoResponseBlockedError — never auto-respond on Reddit.
 */
export class RedditConnector implements Connector {
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

  /**
   * HARD BLOCK — Reddit auto-responses are prohibited in v1.
   * This method always throws RedditAutoResponseBlockedError regardless of
   * the caller's intent or any global category policy that would normally
   * allow auto-responses on other platforms.
   */
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new RedditAutoResponseBlockedError();
  }
}
