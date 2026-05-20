export const aiProviders = [
  "openai",
  "anthropic",
  "gemini",
  "fal",
  "replicate",
  "runway",
  "veo",
  "sora",
] as const;

export const aiTasks = [
  "strategy_synthesis",
  "structured_content_generation",
  "caption_variants",
  "vision_analysis",
  "embedding_generation",
  "moderation",
  "image_generation",
  "video_generation",
  "brand_grounded_translation",
] as const;

export type AITask = (typeof aiTasks)[number];
export type AIProvider = (typeof aiProviders)[number];

/**
 * Required env vars per AI provider.
 * Only the vars for providers you actually use need to be set.
 */
export const aiProviderEnvVars: Record<AIProvider, string[]> = {
  openai: ["OPENAI_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
  gemini: ["GOOGLE_GENERATIVE_AI_API_KEY"],
  fal: ["FAL_API_KEY"],
  replicate: ["REPLICATE_API_TOKEN"],
  runway: ["RUNWAY_API_KEY"],
  veo: ["GOOGLE_GENERATIVE_AI_API_KEY"],
  sora: ["OPENAI_API_KEY"],
};

/**
 * Model routing table — stub for Phase 0.1.
 * Maps each AI task to its primary and fallback provider.
 */
export const modelRoutingTable: Record<
  AITask,
  { primary: AIProvider; fallback?: AIProvider }
> = {
  strategy_synthesis: { primary: "anthropic", fallback: "openai" },
  structured_content_generation: { primary: "openai", fallback: "gemini" },
  caption_variants: { primary: "gemini", fallback: "openai" },
  vision_analysis: { primary: "gemini", fallback: "openai" },
  embedding_generation: { primary: "openai" },
  moderation: { primary: "openai" },
  image_generation: { primary: "fal", fallback: "replicate" },
  video_generation: { primary: "runway", fallback: "replicate" },
  brand_grounded_translation: { primary: "openai", fallback: "anthropic" },
};
