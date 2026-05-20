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
  replyToComment,
} from "./client";

/**
 * Instagram connector backed by Ayrshare.
 *
 * Ayrshare support level for Instagram:
 *  - publishPost:    full (image, video, reel, story via instagramOptions)
 *  - schedulePost:   full
 *  - fetchAnalytics: full (likes, comments, reach, impressions, saves)
 *  - fetchInbox:     not supported via Ayrshare — Instagram DMs require
 *                    direct Messenger API; throws NotImplementedError
 *  - replyToMessage: partial — post comment replies only
 *
 * Migration note: DM inbox requires direct Meta Graph API (Messenger Platform).
 */
export class AyrshareInstagramConnector implements Connector {
  readonly platform = "instagram";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }

  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }

  async publishPost(post: PostPayload): Promise<PublishResult> {
    const isReel = post.media?.some((m) => m.type === "reel");
    const isStory = post.media?.some((m) => m.type === "story");
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["instagram"],
      mediaUrls: post.media?.map((m) => m.url),
      instagramOptions: {
        reelVideo: isReel,
        story: isStory,
      },
    });

    const pid = extractPlatformPostId(res, "instagram");
    return {
      platformPostId: pid,
      publishedAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
  }

  async schedulePost(post: PostPayload, when: number): Promise<ScheduleResult> {
    const isReel = post.media?.some((m) => m.type === "reel");
    const isStory = post.media?.some((m) => m.type === "story");
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["instagram"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      instagramOptions: {
        reelVideo: isReel,
        story: isStory,
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, ["instagram"]);
    const metrics = res.analytics?.["instagram"] ?? [];
    return {
      postId,
      range,
      metrics: metrics.map((m) => ({ name: m.name, value: m.value })),
      raw: res as Record<string, unknown>,
    };
  }

  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    // Instagram DM inbox is not available via Ayrshare.
    // Requires direct Meta Messenger Platform integration.
    throw new NotImplementedError("fetchInbox", this.platform);
  }

  async replyToMessage(threadId: string, content: string): Promise<ReplyResult> {
    const res = await replyToComment({
      id: threadId,
      comment: content,
      platforms: ["instagram"],
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
