import { route } from "./router";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManusStrategyRequest {
  clientName: string;
  website?: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
  keyMessaging?: string;
  contentTypes?: string[];
  marketingGoals?: string[];
  competitors?: string;
  themesToFocus?: string;
  themesToAvoid?: string;
  keywordsToMonitor?: string;
  desiredAutoResponses?: string;
  escalationProtocol?: string;
  socialAccounts?: Record<string, string>;
  frequency?: Record<string, string>;
  [key: string]: unknown;
}

export interface ManusStrategyResponse {
  brandVoiceStrategy: {
    positioningStatement: string;
    voiceGuide: string;
    doAndDonts: { do: string[]; dont: string[] };
  };
  postingStrategy: {
    contentPillars: { name: string; description: string; exampleTopics: string[] }[];
    cadence: Record<string, string>;
    samplePosts: Record<string, { caption: string; hashtags: string[]; notes?: string }[]>;
  };
  communityManagementStrategy: {
    funnelRules: {
      awareness: string[];
      interest: string[];
      conversion: string[];
    };
    keywordsToMonitor: string[];
    responseGuidelines: string;
    escalationProtocol: string;
  };
}

// ─── Manus API v2 Client ─────────────────────────────────────────────────────

const MANUS_API_BASE = process.env.MANUS_API_BASE_URL ?? "https://api.manus.ai";
const MANUS_API_KEY = process.env.MANUS_API_KEY;

interface ManusTaskCreateResponse {
  ok: boolean;
  task_id?: string;
  task_url?: string;
  error?: { code: string; message: string };
}

interface ManusTaskMessage {
  id: string;
  role: "assistant" | "user" | "system" | "tool";
  content: string;
  agent_status?: string;
  created_at: number;
}

interface ManusTaskMessagesResponse {
  ok: boolean;
  data?: ManusTaskMessage[];
  has_more?: boolean;
  error?: { code: string; message: string };
}

/**
 * Creates a Manus task and polls for completion.
 * Returns the assistant's final message content.
 */
async function createManusTaskAndPoll(
  prompt: string,
  opts?: {
    title?: string;
    agentProfile?: "manus-1.6" | "manus-1.6-lite" | "manus-1.6-max";
    timeoutMs?: number;
    pollIntervalMs?: number;
  }
): Promise<string | null> {
  if (!MANUS_API_KEY || MANUS_API_KEY.length <= 10) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-manus-api-key": MANUS_API_KEY,
  };

  // 1. Create task
  const createRes = await fetch(`${MANUS_API_BASE}/v2/task.create`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: { content: prompt },
      title: opts?.title ?? "GetPostFlow Strategy Generation",
      agent_profile: opts?.agentProfile ?? "manus-1.6-lite",
      interactive_mode: false,
      hide_in_task_list: true,
      share_visibility: "private",
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("[manus-client] task.create failed:", createRes.status, text);
    return null;
  }

  const createJson = (await createRes.json()) as ManusTaskCreateResponse;
  if (!createJson.ok || !createJson.task_id) {
    console.error("[manus-client] task.create error:", createJson.error);
    return null;
  }

  const taskId = createJson.task_id;
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const pollIntervalMs = opts?.pollIntervalMs ?? 3_000;
  const startTime = Date.now();

  // 2. Poll for completion
  while (Date.now() - startTime < timeoutMs) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    const messagesRes = await fetch(
      `${MANUS_API_BASE}/v2/task.listMessages?task_id=${taskId}&limit=50`,
      { method: "GET", headers }
    );

    if (!messagesRes.ok) continue;

    const messagesJson = (await messagesRes.json()) as ManusTaskMessagesResponse;
    if (!messagesJson.ok || !messagesJson.data) continue;

    const messages = messagesJson.data;

    // Check if task is done (last assistant message with no "waiting" status)
    const lastAssistant = messages
      .filter((m) => m.role === "assistant")
      .pop();

    if (lastAssistant && lastAssistant.agent_status !== "waiting") {
      return lastAssistant.content;
    }
  }

  console.error("[manus-client] Polling timeout for task", taskId);
  return null;
}

// ─── Strategy Generation ─────────────────────────────────────────────────────

/**
 * Sends a structured prompt to the Manus API to generate a comprehensive
 * brand strategy (voice, posting, community management) based on client intake.
 *
 * Falls back to the existing OpenAI/Anthropic router if Manus is unavailable
 * or returns an error.
 */
