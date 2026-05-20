import { NotImplementedError } from "../connector";
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

export class PinterestConnector implements Connector {
  readonly platform = "pinterest";

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
