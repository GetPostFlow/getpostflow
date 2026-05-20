import { NotImplementedError, RedditAutoResponseBlockedError } from "../../connector";
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
import {
  postContent,
  getAnalytics,
} from "./client";

/**
 * Reddit connector backed by Ayrshare.
 *
 * POLICY: All Reddit interactions require human approval in v1.
 * replyToMessage MUST throw RedditAutoResponseBlockedError — never auto-respond
 * on Reddit, regardless of the underlying transport (direct or Ayrshare).
 *
 * Ayrshare support level for Reddit:
 *  - publishPost:    full (text post or link; subreddit via redditOptions)
 *  - schedulePost:   full
 *  - fetchAnalytics: limited (upvotes, comments count only)
 *  - fetchInbox:     not supported via Ayrshare; throws NotImplementedError
 *  - replyToMessage: HARD BLOCK — RedditAutoResponseBlockedError
 *
 * Migration note: Direct Reddit API needed for inbox polling, comment threads,
 * and modmail. Move to direct connector once API approval is in place.
 */
export class AyrshareRedditConnector implements Connector {
  readonly platform = "reddit";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }

  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }

  async publishPost(post: PostPayload): Promise<PublishResult> {
    const meta = post.platformMeta ?? {};
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["reddit"],
      mediaUrls: post.media?.map((m) => m.url),
      redditOptions: {
        subreddit: meta["subreddit"] as string | undefined,
        title: (meta["title"] as string | undefined) ?? post.text.slice(0, 300),
      },
    });

    const pid = extractPlatformPostId(res, "reddit");
    return {
      platformPostId: pid,
      publishedAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
  }

  async schedulePost(post: PostPayload, when: number): Promise<ScheduleResult> {
    const meta = post.platformMeta ?? {};
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["reddit"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      redditOptions: {
        subreddit: meta["subreddit"] as string | undefined,
        title: (meta["title"] as string | undefined) ?? post.text.slice(0, 300),
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, ["reddit"]);
    const metrics = res.analytics?.["reddit"] ?? [];
    return {
      postId,
      range,
      metrics: metrics.map((m) => ({ name: m.name, value: m.value })),
      raw: res as Record<string, unknown>,
    };
  }

  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }

  /**
   * HARD BLOCK — Reddit auto-responses are prohibited in v1.
   * This method always throws RedditAutoResponseBlockedError regardless of
   * the provider (direct or Ayrshare) and any other policy that would normally
   * allow auto-responses.
   */
  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new RedditAutoResponseBlockedError();
  }
}

function buildPostText(post: PostPayload): string {
  const tags =
    post.hashtags && post.hashtags.length > 0
      ? "\n" + post.hashtags.map((t) => `#${t}`).join(" ")
      : "";
  return `${post.text}${tags}`;
}

function extractPlatformPostId(
  res: { postIds?: Array<{ platform: string; id: string; postUrl?: string }> },
  platform: string
): string {
  const entry = res.postIds?.find((p) => p.platform === platform);
  return entry?.id ?? res.postIds?.[0]?.id ?? "unknown";
}
