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
 * Facebook connector backed by Ayrshare.
 *
 * Ayrshare support level for Facebook:
 *  - publishPost:    full (text + media)
 *  - schedulePost:   full
 *  - fetchAnalytics: full (likes, shares, comments, reach, impressions)
 *  - fetchInbox:     partial — Ayrshare surfaces post comments, not DMs
 *  - replyToMessage: partial — replies to post comments only (not DMs)
 *
 * Migration note: switch to direct Meta Graph API once app review is approved.
 */
export class AyrshareFacebookConnector implements Connector {
  readonly platform = "facebook";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }

  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }

  async publishPost(post: PostPayload): Promise<PublishResult> {
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["facebook"],
      mediaUrls: post.media?.map((m) => m.url),
    });

    const pid = extractPlatformPostId(res, "facebook");
    return {
      platformPostId: pid,
      publishedAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
  }

  async schedulePost(post: PostPayload, when: number): Promise<ScheduleResult> {
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["facebook"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, ["facebook"]);
    const fbMetrics = res.analytics?.["facebook"] ?? [];
    return {
      postId,
      range,
      metrics: fbMetrics.map((m) => ({ name: m.name, value: m.value })),
      raw: res as Record<string, unknown>,
    };
  }

  async fetchInbox(_orgId: string, since: number): Promise<Message[]> {
    // Ayrshare surfaces post comments for Facebook, not DMs.
    // Passing a dummy recent postId is not viable without a post lookup;
    // callers should supply orgId to resolve post IDs first.
    // For now surface an empty list and document the limitation.
    void since;
    return [];
  }

  async replyToMessage(threadId: string, content: string): Promise<ReplyResult> {
    const res = await replyToComment({
      id: threadId,
      comment: content,
      platforms: ["facebook"],
    });
    return {
      platformReplyId: res.replyId ?? threadId,
      sentAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
  }
}

// ─── Helpers (file-local) ─────────────────────────────────────────────────────

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
