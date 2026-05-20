export const launchPlatforms = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "YouTube Shorts",
  "LinkedIn",
  "Pinterest",
  "Reddit",
  "Discord"
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
