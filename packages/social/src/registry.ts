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

type ConnectorConstructor = new () => Connector;

const registry: Record<PlatformKey, ConnectorConstructor> = {
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

/**
 * Returns a connector instance for the given platform.
 * Throws if the platform is not registered.
 */
export function getConnector(platform: PlatformKey): Connector {
  const Ctor = registry[platform];
  if (!Ctor) {
    throw new Error(`No connector registered for platform: ${platform}`);
  }
  return new Ctor();
}

export { registry as connectorRegistry };
