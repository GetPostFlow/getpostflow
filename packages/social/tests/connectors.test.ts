import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getConnector } from "../src/registry.js";
import { RedditConnector } from "../src/connectors/reddit.js";
import { FacebookConnector } from "../src/connectors/facebook.js";
import { InstagramConnector } from "../src/connectors/instagram.js";
import { TikTokConnector } from "../src/connectors/tiktok.js";
import { YouTubeConnector } from "../src/connectors/youtube.js";
import { YouTubeShortsConnector } from "../src/connectors/youtube-shorts.js";
import { LinkedInConnector } from "../src/connectors/linkedin.js";
import { PinterestConnector } from "../src/connectors/pinterest.js";
import { DiscordConnector } from "../src/connectors/discord.js";
import { RedditAutoResponseBlockedError, NotImplementedError } from "../src/connector.js";
import {
  AyrshareFacebookConnector,
  AyrshareInstagramConnector,
  AyrshareTikTokConnector,
  AyrshareYouTubeConnector,
  AyrshareYouTubeShortsConnector,
  AyrshareLinkedInConnector,
  AyrsharePinterestConnector,
  AyrshareRedditConnector,
  AyrshareDiscordConnector,
} from "../src/connectors/ayrshare/index.js";
import * as clientModule from "../src/connectors/ayrshare/client.js";

// ─── Helper: set / clear env vars ─────────────────────────────────────────────

function withEnv(vars: Record<string, string>, fn: () => void) {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k];
    process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, prev] of Object.entries(saved)) {
      if (prev === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = prev;
      }
    }
  }
}

// ─── Registry: default provider = ayrshare ────────────────────────────────────

describe("getConnector – default provider is ayrshare", () => {
  beforeEach(() => {
    // Ensure no provider env vars are set
    delete process.env.SOCIAL_PROVIDER_DEFAULT;
    delete process.env.SOCIAL_PROVIDER_FACEBOOK;
    delete process.env.SOCIAL_PROVIDER_REDDIT;
  });

  it.each([
    ["facebook", AyrshareFacebookConnector],
    ["instagram", AyrshareInstagramConnector],
    ["tiktok", AyrshareTikTokConnector],
    ["youtube", AyrshareYouTubeConnector],
    ["youtube-shorts", AyrshareYouTubeShortsConnector],
    ["linkedin", AyrshareLinkedInConnector],
    ["pinterest", AyrsharePinterestConnector],
    ["reddit", AyrshareRedditConnector],
    ["discord", AyrshareDiscordConnector],
  ] as const)(
    "getConnector('%s') returns Ayrshare connector by default",
    (platform, ExpectedClass) => {
      const connector = getConnector(platform);
      expect(connector).toBeInstanceOf(ExpectedClass);
    }
  );
});

// ─── Registry: opts.provider = 'direct' override ─────────────────────────────

describe("getConnector – opts.provider = 'direct' override", () => {
  it.each([
    ["facebook", FacebookConnector],
    ["instagram", InstagramConnector],
    ["tiktok", TikTokConnector],
    ["youtube", YouTubeConnector],
    ["youtube-shorts", YouTubeShortsConnector],
    ["linkedin", LinkedInConnector],
    ["pinterest", PinterestConnector],
    ["reddit", RedditConnector],
    ["discord", DiscordConnector],
  ] as const)(
    "getConnector('%s', { provider: 'direct' }) returns direct connector",
    (platform, ExpectedClass) => {
      const connector = getConnector(platform, { provider: "direct" });
      expect(connector).toBeInstanceOf(ExpectedClass);
    }
  );
});

// ─── Registry: env-based provider overrides ───────────────────────────────────

describe("getConnector – env-based provider override", () => {
  it("SOCIAL_PROVIDER_DEFAULT=direct switches all platforms to direct", () => {
    withEnv({ SOCIAL_PROVIDER_DEFAULT: "direct" }, () => {
      expect(getConnector("facebook")).toBeInstanceOf(FacebookConnector);
      expect(getConnector("instagram")).toBeInstanceOf(InstagramConnector);
    });
  });

  it("SOCIAL_PROVIDER_FACEBOOK=direct overrides only facebook", () => {
    withEnv(
      { SOCIAL_PROVIDER_DEFAULT: "ayrshare", SOCIAL_PROVIDER_FACEBOOK: "direct" },
      () => {
        expect(getConnector("facebook")).toBeInstanceOf(FacebookConnector);
        expect(getConnector("instagram")).toBeInstanceOf(AyrshareInstagramConnector);
      }
    );
  });

  it("SOCIAL_PROVIDER_REDDIT=direct overrides only reddit", () => {
    withEnv({ SOCIAL_PROVIDER_REDDIT: "direct" }, () => {
      expect(getConnector("reddit")).toBeInstanceOf(RedditConnector);
      expect(getConnector("facebook")).toBeInstanceOf(AyrshareFacebookConnector);
    });
  });

  it("per-platform env wins over SOCIAL_PROVIDER_DEFAULT", () => {
    withEnv(
      {
        SOCIAL_PROVIDER_DEFAULT: "direct",
        SOCIAL_PROVIDER_TIKTOK: "ayrshare",
      },
      () => {
        expect(getConnector("tiktok")).toBeInstanceOf(AyrshareTikTokConnector);
        expect(getConnector("linkedin")).toBeInstanceOf(LinkedInConnector);
      }
    );
  });

  it("opts.provider always wins over env vars", () => {
    withEnv({ SOCIAL_PROVIDER_FACEBOOK: "direct" }, () => {
      // caller force-selects ayrshare even though env says direct
      expect(getConnector("facebook", { provider: "ayrshare" })).toBeInstanceOf(
        AyrshareFacebookConnector
      );
    });
  });
});

