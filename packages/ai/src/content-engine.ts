import { route } from "./router";
import type { BrandStrategyDraft } from "./brand-strategy";

// ─── Platform types ───────────────────────────────────────────────────────────

export type SupportedPlatform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "pinterest"
  | "reddit"
  | "discord";

export type ContentType =
  | "post"
  | "carousel"
  | "reel"
  | "story"
  | "thread"
  | "ad"
  | "video_script";

// ─── Output types ─────────────────────────────────────────────────────────────

export interface PlatformSpecificMetadata {
  format: string;
  maxLength: number;
  bestTime: string;
  aspectRatio?: string;
  hashtagLimit?: number;
  linkAllowed?: boolean;
  notes?: string;
}

export interface VideoScriptSection {
  hook: string;          // 0-3s hook
  body: string;          // main content
  callToAction: string;  // CTA
  captionSuggestion: string;
  trendingAudioHashtag?: string;
}

export interface ContentDraft {
  headline: string;
  body: string;
  hashtags: string[];
  callToAction: string;
  mediaPrompts: string[];
  platformSpecific: PlatformSpecificMetadata;
  moderationFlags: string[];
  estimatedEngagement: string;
  videoScript?: VideoScriptSection;
  locale: string;
  platform: SupportedPlatform;
  contentType: ContentType;
}

// ─── Generation options ───────────────────────────────────────────────────────

export interface ContentGenerationOptions {
  locale?: string;
  topic?: string;
  tone?: string;
  campaignBrief?: string;
  includeVideoScript?: boolean;
}

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<SupportedPlatform, PlatformSpecificMetadata> = {
  facebook: {
    format: "text + link preview",
    maxLength: 63206,
    bestTime: "Wed/Thu 1-3pm",
    linkAllowed: true,
    notes: "Longer conversational posts perform well; include question for engagement",
  },
  instagram: {
    format: "visual-first + caption",
    maxLength: 2200,
    bestTime: "Tue/Wed 9-11am",
    aspectRatio: "4:5 or 1:1",
    hashtagLimit: 30,
    linkAllowed: false,
    notes: "Visual quality drives reach; hashtags in caption or first comment",
  },
  tiktok: {
    format: "short-form video script",
    maxLength: 2200,
    bestTime: "Tue-Fri 7-9pm",
    aspectRatio: "9:16",
    hashtagLimit: 10,
    notes: "Hook must land in first 3s; trending audio amplifies reach",
  },
  youtube: {
    format: "title + description + tags",
    maxLength: 5000,
    bestTime: "Thu-Sat 12-4pm",
    aspectRatio: "16:9",
    linkAllowed: true,
    notes: "Include target keyword in title and first 100 chars of description",
  },
  linkedin: {
    format: "professional post or article",
    maxLength: 3000,
    bestTime: "Tue-Thu 9-11am",
    linkAllowed: true,
    notes: "Thought leadership, results-driven stories, and carousels perform best",
  },
  pinterest: {
    format: "pin description + board",
    maxLength: 500,
    bestTime: "Fri-Sun 8-11pm",
    aspectRatio: "2:3",
    notes: "Keyword-rich descriptions; link to product/blog page",
  },
  reddit: {
    format: "community post / comment",
    maxLength: 40000,
    bestTime: "Mon-Fri 9am-12pm",
    linkAllowed: true,
    notes: "Community-appropriate tone; NEVER promotional; human approval REQUIRED",
  },
  discord: {
    format: "announcement + embed",
    maxLength: 2000,
    bestTime: "Evenings",
    notes: "Use @mentions sparingly; embed rich previews; community-first tone",
  },
};

// ─── Stub fixture ─────────────────────────────────────────────────────────────

