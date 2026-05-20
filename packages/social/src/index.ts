export const launchPlatforms = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "YouTube Shorts",
  "LinkedIn",
  "Pinterest",
  "Reddit",
  "Discord",
] as const;

export type SocialConnectorContract = {
  authorize: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchContent: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  publishContent: () => Promise<void>;
  sendReply: () => Promise<void>;
  syncAnalytics: () => Promise<void>;
  subscribeWebhooks: () => Promise<void>;
};

export * from "./policies";
export * from "./types";
export * from "./connector";
export * from "./registry";

// ─── Direct connectors ────────────────────────────────────────────────────────
export * from "./connectors/facebook";
export * from "./connectors/instagram";
export * from "./connectors/tiktok";
export * from "./connectors/youtube";
export * from "./connectors/youtube-shorts";
export * from "./connectors/linkedin";
export * from "./connectors/pinterest";
export * from "./connectors/reddit";
export * from "./connectors/discord";

// ─── Ayrshare connectors ──────────────────────────────────────────────────────
export * from "./connectors/ayrshare/index";