// ─── Reddit: auto-response HARD BLOCK via direct connector ───────────────────

describe("RedditConnector (direct) – auto-response policy enforcement", () => {
  it("replyToMessage throws RedditAutoResponseBlockedError", async () => {
    const connector = new RedditConnector();
    await expect(
      connector.replyToMessage("thread-123", "hi there")
    ).rejects.toThrow(RedditAutoResponseBlockedError);
  });

  it("replyToMessage error has correct name", async () => {
    const connector = new RedditConnector();
    try {
      await connector.replyToMessage("thread-456", "test");
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as Error).name).toBe("RedditAutoResponseBlockedError");
    }
  });

  it("replyToMessage via direct registry also throws RedditAutoResponseBlockedError", async () => {
    const connector = getConnector("reddit", { provider: "direct" });
    await expect(
      connector.replyToMessage("thread-789", "auto reply attempt")
    ).rejects.toThrow(RedditAutoResponseBlockedError);
  });
});

// ─── Reddit: auto-response HARD BLOCK via Ayrshare connector ─────────────────

describe("AyrshareRedditConnector – auto-response policy enforcement", () => {
  it("replyToMessage throws RedditAutoResponseBlockedError even via Ayrshare path", async () => {
    const connector = new AyrshareRedditConnector();
    await expect(
      connector.replyToMessage("thread-ayrshare", "auto reply")
    ).rejects.toThrow(RedditAutoResponseBlockedError);
  });

  it("error name is RedditAutoResponseBlockedError", async () => {
    const connector = new AyrshareRedditConnector();
    await expect(
      connector.replyToMessage("t-1", "reply")
    ).rejects.toMatchObject({ name: "RedditAutoResponseBlockedError" });
  });

  it("getConnector('reddit') (default ayrshare) also throws RedditAutoResponseBlockedError", async () => {
    delete process.env.SOCIAL_PROVIDER_REDDIT;
    delete process.env.SOCIAL_PROVIDER_DEFAULT;
    const connector = getConnector("reddit");
    await expect(
      connector.replyToMessage("t-2", "attempt")
    ).rejects.toThrow(RedditAutoResponseBlockedError);
  });
});

// ─── Ayrshare connectors: publishPost calls correct endpoint ─────────────────

describe("Ayrshare connectors – publishPost calls POST /post with correct platform", () => {
  const FAKE_POST_RESPONSE = {
    id: "ayr-post-123",
    status: "success",
    postIds: [{ platform: "facebook", id: "fb-post-456", postUrl: "https://fb.com/p/456" }],
  };

  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.AYRSHARE_API_KEY = "test-api-key";
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => FAKE_POST_RESPONSE,
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    delete process.env.AYRSHARE_API_KEY;
  });

  const postPayload = {
    orgId: "org-1",
    text: "Hello world",
    hashtags: ["test"],
  };

  it.each([
    ["facebook", AyrshareFacebookConnector, "facebook"],
    ["instagram", AyrshareInstagramConnector, "instagram"],
    ["tiktok", AyrshareTikTokConnector, "tiktok"],
    ["linkedin", AyrshareLinkedInConnector, "linkedin"],
    ["pinterest", AyrsharePinterestConnector, "pinterest"],
    ["reddit", AyrshareRedditConnector, "reddit"],
    ["discord", AyrshareDiscordConnector, "discord"],
  ] as const)(
    "%s connector publishPost sends platforms:[%s]",
    async (_label, ConnectorClass, expectedPlatform) => {
      // Mock postIds to match current platform
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "ayr-123",
          status: "success",
          postIds: [{ platform: expectedPlatform, id: "pid-1" }],
        }),
      } as Response);

      const connector = new ConnectorClass();
      const result = await connector.publishPost(postPayload);

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0]!;
      expect(url).toContain("/post");
      const body = JSON.parse((init as RequestInit).body as string);
      expect(body.platforms).toContain(expectedPlatform);
      expect(result.platformPostId).toBe("pid-1");
    }
  );

  it("YouTube connector publishPost sends platforms:['youtube'] with isVideo:true", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "ayr-yt",
        status: "success",
        postIds: [{ platform: "youtube", id: "yt-123" }],
      }),
    } as Response);

    const connector = new AyrshareYouTubeConnector();
    await connector.publishPost({ ...postPayload, media: [] });

    const [, init] = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.platforms).toContain("youtube");
    expect(body.isVideo).toBe(true);
  });

  it("YouTube Shorts connector sets youTubeOptions.shorts = true", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "ayr-shorts",
        status: "success",
        postIds: [{ platform: "youtube", id: "shorts-123" }],
      }),
    } as Response);

    const connector = new AyrshareYouTubeShortsConnector();
    await connector.publishPost(postPayload);

    const [, init] = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.youTubeOptions?.shorts).toBe(true);
    expect(connector.platform).toBe("youtube-shorts");
  });

  it("publishPost text includes hashtags", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "ayr-fb",
        status: "success",
        postIds: [{ platform: "facebook", id: "fb-1" }],
      }),
    } as Response);

    const connector = new AyrshareFacebookConnector();
    await connector.publishPost({ orgId: "o1", text: "Post text", hashtags: ["launch", "v1"] });

    const [, init] = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.post).toContain("#launch");
    expect(body.post).toContain("#v1");
  });
});

