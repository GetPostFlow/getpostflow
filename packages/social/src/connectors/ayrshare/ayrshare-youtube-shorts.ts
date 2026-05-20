import type { Connector } from "../../connector";
import type {
  PostPayload,
  PublishResult,
  ScheduleResult,
} from "../../types";
import { postContent } from "./client";
import { AyrshareYouTubeConnector } from "./ayrshare-youtube";

/**
 * YouTube Shorts connector backed by Ayrshare.
 *
 * Extends AyrshareYouTubeConnector and sets youTubeOptions.shorts = true.
 * All other behaviour (analytics, inbox, reply) is inherited from the
 * base YouTube connector.
 *
 * Ayrshare support level matches YouTube above, with the shorts flag set.
 */
export class AyrshareYouTubeShortsConnector
  extends AyrshareYouTubeConnector
  implements Connector
{
  override readonly platform = "youtube-shorts";
  protected override readonly _ayrsharePlatform = "youtube";

  override async publishPost(post: PostPayload): Promise<PublishResult> {
    const meta = post.platformMeta ?? {};
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["youtube"],
      mediaUrls: post.media?.map((m) => m.url),
      isVideo: true,
      youTubeOptions: {
        title: (meta["title"] as string | undefined) ?? post.text.slice(0, 100),
        description: (meta["description"] as string | undefined) ?? post.text,
        visibility:
          (meta["visibility"] as "public" | "private" | "unlisted" | undefined) ??
          "public",
        madeForKids: (meta["madeForKids"] as boolean | undefined) ?? false,
        shorts: true,
      },
    });

    const pid = extractPlatformPostId(res, "youtube");
    return {
      platformPostId: pid,
      publishedAt: Date.now(),
      raw: res as Record<string, unknown>,
    };
  }

  override async schedulePost(post: PostPayload, when: number): Promise<ScheduleResult> {
    const meta = post.platformMeta ?? {};
    const res = await postContent({
      post: buildPostText(post),
      platforms: ["youtube"],
      mediaUrls: post.media?.map((m) => m.url),
      scheduleDate: new Date(when).toISOString(),
      isVideo: true,
      youTubeOptions: {
        title: (meta["title"] as string | undefined) ?? post.text.slice(0, 100),
        description: (meta["description"] as string | undefined) ?? post.text,
        visibility:
          (meta["visibility"] as "public" | "private" | "unlisted" | undefined) ??
          "public",
        shorts: true,
      },
    });

    return {
      platformScheduleId: res.id,
      scheduledFor: when,
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
