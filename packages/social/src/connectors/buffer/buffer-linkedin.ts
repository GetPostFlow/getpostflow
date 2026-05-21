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
import { createUpdate, getProfiles, getUpdate } from "./client";

/**
 * LinkedIn connector backed by Buffer.
 *
 * Buffer support level for LinkedIn:
 *  - publishPost:    full (text + image)
 *  - schedulePost:   full
 *  - fetchAnalytics: partial (clicks, reach via update statistics)
 *  - fetchInbox:     not supported by Buffer — throws NotImplementedError
 *  - replyToMessage: not supported by Buffer — throws NotImplementedError
 */
export class BufferLinkedInConnector implements Connector {
  readonly platform = "linkedin";

  async authenticate(_orgId: string, _code: string): Promise<OAuthTokens> {
    throw new NotImplementedError("authenticate", this.platform);
  }

  async refreshToken(_token: OAuthTokens): Promise<OAuthTokens> {
    throw new NotImplementedError("refreshToken", this.platform);
  }

  async publishPost(post: PostPayload): Promise<PublishResult> {
    const profileId = await resolveProfileId("linkedin");
    const res = await createUpdate({
      profile_ids: [profileId],
      text: buildPostText(post),
      now: true,
      media: post.media?.[0] ? { photo: post.media[0].url } : undefined,
    });

    const update = res.updates?.[0];
    return {
      platformPostId: update?.id ?? "unknown",
      publishedAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
  }

  async schedulePost(post: PostPayload, when: number): Promise<ScheduleResult> {
    const profileId = await resolveProfileId("linkedin");
    const res = await createUpdate({
      profile_ids: [profileId],
      text: buildPostText(post),
      scheduled_at: new Date(when).toISOString(),
      media: post.media?.[0] ? { photo: post.media[0].url } : undefined,
    });

    const update = res.updates?.[0];
    return {
      platformScheduleId: update?.id ?? "unknown",
      scheduledFor: when,
      raw: res as Record<string, unknown>,
    };
  }

  async fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle> {
    const update = await getUpdate(postId);
    const stats = update.statistics ?? {};
    const metrics = Object.entries(stats).map(([name, value]) => ({
      name,
      value: typeof value === "number" ? value : 0,
    }));
    return {
      postId,
      range,
      metrics,
      raw: update as Record<string, unknown>,
    };
  }

  async fetchInbox(_orgId: string, _since: number): Promise<Message[]> {
    throw new NotImplementedError("fetchInbox", this.platform);
  }

  async replyToMessage(_threadId: string, _content: string): Promise<ReplyResult> {
    throw new NotImplementedError("replyToMessage", this.platform);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveProfileId(service: string): Promise<string> {
  const profiles = await getProfiles();
  const match = profiles.find((p) => p.service === service);
  if (!match) {
    throw new Error(
      `No Buffer profile found for service: ${service}. Connect a ${service} account in Buffer.`
    );
  }
  return match.id;
}

function buildPostText(post: PostPayload): string {
  const tags =
    post.hashtags && post.hashtags.length > 0
      ? "\n" + post.hashtags.map((t) => `#${t}`).join(" ")
      : "";
  return `${post.text}${tags}`;
}
