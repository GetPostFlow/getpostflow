import { describe, it, expect } from "vitest";
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
import { RedditAutoResponseBlockedError } from "../src/connector.js";

// ─── Registry: correct class per platform ─────────────────────────────────────

describe("getConnector – registry returns correct connector class", () => {
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
  ] as const)("getConnector('%s') returns an instance of the correct class", (platform, ExpectedClass) => {
    const connector = getConnector(platform);
    expect(connector).toBeInstanceOf(ExpectedClass);
  });

  it("returns a connector with the expected platform property", () => {
    const connector = getConnector("facebook");
    expect(connector.platform).toBe("facebook");
  });
});

// ─── Reddit: auto-response always blocked ─────────────────────────────────────

describe("RedditConnector – auto-response policy enforcement", () => {
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

  it("replyToMessage via registry also throws RedditAutoResponseBlockedError", async () => {
    const connector = getConnector("reddit");
    await expect(
      connector.replyToMessage("thread-789", "auto reply attempt")
    ).rejects.toThrow(RedditAutoResponseBlockedError);
  });
});
