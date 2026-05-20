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
 * TikTok connector backed by Ayrshare.
 *
 * Ayrshare support level for TikTok:
 *  - publishPost:    full (video required; tiktokOptions.privacyLevel supported)
 *  - schedulePost:   full
 *  - fetchAnalytics: partial (likes, shares, views — no full TikTok Ads data)
 *  - fetchInbox:     not supported — TikTok has no inbox API via Ayrshare
 *  - replyToMessage: not supported — throws NotImplementedError
 *
 * Migration note: Inbox/DMs require TikTok's in-review messaging API.
 */
export class AyrshareTikTokConnector implements Connector {
  readonly platform = "tiktok";

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
      platforms: ["tiktok"],
      mediaUrls: post.media?.map((m) => m.url),
      isVideo: true,
      tiktokOptions: {
        privacyLevel:
          (meta["privacyLevel"] as "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY") ??
          "PUBLIC_TO_EVERYONE",
      },
    });

    const pid = extractPlatformPostId(res, "tiktok");
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
      platforms: ["tiktok"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      isVideo: true,
      tiktokOptions: {
        privacyLevel:
          (meta["privacyLevel"] as "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY") ??
          "PUBLIC_TO_EVERYONE",
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const res = await getAnalytics(postId, ["tiktok"]);
    const metrics = res.analytics?.["tiktok"] ?? [];
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
