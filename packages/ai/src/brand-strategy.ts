import { route } from "./router";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AudiencePersona {
  name: string;
  ageRange: string;
  description: string;
  painPoints: string[];
  motivations: string[];
}

export interface ContentPillar {
  name: string;
  description: string;
  exampleTopics: string[];
}

export interface SamplePost {
  platform: string;
  caption: string;
  hashtags: string[];
  notes?: string;
}

export interface HashtagStrategy {
  [platform: string]: string[];
}

export interface PostingCadenceRecommendation {
  [platform: string]: string;
}

export interface KpiTargets {
  followerGrowthRate?: string;
  engagementRate?: string;
  leadConversionRate?: string;
  awareness?: string;
}

export interface BrandStrategyDraft {
  positioningStatement: string;
  brandVoiceGuide: {
    formalCasual: number;
    seriousPlayful: number;
    conservativeBold: number;
    description: string;
    doAndDonts: { do: string[]; dont: string[] };
  };
  audiencePersonas: AudiencePersona[];
  contentPillars: ContentPillar[];
  samplePostsByPlatform: { [platform: string]: SamplePost[] };
  doNotMention: string[];
  hashtagStrategy: HashtagStrategy;
  postingCadenceRecommendation: PostingCadenceRecommendation;
  kpiTargets: KpiTargets;
  riskFlagsForReview: string[];
}

export interface IntakeData {
  businessName: string;
  website?: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: {
    formalCasual?: number;
    seriousPlayful?: number;
    conservativeBold?: number;
  };
  uniqueSellingProps?: string;
  productsServices?: string;
  competitors?: string;
  contentGoals?: string[];
  doNotMentionList?: string;
  targetLocales?: string[];
  preferredCadence?: Record<string, string>;
  existingAssets?: {
    logoUrl?: string;
    colorHex?: string;
    fonts?: string;
    sampleContentUrls?: string[];
  };
}

// ─── Stub fixture for dev / offline mode ─────────────────────────────────────