export async function generateBrandStrategyViaManus(
  intake: Record<string, unknown>
): Promise<ManusStrategyResponse> {
  // 1. Attempt Manus API if configured
  if (MANUS_API_KEY && MANUS_API_KEY.length > 10) {
    try {
      const result = await callManusStrategy(intake);
      if (result) return result;
    } catch (err) {
      console.warn("[manus-client] Manus API failed, falling back to OpenAI/Anthropic:", err);
    }
  }

  // 2. Fallback: use existing AI router (OpenAI / Anthropic)
  return generateStrategyFallback(intake as unknown as Record<string, unknown>);
}

async function callManusStrategy(
  intake: Record<string, unknown>
): Promise<ManusStrategyResponse | null> {
  const prompt = buildMasterPrompt(intake);

  const content = await createManusTaskAndPoll(prompt, {
    title: `Brand Strategy: ${(intake.businessName ?? intake.companyName ?? "Client") as string}`,
    agentProfile: "manus-1.6-lite",
    timeoutMs: 120_000,
    pollIntervalMs: 3_000,
  });

  if (!content) return null;

  // Extract JSON from response
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;

  return JSON.parse(match[0]) as ManusStrategyResponse;
}

function buildMasterPrompt(intake: Record<string, unknown>): string {
  const name = (intake.businessName ?? intake.companyName ?? "Client") as string;
  const website = (intake.website ?? intake.websiteUrl ?? "Not provided") as string;
  const industry = (intake.industry ?? "Not specified") as string;
  const audience = (intake.targetAudience ?? "Not specified") as string;
  const goals = Array.isArray(intake.marketingGoals) ? intake.marketingGoals.join(", ") : "Not specified";
  const contentTypes = Array.isArray(intake.contentTypes) ? intake.contentTypes.join(", ") : "Not specified";
  const brandVoice = (intake.brandVoice ?? (intake.brandGuidelines as Record<string, unknown>)?.voice ?? "Not specified") as string;
  const keyMessaging = (intake.keyMessaging ?? (intake.brandGuidelines as Record<string, unknown>)?.keyMessaging ?? "Not specified") as string;
  const themesFocus = (intake.themesToFocus ?? (intake.contentPreferences as Record<string, unknown>)?.themesToFocus ?? "Not specified") as string;
  const themesAvoid = (intake.themesToAvoid ?? (intake.contentPreferences as Record<string, unknown>)?.themesToAvoid ?? "Not specified") as string;
  const keywords = (intake.keywordsToMonitor ?? (intake.communityManagement as Record<string, unknown>)?.keywordsToMonitor ?? "Not specified") as string;
  const autoResponses = (intake.desiredAutoResponses ?? (intake.communityManagement as Record<string, unknown>)?.desiredAutoResponses ?? "Not specified") as string;
  const escalation = (intake.escalationProtocol ?? (intake.communityManagement as Record<string, unknown>)?.escalationProtocol ?? "Not specified") as string;
  const frequency = (intake.frequency ?? (intake.contentPreferences as Record<string, unknown>)?.frequency ?? {}) as Record<string, string>;

  return `Generate a comprehensive social media strategy for this client:

Client: ${name}
Website: ${website}
Industry: ${industry}
Target Audience: ${audience}
Brand Voice: ${brandVoice}
Key Messaging / USPs: ${keyMessaging}
Marketing Goals: ${goals}
Content Types: ${contentTypes}
Themes to Focus: ${themesFocus}
Themes to Avoid: ${themesAvoid}
Keywords to Monitor: ${keywords}
Desired Auto Responses: ${autoResponses}
Escalation Protocol: ${escalation}
Posting Frequency: ${JSON.stringify(frequency)}

Return ONLY valid JSON with this exact structure:
{
  "brandVoiceStrategy": {
    "positioningStatement": string,
    "voiceGuide": string,
    "doAndDonts": { "do": string[], "dont": string[] }
  },
  "postingStrategy": {
    "contentPillars": [{ "name": string, "description": string, "exampleTopics": string[] }],
    "cadence": { "platform": "frequency" },
    "samplePosts": { "platform": [{ "caption": string, "hashtags": string[], "notes"?: string }] }
  },
  "communityManagementStrategy": {
    "funnelRules": {
      "awareness": string[],
      "interest": string[],
      "conversion": string[]
    },
    "keywordsToMonitor": string[],
    "responseGuidelines": string,
    "escalationProtocol": string
  }
}`;
}

