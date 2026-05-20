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
 * LinkedIn connector backed by Ayrshare.
 *
 * Ayrshare support level for LinkedIn:
 *  - publishPost:    full (text, image, article link)
 *  - schedulePost:   full
 *  - fetchAnalytics: partial (impressions, clicks, reactions, shares)
 *  - fetchInbox:     not supported via Ayrshare — LinkedIn messaging API
 *                    is behind partner approval; throws NotImplementedError
 *  - replyToMessage: not supported — throws NotImplementedError
 *
 * Migration note: Inbox requires LinkedIn Marketing Developer Program access.
 */
export class AyrshareLinkedInConnector implements Connector {
  readonly platform = "linkedin";

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
      platforms: ["linkedin"],
      mediaUrls: post.media?.map((m) => m.url),
      linkedInOptions: {
        visibility:
          (meta["visibility"] as "PUBLIC" | "CONNECTIONS" | undefined) ?? "PUBLIC",
      },
    });

    const pid = extractPlatformPostId(res, "linkedin");
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
      platforms: ["linkedin"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      linkedInOptions: {
        visibility:
          (meta["visibility"] as "PUBLIC" | "CONNECTIONS" | undefined) ?? "PUBLIC",
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, ["linkedin"]);
    const metrics = res.analytics?.["linkedin"] ?? [];
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

  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
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