export function getBrandStrategyFixture(intake: IntakeData): BrandStrategyDraft {
  const name = intake.businessName ?? "Your Brand";
  const industry = intake.industry ?? "Retail";
  return {
    positioningStatement: `${name} is a leading ${industry} brand that delivers exceptional quality and value to its customers through innovation, community, and trust.`,
    brandVoiceGuide: {
      formalCasual: intake.brandVoice?.formalCasual ?? 5,
      seriousPlayful: intake.brandVoice?.seriousPlayful ?? 5,
      conservativeBold: intake.brandVoice?.conservativeBold ?? 5,
      description: `${name} communicates with warmth and professionalism. We balance approachable friendliness with credible expertise to build lasting relationships.`,
      doAndDonts: {
        do: [
          "Use inclusive, welcoming language",
          "Share real stories and behind-the-scenes moments",
          "Celebrate customer successes",
          "Be clear and direct about product benefits",
        ],
        dont: [
          "Use overly technical jargon",
          "Make unsubstantiated claims",
          "Engage negatively with competitors",
          ...(intake.doNotMentionList
            ? [`Mention: ${intake.doNotMentionList}`]
            : []),
        ],
      },
    },
    audiencePersonas: [
      {
        name: "Ambitious Alex",
        ageRange: "28–40",
        description: `A motivated professional in the ${industry} space who values quality and efficiency.`,
        painPoints: ["Limited time", "Information overload", "Unclear ROI"],
        motivations: ["Growth", "Reliability", "Community"],
      },
      {
        name: "Curious Casey",
        ageRange: "22–34",
        description: "An early adopter who loves trying new products and sharing discoveries online.",
        painPoints: ["Fear of missing out", "Budget constraints", "Analysis paralysis"],
        motivations: ["Discovery", "Social proof", "Value for money"],
      },
      {
        name: "Loyal Morgan",
        ageRange: "35–55",
        description: "A long-term customer who values consistency, quality, and brand reputation.",
        painPoints: ["Inconsistent experiences", "Poor customer service", "Change fatigue"],
        motivations: ["Trust", "Reliability", "Familiarity"],
      },
    ],
    contentPillars: [
      {
        name: "Education",
        description: "Teach your audience something useful every week.",
        exampleTopics: [
          `How to get the most from ${name} products`,
          `${industry} tips and trends`,
          "Behind-the-scenes how-we-make-it",
        ],
      },
      {
        name: "Community",
        description: "Celebrate your customers and build belonging.",
        exampleTopics: [
          "Customer spotlights",
          "Community challenges",
          "Fan reposts and reactions",
        ],
      },
      {
        name: "Inspiration",
        description: "Motivate and energize your audience.",
        exampleTopics: [
          "Success stories",
          "Seasonal inspiration",
          "Quote graphics with brand voice",
        ],
      },
      {
        name: "Product Showcase",
        description: "Highlight products in an authentic, benefit-led way.",
        exampleTopics: [
          "New arrivals",
          "Limited-time offers",
          "Product comparisons",
        ],
      },
      {
        name: "Brand Story",
        description: "Build trust through transparency and authenticity.",
        exampleTopics: [
          "Origin story",
          "Team introductions",
          "Brand values in action",
        ],
      },
    ],
    samplePostsByPlatform: {
      instagram: [
        {
          platform: "instagram",
          caption: `✨ Every great ${industry} journey starts with one step. We're here for yours. 💛 #${name.replace(/\s+/g, "")}`,
          hashtags: [`#${industry.toLowerCase()}`, "#smallbusiness", "#brandstory"],
          notes: "Post with a warm lifestyle photo",
        },
        {
          platform: "instagram",
          caption: `Meet the team behind the magic 👋 We're a small crew with big hearts and even bigger passion for what we do. #BehindTheScenes`,
          hashtags: ["#behindthescenes", "#teamwork", "#brandlove"],
        },
        {
          platform: "instagram",
          caption: `Your weekend deserves the best. 🌟 Shop our top picks → link in bio.`,
          hashtags: ["#weekendvibes", "#shopnow", "#newcollection"],
        },
      ],
      facebook: [
        {
          platform: "facebook",
          caption: `We believe every customer deserves an exceptional experience. That's why ${name} puts quality first in everything we do. What does quality mean to you? Share in the comments!`,
          hashtags: [],
          notes: "Discussion post — encourage engagement",
        },
        {
          platform: "facebook",
          caption: `🎉 New arrivals just dropped! Check out what's new this week at ${name}. Click to explore → `,
          hashtags: ["#newproducts", `#${name.replace(/\s+/g, "")}`],
        },
        {
          platform: "facebook",
          caption: `We're grateful for every single one of you 💛 Thank you for being part of the ${name} community.`,
          hashtags: ["#gratitude", "#community"],
        },
      ],
      linkedin: [
        {
          platform: "linkedin",
          caption: `At ${name}, we believe that ${industry} can be done better. Here's how we're approaching it differently in 2026. [Thread]`,
          hashtags: [`#${industry}`, "#thoughtleadership", "#innovation"],
          notes: "Long-form thought leadership post",
        },
        {
          platform: "linkedin",
          caption: `Proud to share that ${name} has reached a new milestone. None of this would be possible without our incredible team and loyal customers.`,
          hashtags: ["#milestone", "#teamwork", "#growth"],
        },
        {
          platform: "linkedin",
          caption: `5 lessons we learned growing ${name} in a competitive ${industry} market. What are yours?`,
          hashtags: ["#lessons", "#entrepreneurship", `#${industry}`],
        },
      ],
    },
    doNotMention: intake.doNotMentionList
      ? intake.doNotMentionList.split(",").map((s) => s.trim()).filter(Boolean)
      : ["competitor pricing", "internal team disputes"],
    hashtagStrategy: {
      instagram: [
        `#${name.replace(/\s+/g, "").toLowerCase()}`,
        `#${industry.toLowerCase()}`,
        "#smallbusiness",
        "#community",
        "#brandlife",
        "#shoplocal",
      ],
      facebook: [`#${name.replace(/\s+/g, "").toLowerCase()}`, `#${industry.toLowerCase()}`],
      linkedin: [`#${industry.toLowerCase()}`, "#thoughtleadership", "#innovation"],
      tiktok: [`#${industry.toLowerCase()}`, "#fyp", "#brandtok", "#smallbiz"],
    },
    postingCadenceRecommendation: intake.preferredCadence ?? {
      instagram: "5x/week (3 feed + 2 stories)",
      facebook: "4x/week",
      linkedin: "3x/week",
      tiktok: "4x/week",
    },
    kpiTargets: {
      followerGrowthRate: "5–10% month-over-month",
      engagementRate: "3–6% per post",
      leadConversionRate: "1–3% from social traffic",
      awareness: "Reach 10K new unique users per month within 90 days",
    },
    riskFlagsForReview: [
      "Brand voice sliders are set to defaults — review with client to confirm tone.",
      "No competitor analysis data provided — manual review recommended.",
      "Sample posts use placeholder content — customize before client presentation.",
    ],
  };
}

