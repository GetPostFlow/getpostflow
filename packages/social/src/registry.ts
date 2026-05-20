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

export type PlatformKey =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "youtube-shorts"
  | "linkedin"
  | "pinterest"
  | "reddit"
  | "discord";

export type SocialProvider = "ayrshare" | "direct";

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
};

// ─── Provider resolution ──────────────────────────────────────────────────────

/**
 * Resolve the active provider for a given platform by consulting:
 *  1. opts.provider if explicitly supplied by the caller
 *  2. SOCIAL_PROVIDER_<PLATFORM> env var (e.g. SOCIAL_PROVIDER_REDDIT=direct)
 *  3. SOCIAL_PROVIDER_DEFAULT env var
 *  4. Hard default: "ayrshare" (v1 launch default)
 */
function resolveProvider(
  platform: PlatformKey,
  opts?: { provider?: SocialProvider }
): SocialProvider {
  if (opts?.provider) return opts.provider;

  const envKey = `SOCIAL_PROVIDER_${platform.toUpperCase().replace(/-/g, "_")}`;
  const perPlatform =
    typeof process !== "undefined" && process.env?.[envKey];
  if (perPlatform === "direct" || perPlatform === "ayrshare") {
    return perPlatform;
  }

  const defaultProvider =
    typeof process !== "undefined" && process.env?.SOCIAL_PROVIDER_DEFAULT;
  if (defaultProvider === "direct" || defaultProvider === "ayrshare") {
    return defaultProvider;
  }

  return "ayrshare"; // v1 launch default
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a connector instance for the given platform.
 *
 * Provider selection order:
 *  1. opts.provider (caller override)
 *  2. SOCIAL_PROVIDER_<PLATFORM> env var
 *  3. SOCIAL_PROVIDER_DEFAULT env var
 *  4. "ayrshare" (v1 default — switches automatically once per-platform
 *     direct API approvals come through)
 *
 * @example
 *   // Use default (ayrshare in v1):
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
  const registry = provider === "direct" ? directRegistry : ayrshareRegistry;
  const Ctor = registry[platform];
  if (!Ctor) {
    throw new Error(`No connector registered for platform: ${platform}`);
  }
  return new Ctor();
}

export { directRegistry, ayrshareRegistry };

/**
 * @deprecated Use getConnector(platform) which now defaults to ayrshare.
 * Kept for backwards compatibility — will be removed when all call sites
 * are updated.
 */
export const connectorRegistry = directRegistry;
