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
 * Discord connector backed by Ayrshare.
 *
 * Ayrshare support level for Discord:
 *  - publishPost:    full (text post to a channel via discordOptions.channelId)
 *  - schedulePost:   full
 *  - fetchAnalytics: not supported — Discord has no public analytics API
 *  - fetchInbox:     not supported — Discord DMs require bot/webhook tokens
 *  - replyToMessage: not supported — throws NotImplementedError
 *
 * Migration note: Discord interactions (threads, reactions, DMs) require
 * direct Discord bot integration. Migrate once bot is approved and deployed.
 */
export class AyrshareDiscordConnector implements Connector {
  readonly platform = "discord";

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
      platforms: ["discord"],
      mediaUrls: post.media?.map((m) => m.url),
      discordOptions: {
        channelId: meta["channelId"] as string | undefined,
      },
    });

    const pid = extractPlatformPostId(res, "discord");
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
      platforms: ["discord"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      discordOptions: {
        channelId: meta["channelId"] as string | undefined,
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(_postId: string, range: DateRange): Promise<AnalyticsBundle> {
    // Discord has no analytics API surface.
    throw new NotImplementedError("fetchAnalytics", this.platform);
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