// ─── AI generation ────────────────────────────────────────────────────────────

export async function generateBrandStrategy(
  intake: IntakeData
): Promise<BrandStrategyDraft> {
  // Stub mode: return fixture without calling AI
  if (
    process.env.AI_STUB_MODE === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY)
  ) {
    return getBrandStrategyFixture(intake);
  }

  const systemPrompt = `You are a world-class brand strategist specializing in social media and content strategy for SMBs. Your job is to produce a comprehensive, actionable brand strategy draft based on client intake data.

Return ONLY valid JSON matching the BrandStrategyDraft schema. Do not include any explanation or markdown outside the JSON.`;

  const userPrompt = `Generate a full brand strategy for this client:

Business Name: ${intake.businessName}
Website: ${intake.website ?? "Not provided"}
Industry: ${intake.industry ?? "Not specified"}
Target Audience: ${intake.targetAudience ?? "Not specified"}
Brand Voice (1=left pole, 10=right pole): Formal↔Casual=${intake.brandVoice?.formalCasual ?? 5}, Serious↔Playful=${intake.brandVoice?.seriousPlayful ?? 5}, Conservative↔Bold=${intake.brandVoice?.conservativeBold ?? 5}
Unique Selling Props: ${intake.uniqueSellingProps ?? "Not provided"}
Products/Services: ${intake.productsServices ?? "Not provided"}
Competitors: ${intake.competitors ?? "Not provided"}
Content Goals: ${(intake.contentGoals ?? []).join(", ") || "Not specified"}
Do Not Mention: ${intake.doNotMentionList ?? "None"}
Target Locales: ${(intake.targetLocales ?? ["en"]).join(", ")}

Return a JSON object with these exact keys:
{
  "positioningStatement": string,
  "brandVoiceGuide": { "formalCasual": number, "seriousPlayful": number, "conservativeBold": number, "description": string, "doAndDonts": { "do": string[], "dont": string[] } },
  "audiencePersonas": [{ "name": string, "ageRange": string, "description": string, "painPoints": string[], "motivations": string[] }],
  "contentPillars": [{ "name": string, "description": string, "exampleTopics": string[] }],
  "samplePostsByPlatform": { "<platform>": [{ "platform": string, "caption": string, "hashtags": string[], "notes"?: string }] },
  "doNotMention": string[],
  "hashtagStrategy": { "<platform>": string[] },
  "postingCadenceRecommendation": { "<platform>": string },
  "kpiTargets": { "followerGrowthRate": string, "engagementRate": string, "leadConversionRate": string, "awareness": string },
  "riskFlagsForReview": string[]
}

Produce 3–5 audiencePersonas, 5–7 contentPillars, and 3 sample posts per platform for: instagram, facebook, linkedin, tiktok.`;

  try {
    const result = await route({
      task: "strategy_text",
      prompt: userPrompt,
      opts: {
        systemPrompt,
        maxTokens: 4096,
        temperature: 0.7,
      },
    });

    const text = (result as { text: string }).text;
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    return JSON.parse(jsonMatch[0]) as BrandStrategyDraft;
  } catch {
    // Fallback to fixture on any AI failure
    return getBrandStrategyFixture(intake);
  }
}

// ─── Section regeneration ─────────────────────────────────────────────────────

export async function generateBrandStrategySection(
  intake: IntakeData,
  section: keyof BrandStrategyDraft,
  currentDraft: BrandStrategyDraft
): Promise<Partial<BrandStrategyDraft>> {
  if (
    process.env.AI_STUB_MODE === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY)
  ) {
    const fixture = getBrandStrategyFixture(intake);
    return { [section]: fixture[section] };
  }

  const systemPrompt = `You are a brand strategist. Regenerate only the specified section of a brand strategy as valid JSON.`;
  const userPrompt = `Regenerate the "${section}" section for this brand:

Business: ${intake.businessName}
Industry: ${intake.industry ?? "Not specified"}
Current value: ${JSON.stringify(currentDraft[section])}

Return ONLY the JSON value for the "${section}" key (no wrapper object).`;

  try {
    const result = await route({
      task: "strategy_text",
      prompt: userPrompt,
      opts: { systemPrompt, maxTokens: 1024, temperature: 0.8 },
    });
    const text = (result as { text: string }).text;
    const jsonMatch = text.match(/[\[\{][\s\S]*[\]\}]/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return { [section]: JSON.parse(jsonMatch[0]) };
  } catch {
    const fixture = getBrandStrategyFixture(intake);
    return { [section]: fixture[section] };
  }
}
