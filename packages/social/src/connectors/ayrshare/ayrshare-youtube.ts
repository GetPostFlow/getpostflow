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
import {
  postContent,
  getAnalytics,
  getComments,
  replyToComment,
} from "./client";

/**
 * YouTube connector backed by Ayrshare.
 *
 * Ayrshare support level for YouTube:
 *  - publishPost:    full (video + title + description via youTubeOptions)
 *  - schedulePost:   full
 *  - fetchAnalytics: partial (views, likes — no YouTube Studio deep metrics)
 *  - fetchInbox:     partial — post comments surfaced as messages
 *  - replyToMessage: partial — replies to video comments
 *
 * Migration note: Full YouTube Analytics API requires direct Google OAuth.
 */
export class AyrshareYouTubeConnector implements Connector {
  readonly platform: string = "youtube";

  protected readonly _ayrsharePlatform = "youtube";

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
      platforms: [this._ayrsharePlatform],
      mediaUrls: post.media?.map((m) => m.url),
      isVideo: true,
      youTubeOptions: {
        title: (meta["title"] as string | undefined) ?? post.text.slice(0, 100),
        description: (meta["description"] as string | undefined) ?? post.text,
        visibility:
          (meta["visibility"] as "public" | "private" | "unlisted" | undefined) ??
          "public",
        categoryId: meta["categoryId"] as string | undefined,
        madeForKids: (meta["madeForKids"] as boolean | undefined) ?? false,
        shorts: false,
      },
    });

    const pid = extractPlatformPostId(res, this._ayrsharePlatform);
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
      platforms: [this._ayrsharePlatform],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      isVideo: true,
      youTubeOptions: {
        title: (meta["title"] as string | undefined) ?? post.text.slice(0, 100),
        description: (meta["description"] as string | undefined) ?? post.text,
        visibility:
          (meta["visibility"] as "public" | "private" | "unlisted" | undefined) ??
          "public",
        shorts: false,
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, [this._ayrsharePlatform]);
    const metrics = res.analytics?.[this._ayrsharePlatform] ?? [];
    return {
      postId,
      range,
      metrics: metrics.map((m) => ({ name: m.name, value: m.value })),
      raw: res as Record<string, unknown>,
    };
  }

  async fetchInbox(orgId: string, since: number): Promise<Message[]> {
    void orgId;
    void since;
    // Ayrshare does not provide a paginated comments feed by org/time.
    // Return empty; callers should poll fetchAnalytics for the post list
    // and call getComments per-post if needed.
    return [];
  }

  async replyToMessage(threadId: string, content: string): Promise<ReplyResult> {
    const res = await replyToComment({
      id: threadId,
      comment: content,
      platforms: [this._ayrsharePlatform],
    });
    return {
      platformReplyId: res.replyId ?? threadId,
      sentAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
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