function buildFixture(
  brand: BrandStrategyDraft,
  platform: SupportedPlatform,
  contentType: ContentType,
  opts: ContentGenerationOptions = {}
): ContentDraft {
  const locale = opts.locale ?? "en";
  const topic = opts.topic ?? brand.contentPillars[0]?.name ?? "Brand Story";
  const name = brand.positioningStatement.split(" ").slice(0, 2).join(" ");
  const platformCfg = PLATFORM_CONFIG[platform];

  const hashtagBase = (brand.hashtagStrategy[platform] ?? brand.hashtagStrategy.instagram ?? []).slice(0, 5);

  const bodyByPlatform: Partial<Record<SupportedPlatform, string>> = {
    facebook: `We believe that every ${topic.toLowerCase()} moment matters. At ${name}, we're committed to delivering the best experience for our community. What does ${topic.toLowerCase()} mean to you? Share in the comments below!`,
    instagram: `${brand.contentPillars[0]?.exampleTopics[0] ?? `Discover the magic of ${topic}`} ✨\n\nTap the link in bio to explore more. 💛`,
    tiktok: `POV: You just discovered the best thing for ${topic.toLowerCase()} 👀 #FYP`,
    youtube: `${topic}: Everything You Need to Know in 2026 | ${name}`,
    linkedin: `At ${name}, we've spent years refining our approach to ${topic.toLowerCase()}. Here's what we've learned — and what it means for the future of our industry.\n\nWhat's your take? Drop a comment below.`,
    pinterest: `${topic} inspiration you'll love. Save this pin for later and visit our page for more ideas! ✨`,
    reddit: `Hi r/community — sharing something I think many of you will find useful about ${topic.toLowerCase()}. No promotion here, just a genuine resource I wanted to share with this community.`,
    discord: `Hey everyone! We have a new update on ${topic}. Check it out and let us know what you think in the thread below!`,
  };

  const ctaByPlatform: Partial<Record<SupportedPlatform, string>> = {
    facebook: "Learn more at the link below",
    instagram: "Link in bio",
    tiktok: "Follow for more",
    youtube: "Subscribe for weekly videos",
    linkedin: "Connect with us to stay updated",
    pinterest: "Save this pin",
    reddit: "Check the comments for more details",
    discord: "React with 🎉 if you're excited",
  };

  const mediaPromptsByType: Partial<Record<ContentType, string[]>> = {
    carousel: [
      `Slide 1: Bold headline about ${topic} on brand background (#${brand.brandVoiceGuide.formalCasual > 5 ? "casual" : "professional"} tone)`,
      `Slide 2: Key statistic or benefit with clean icon`,
      `Slide 3: Customer quote or social proof`,
      `Slide 4: CTA with brand colors and logo`,
    ],
    post: [
      `Lifestyle photo showing ${topic} in context of ${name}'s brand aesthetic`,
      `Close-up product/service shot with natural lighting`,
    ],
    reel: [
      `Short punchy clip: hook shot in first 3s showing ${topic}`,
    ],
    video_script: [],
  };

  const videoScript: VideoScriptSection | undefined =
    contentType === "reel" || contentType === "video_script" || opts.includeVideoScript
      ? {
          hook: `🎬 HOOK (0-3s): "Wait — you need to see this ${topic.toLowerCase()} hack right now"`,
          body: `📝 BODY (4-25s): ${brand.contentPillars[1]?.exampleTopics[0] ?? `Walk through the top 3 things people get wrong about ${topic.toLowerCase()}`}. Keep energy high, cut on beats.`,
          callToAction: `📣 CTA (last 3s): "Follow us for more — and save this video!"`,
          captionSuggestion: `${(brand.hashtagStrategy.tiktok ?? []).slice(0, 5).join(" ")} #${topic.replace(/\s+/g, "")}`,
          trendingAudioHashtag: "#trendingsound",
        }
      : undefined;

  return {
    headline: `${topic}: ${brand.contentPillars[0]?.description ?? "Inspiring your community"}`,
    body: bodyByPlatform[platform] ?? `Check out our latest ${topic.toLowerCase()} content on ${platform}.`,
    hashtags: hashtagBase,
    callToAction: ctaByPlatform[platform] ?? "Engage with us",
    mediaPrompts: mediaPromptsByType[contentType] ?? mediaPromptsByType.post ?? [],
    platformSpecific: platformCfg,
    moderationFlags:
      platform === "reddit"
        ? ["Reddit requires human approval — never auto-publish"]
        : [],
    estimatedEngagement: "3-6% engagement rate based on brand benchmark",
    videoScript,
    locale,
    platform,
    contentType,
  };
}

// ─── AI generation ────────────────────────────────────────────────────────────

