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
} from "./client";

/**
 * Pinterest connector backed by Ayrshare.
 *
 * Ayrshare support level for Pinterest:
 *  - publishPost:    full (image Pin with optional boardId, link, altText)
 *  - schedulePost:   full
 *  - fetchAnalytics: partial (impressions, saves, clicks — no audience data)
 *  - fetchInbox:     not supported — Pinterest has no inbox/DM concept
 *  - replyToMessage: not supported — throws NotImplementedError
 *
 * Migration note: Direct Pinterest API adds richer board management.
 */
export class AyrsharePinterestConnector implements Connector {
  readonly platform = "pinterest";

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
      platforms: ["pinterest"],
      mediaUrls: post.media?.map((m) => m.url),
      pinterestOptions: {
        boardId: meta["boardId"] as string | undefined,
        link: meta["link"] as string | undefined,
        altText: post.media?.[0]?.altText,
      },
    });

    const pid = extractPlatformPostId(res, "pinterest");
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
      platforms: ["pinterest"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      pinterestOptions: {
        boardId: meta["boardId"] as string | undefined,
        link: meta["link"] as string | undefined,
        altText: post.media?.[0]?.altText,
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, ["pinterest"]);
    const metrics = res.analytics?.["pinterest"] ?? [];
    return {
      postId,
      range,
      metrics: metrics.map((m) => ({ name: m.name, value: m.value })),
      raw: res as Record<string, unknown>,
    };
  }

  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    // Pinterest has no inbox / DM API surface.
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
