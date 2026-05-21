import type { Connector } from "./connector";
import { FacebookConnector } from "./connectors/facebook";
import { InstagramConnector } from "./connectors/instagram";
import { TikTokConnector } from "./connectors/tiktok";
import { YouTubeConnector } from "./connectors/youtube";
import { YouTubeShortsConnector } from "./connectors/youtube-shorts";
import { LinkedInConnector } from "./connectors/linkedin";
import { PinterestConnector } from "./connectors/pinterest";
import { RedditConnector } from "./connectors/reddit";
import { DiscordConnector } from "./connectors/discord";
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
} from "./connectors/ayrshare/index";
import {
  BufferFacebookConnector,
  BufferInstagramConnector,
  BufferLinkedInConnector,
  BufferPinterestConnector,
  BufferTwitterConnector,
  BufferYouTubeConnector,
  BufferYouTubeShortsConnector,
  BufferTikTokConnector,
  BufferRedditConnector,
  BufferDiscordConnector,
} from "./connectors/buffer/index";

export type PlatformKey =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "youtube-shorts"
  | "linkedin"
  | "pinterest"
  | "reddit"
  | "discord"
  | "twitter";

export type SocialProvider = "ayrshare" | "direct" | "buffer";

// ─── Connector constructor maps ───────────────────────────────────────────────

type ConnectorConstructor = new () => Connector;

const directRegistry: Record<PlatformKey, ConnectorConstructor> = {
  facebook: FacebookConnector,
  instagram: InstagramConnector,
  tiktok: TikTokConnector,
  youtube: YouTubeConnector,
  "youtube-shorts": YouTubeShortsConnector,
  linkedin: LinkedInConnector,
  pinterest: PinterestConnector,
  reddit: RedditConnector,
  discord: DiscordConnector,
  twitter: FacebookConnector, // placeholder — no direct Twitter connector yet; falls back to direct Facebook stub
};

const ayrshareRegistry: Record<PlatformKey, ConnectorConstructor> = {
  facebook: AyrshareFacebookConnector,
  instagram: AyrshareInstagramConnector,
  tiktok: AyrshareTikTokConnector,
  youtube: AyrshareYouTubeConnector,
  "youtube-shorts": AyrshareYouTubeShortsConnector,
  linkedin: AyrshareLinkedInConnector,
  pinterest: AyrsharePinterestConnector,
  reddit: AyrshareRedditConnector,
  discord: AyrshareDiscordConnector,
  twitter: AyrshareFacebookConnector, // Ayrshare supports twitter; typed as AyrshareFacebook until twitter connector added
};

const bufferRegistry: Record<PlatformKey, ConnectorConstructor> = {
  facebook: BufferFacebookConnector,
  instagram: BufferInstagramConnector,
  tiktok: BufferTikTokConnector,
  youtube: BufferYouTubeConnector,
  "youtube-shorts": BufferYouTubeShortsConnector,
  linkedin: BufferLinkedInConnector,
  pinterest: BufferPinterestConnector,
  reddit: BufferRedditConnector,
  discord: BufferDiscordConnector,
  twitter: BufferTwitterConnector,
};

// ─── Provider resolution ──────────────────────────────────────────────────────

/**
 * Resolve the active provider for a given platform by consulting:
 *  1. opts.provider if explicitly supplied by the caller
 *  2. SOCIAL_PROVIDER_<PLATFORM> env var (e.g. SOCIAL_PROVIDER_REDDIT=direct)
 *  3. SOCIAL_PROVIDER_DEFAULT env var
 *  4. Hard default: "buffer" (v2 launch default — swapped from ayrshare)
 */
function resolveProvider(
  platform: PlatformKey,
  opts?: { provider?: SocialProvider }
): SocialProvider {
  if (opts?.provider) return opts.provider;

  const envKey = `SOCIAL_PROVIDER_${platform.toUpperCase().replace(/-/g, "_")}`;
  const perPlatform =
    typeof process !== "undefined" && process.env?.[envKey];
  if (perPlatform === "direct" || perPlatform === "ayrshare" || perPlatform === "buffer") {
    return perPlatform;
  }

  const defaultProvider =
    typeof process !== "undefined" && process.env?.SOCIAL_PROVIDER_DEFAULT;
  if (defaultProvider === "direct" || defaultProvider === "ayrshare" || defaultProvider === "buffer") {
    return defaultProvider;
  }

  return "ayrshare"; // hard default — override with SOCIAL_PROVIDER_DEFAULT=buffer in production
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a connector instance for the given platform.
 *
 * Provider selection order:
 *  1. opts.provider (caller override)
 *  2. SOCIAL_PROVIDER_<PLATFORM> env var
 *  3. SOCIAL_PROVIDER_DEFAULT env var
 *  4. "buffer" (v2 default)
 *
 * @example
 *   // Use default (buffer in v2):
 *   getConnector("facebook")
 *
 *   // Force direct API for a specific call:
 *   getConnector("reddit", { provider: "direct" })
 *
 *   // Switch a whole platform via env:
 *   SOCIAL_PROVIDER_REDDIT=direct
 */
export function getConnector(
  platform: PlatformKey,
  opts?: { provider?: SocialProvider }
): Connector {
  const provider = resolveProvider(platform, opts);
  let registry: Record<PlatformKey, ConnectorConstructor>;
  if (provider === "buffer") {
    registry = bufferRegistry;
  } else if (provider === "direct") {
    registry = directRegistry;
  } else {
    registry = ayrshareRegistry;
  }
  const Ctor = registry[platform];
  if (!Ctor) {
    throw new Error(`No connector registered for platform: ${platform}`);
  }
  return new Ctor();
}

export { directRegistry, ayrshareRegistry, bufferRegistry };

/**
 * @deprecated Use getConnector(platform) which now defaults to buffer.
 * Kept for backwards compatibility — will be removed when all call sites
 * are updated.
 */
export const connectorRegistry = directRegistry;