export async function generateContent(
  brandStrategy: BrandStrategyDraft,
  platform: SupportedPlatform,
  contentType: ContentType,
  opts: ContentGenerationOptions = {}
): Promise<ContentDraft> {
  if (
    process.env.AI_STUB_MODE === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  ) {
    return buildFixture(brandStrategy, platform, contentType, opts);
  }

  const locale = opts.locale ?? "en";
  const platformCfg = PLATFORM_CONFIG[platform];
  const isVideoType = contentType === "reel" || contentType === "video_script";

  const taskType = isVideoType || contentType === "carousel"
    ? ("strategy_text" as const)
    : ("caption" as const);

  const systemPrompt = `You are a world-class social media content strategist. Generate brand-grounded, platform-native content in locale "${locale}".
Return ONLY valid JSON matching the ContentDraft schema. No markdown, no explanation outside the JSON.

Platform rules for ${platform}:
- Format: ${platformCfg.format}
- Max length: ${platformCfg.maxLength} chars
- Best time: ${platformCfg.bestTime}
- Notes: ${platformCfg.notes ?? ""}
${platform === "reddit" ? "CRITICAL: Reddit content MUST be community-appropriate and non-promotional. This will require human approval." : ""}`;

  const userPrompt = `Generate ${contentType} content for ${platform} in ${locale}.

Brand: ${brandStrategy.positioningStatement}
Voice: ${brandStrategy.brandVoiceGuide.description}
Do/Don't:
- DO: ${brandStrategy.brandVoiceGuide.doAndDonts.do.slice(0, 3).join("; ")}
- DON'T: ${brandStrategy.brandVoiceGuide.doAndDonts.dont.slice(0, 3).join("; ")}
Do Not Mention: ${brandStrategy.doNotMention.join(", ")}
Hashtags: ${(brandStrategy.hashtagStrategy[platform] ?? brandStrategy.hashtagStrategy.instagram ?? []).join(", ")}
Content Pillars: ${brandStrategy.contentPillars.slice(0, 3).map((p) => p.name).join(", ")}
Topic: ${opts.topic ?? brandStrategy.contentPillars[0]?.name ?? "brand story"}
Tone: ${opts.tone ?? "brand voice as described"}
${opts.campaignBrief ? `Campaign Brief: ${opts.campaignBrief}` : ""}

Return JSON:
{
  "headline": "string",
  "body": "string (platform-appropriate length)",
  "hashtags": ["string"],
  "callToAction": "string",
  "mediaPrompts": ["string - describe visual/media to pair with this content"],
  "moderationFlags": ["string - any concerns"],
  "estimatedEngagement": "string",
  ${isVideoType || opts.includeVideoScript ? `"videoScript": { "hook": "string (0-3s)", "body": "string", "callToAction": "string", "captionSuggestion": "string", "trendingAudioHashtag": "string" },` : ""}
  "locale": "${locale}",
  "platform": "${platform}",
  "contentType": "${contentType}"
}`;

  try {
    const result = await route({
      task: taskType,
      prompt: userPrompt,
      opts: { systemPrompt, maxTokens: 1500, temperature: 0.75 },
    });
    const text = (result as { text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");
    const parsed = JSON.parse(jsonMatch[0]) as Omit<ContentDraft, "platformSpecific">;
    return {
      ...parsed,
      platformSpecific: PLATFORM_CONFIG[platform],
      locale,
      platform,
      contentType,
    };
  } catch {
    return buildFixture(brandStrategy, platform, contentType, opts);
  }
}

// ─── Batch generation (multiple platforms) ───────────────────────────────────

export async function generateContentBatch(
  brandStrategy: BrandStrategyDraft,
  platforms: SupportedPlatform[],
  contentType: ContentType,
  opts: ContentGenerationOptions = {}
): Promise<Record<SupportedPlatform, ContentDraft>> {
  const results = await Promise.all(
    platforms.map((p) => generateContent(brandStrategy, p, contentType, opts))
  );
  return Object.fromEntries(
    platforms.map((p, i) => [p, results[i]!])
  ) as Record<SupportedPlatform, ContentDraft>;
}

// ─── Section regeneration ─────────────────────────────────────────────────────

export async function regenerateSection(
  brandStrategy: BrandStrategyDraft,
  currentDraft: ContentDraft,
  section: "headline" | "body" | "callToAction" | "hashtags" | "videoScript"
): Promise<Partial<ContentDraft>> {
  if (
    process.env.AI_STUB_MODE === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  ) {
    const fresh = buildFixture(brandStrategy, currentDraft.platform, currentDraft.contentType, {
      locale: currentDraft.locale,
    });
    return { [section]: fresh[section] };
  }

  const prompt = `Regenerate only the "${section}" for this ${currentDraft.platform} ${currentDraft.contentType} post.
Brand: ${brandStrategy.positioningStatement}
Current ${section}: ${JSON.stringify(currentDraft[section])}
Locale: ${currentDraft.locale}
Return ONLY the JSON value for "${section}" (no wrapper).`;

  try {
    const result = await route({
      task: "caption",
      prompt,
      opts: { maxTokens: 512, temperature: 0.85 },
    });
    const text = (result as { text: string }).text;
    const jsonMatch = text.match(/[\[\{"'][\s\S]*[\]\}"']/);
    if (!jsonMatch) throw new Error("No JSON");
    return { [section]: JSON.parse(jsonMatch[0]) };
  } catch {
    const fresh = buildFixture(brandStrategy, currentDraft.platform, currentDraft.contentType, {
      locale: currentDraft.locale,
    });
    return { [section]: fresh[section] };
  }
}

// ─── Auto-score ───────────────────────────────────────────────────────────────

export function scoreContent(draft: ContentDraft): number {
  let score = 0.7;
  if (draft.moderationFlags.length > 0) score -= 0.2;
  if (draft.hashtags.length >= 3) score += 0.05;
  if (draft.callToAction.length > 5) score += 0.05;
  if (draft.mediaPrompts.length > 0) score += 0.05;
  if (draft.body.length > 50) score += 0.05;
  return Math.min(1, Math.max(0, score));
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { PLATFORM_CONFIG };

/** Public alias for use in seed scripts and tests */
export { buildFixture as buildContentFixture };