// ─── Ayrshare connectors: schedulePost ───────────────────────────────────────

describe("Ayrshare connectors – schedulePost sends scheduleDate", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  const SCHEDULE_TIME = new Date("2026-06-01T10:00:00Z").getTime();

  beforeEach(() => {
    process.env.AYRSHARE_API_KEY = "test-api-key";
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "sched-1", status: "scheduled", postIds: [] }),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    delete process.env.AYRSHARE_API_KEY;
  });

  it("Facebook schedulePost sends scheduleDate in ISO 8601", async () => {
    const connector = new AyrshareFacebookConnector();
    const result = await connector.schedulePost(
      { orgId: "o1", text: "Scheduled post" },
      SCHEDULE_TIME
    );

    const [, init] = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.scheduleDate).toBe(new Date(SCHEDULE_TIME).toISOString());
    expect(result.scheduledFor).toBe(SCHEDULE_TIME);
    expect(result.platformScheduleId).toBe("sched-1");
  });
});

// ─── Ayrshare connectors: NotImplemented where expected ──────────────────────

describe("Ayrshare connectors – NotImplementedError on unsupported methods", () => {
  it("Instagram fetchInbox throws NotImplementedError", async () => {
    const c = new AyrshareInstagramConnector();
    await expect(c.fetchInbox("org-1", 0)).rejects.toThrow(NotImplementedError);
  });

  it("TikTok fetchInbox throws NotImplementedError", async () => {
    const c = new AyrshareTikTokConnector();
    await expect(c.fetchInbox("org-1", 0)).rejects.toThrow(NotImplementedError);
  });

  it("LinkedIn fetchInbox throws NotImplementedError", async () => {
    const c = new AyrshareLinkedInConnector();
    await expect(c.fetchInbox("org-1", 0)).rejects.toThrow(NotImplementedError);
  });

  it("Pinterest fetchInbox throws NotImplementedError", async () => {
    const c = new AyrsharePinterestConnector();
    await expect(c.fetchInbox("org-1", 0)).rejects.toThrow(NotImplementedError);
  });

  it("Discord fetchAnalytics throws NotImplementedError", async () => {
    const c = new AyrshareDiscordConnector();
    await expect(
      c.fetchAnalytics("post-1", { from: 0, to: 1 })
    ).rejects.toThrow(NotImplementedError);
  });
});

// ─── Ayrshare client: bearer auth header ─────────────────────────────────────

describe("Ayrshare client – bearer auth header", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.AYRSHARE_API_KEY = "my-secret-key";
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "r1", status: "ok", postIds: [] }),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    delete process.env.AYRSHARE_API_KEY;
  });

  it("sends Authorization: Bearer <AYRSHARE_API_KEY>", async () => {
    await clientModule.postContent({ post: "test", platforms: ["facebook"] });
    const [, init] = fetchSpy.mock.calls[0]!;
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer my-secret-key");
  });

  it("throws AyrshareApiError on non-ok response", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    } as unknown as Response);

    await expect(
      clientModule.postContent({ post: "fail", platforms: ["facebook"] })
    ).rejects.toMatchObject({ name: "AyrshareApiError", statusCode: 401 });
  });

  it("sends Profile-Key header when profileKey is provided", async () => {
    await clientModule.postContent(
      { post: "test", platforms: ["instagram"] },
      "pk-profile-abc"
    );
    const [, init] = fetchSpy.mock.calls[0]!;
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers["Profile-Key"]).toBe("pk-profile-abc");
  });
});
