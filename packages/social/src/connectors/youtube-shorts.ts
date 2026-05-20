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
import { YouTubeConnector } from "./youtube";

/**
 * YouTube Shorts uses the same YouTube Data API as regular YouTube.
 * This connector extends the base YouTube connector and applies
 * Shorts-specific metadata conventions (aspect ratio, duration).
 */
export class YouTubeShortsConnector extends YouTubeConnector implements Connector {
  override readonly platform = "youtube-shorts";

  override async publishPost(_post: PostPayload): Promise<PublishResult> {
    throw new NotImplementedError("publishPost", this.platform);
  }

  override async schedulePost(_post: PostPayload, _when: number): Promise<ScheduleResult> {
    throw new NotImplementedError("schedulePost", this.platform);
  }
}