// ─── Fallback: OpenAI / Anthropic via existing router ─────────────────────────

async function generateStrategyFallback(
  intake: Record<string, unknown>
): Promise<ManusStrategyResponse> {
  // Re-use existing brand-strategy module for fallback
  const { generateBrandStrategy } = await import("./brand-strategy");
  const draft = await generateBrandStrategy(intake as unknown as Parameters<typeof generateBrandStrategy>[0]);

  // Map legacy BrandStrategyDraft to new ManusStrategyResponse shape
  return {
    brandVoiceStrategy: {
      positioningStatement: draft.positioningStatement,
      voiceGuide: draft.brandVoiceGuide.description,
      doAndDonts: draft.brandVoiceGuide.doAndDonts,
    },
    postingStrategy: {
      contentPillars: draft.contentPillars,
      cadence: draft.postingCadenceRecommendation,
      samplePosts: draft.samplePostsByPlatform,
    },
    communityManagementStrategy: {
      funnelRules: {
        awareness: ["Auto-like positive comments", "Simple replies to praise", "Keyword-based engagement"],
        interest: ["Informative replies with soft CTA", "DM initiation for complex inquiries", "Link to relevant resources"],
        conversion: ["Lead qualification via DM", "Direct CTA to product pages", "Notify agency hello@getpostflow.com"],
      },
      keywordsToMonitor: draft.hashtagStrategy["instagram"] ?? [],
      responseGuidelines: "Follow funnel stage rules. Escalate negative sentiment and high-intent leads.",
      escalationProtocol: "Email hello@getpostflow.com for high-value leads and sensitive issues.",
    },
  };
}

// ─── Content Generation via Manus ─────────────────────────────────────────────

export interface ManusContentRequest {
  clientName: string;
  platform: string;
  contentType: string;
  topic: string;
  brandVoice: string;
  targetAudience: string;
  ctaUrl?: string;
  locale?: string;
}

export interface ManusContentResponse {
  caption: string;
  hashtags: string[];
  imagePrompt?: string;
  videoPrompt?: string;
  notes?: string;
}

/**
 * Generates a single piece of content via Manus API, falling back to OpenAI/Anthropic.
 */
export async function generateContentViaManus(req: ManusContentRequest): Promise<ManusContentResponse> {
  if (MANUS_API_KEY && MANUS_API_KEY.length > 10) {
    try {
      const prompt = `You are a social media content creator. Generate platform-optimised post copy with hashtags.

Client: ${req.clientName}
Platform: ${req.platform}
Content Type: ${req.contentType}
Topic: ${req.topic}
Brand Voice: ${req.brandVoice}
Audience: ${req.targetAudience}
CTA URL: ${req.ctaUrl ?? "None"}
Locale: ${req.locale ?? "en"}

Return ONLY valid JSON:
{
  "caption": string,
  "hashtags": string[],
  "imagePrompt"?: string,
  "videoPrompt"?: string,
  "notes"?: string
}`;

      const content = await createManusTaskAndPoll(prompt, {
        title: `Content: ${req.clientName} — ${req.platform}`,
        agentProfile: "manus-1.6-lite",
        timeoutMs: 60_000,
        pollIntervalMs: 3_000,
      });

      if (content) {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as ManusContentResponse;
      }
    } catch (err) {
      console.warn("[manus-client] Content generation fallback:", err);
    }
  }

  // Fallback to existing content engine
  const { generateContent } = await import("./content-engine");
  const result = await generateContent(
    {
      positioningStatement: req.brandVoice,
      brandVoiceGuide: { description: req.brandVoice, formalCasual: 5, seriousPlayful: 5, conservativeBold: 5, doAndDonts: { do: [], dont: [] } },
      audiencePersonas: [],
      contentPillars: [],
      samplePostsByPlatform: {},
      doNotMention: [],
      hashtagStrategy: {},
      postingCadenceRecommendation: {},
      kpiTargets: {},
      riskFlagsForReview: [],
    },
    req.platform as "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "pinterest" | "reddit" | "discord",
    req.contentType as "post" | "carousel" | "reel" | "story" | "thread" | "ad" | "video_script",
    {
      locale: req.locale ?? "en",
      topic: req.topic,
    }
  );

  return {
    caption: result.body,
    hashtags: result.hashtags,
    notes: result.platformSpecific.notes,
  };
}
