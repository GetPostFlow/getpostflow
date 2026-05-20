import type { AIProviderInterface } from "./provider";
import type {
  AITaskType,
  TextGenerationOptions,
  TextResult,
  StructuredGenerationOptions,
  ModerationResult,
  ImageGenerationOptions,
  ImageResult,
  VideoGenerationOptions,
  VideoResult,
} from "./types";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";
import { FalProvider } from "./providers/fal";
import { ReplicateProvider } from "./providers/replicate";
import { RunwayProvider } from "./providers/runway";
import { VeoProvider } from "./providers/veo";
import { SoraProvider } from "./providers/sora";

// ─── Routing chains ───────────────────────────────────────────────────────────
//
// strategy_text  → anthropic → openai
// structured     → openai → anthropic
// embedding      → openai → anthropic
// moderation     → openai → anthropic
// caption        → gemini → openai
// image          → fal → replicate
// video          → runway → veo → sora (when available)

type ProviderChain = AIProviderInterface[];

const routingChains: Record<AITaskType, ProviderChain> = {
  strategy_text: [new AnthropicProvider(), new OpenAIProvider()],
  structured: [new OpenAIProvider(), new AnthropicProvider()],
  embedding: [new OpenAIProvider(), new AnthropicProvider()],
  moderation: [new OpenAIProvider(), new AnthropicProvider()],
  caption: [new GeminiProvider(), new OpenAIProvider()],
  image: [new FalProvider(), new ReplicateProvider()],
  video: [new RunwayProvider(), new VeoProvider(), new SoraProvider()],
};

// ─── Router ───────────────────────────────────────────────────────────────────

export type RoutePayload =
  | { task: "strategy_text"; prompt: string; opts?: TextGenerationOptions }
  | { task: "structured"; schema: unknown; prompt: string; opts?: StructuredGenerationOptions }
  | { task: "embedding"; text: string }
  | { task: "moderation"; text: string }
  | { task: "caption"; prompt: string; opts?: TextGenerationOptions }
  | { task: "image"; prompt: string; opts?: ImageGenerationOptions }
  | { task: "video"; prompt: string; opts?: VideoGenerationOptions };

export type RouteResult<T extends AITaskType> =
  T extends "strategy_text" ? TextResult
  : T extends "structured" ? unknown
  : T extends "embedding" ? number[]
  : T extends "moderation" ? ModerationResult
  : T extends "caption" ? TextResult
  : T extends "image" ? ImageResult
  : T extends "video" ? VideoResult
  : never;

/**
 * Route a task to the primary provider in the chain,
 * falling back to each subsequent provider on error.
 *
 * Throws the last error if all providers in the chain fail.
 */
export async function route(payload: RoutePayload): Promise<unknown> {
  const chain = routingChains[payload.task];
  let lastError: unknown;

  for (const provider of chain) {
    try {
      switch (payload.task) {
        case "strategy_text":
        case "caption":
          return await provider.generateText(payload.prompt, payload.opts);

        case "structured":
          return await provider.generateStructured(
            payload.schema,
            payload.prompt,
            payload.opts
          );

        case "embedding":
          return await provider.generateEmbedding(payload.text);

        case "moderation":
          return await provider.moderate(payload.text);

        case "image":
          return await provider.generateImage(payload.prompt, payload.opts);

        case "video":
          return await provider.generateVideo(payload.prompt, payload.opts);
      }
    } catch (err) {
      lastError = err;
      // Continue to next provider in the fallback chain
    }
  }

  throw lastError;
}

/**
 * Returns the ordered provider chain for a given task type.
 * Useful for testing and observability.
 */
export function getProviderChain(task: AITaskType): AIProviderInterface[] {
  return routingChains[task];
}
