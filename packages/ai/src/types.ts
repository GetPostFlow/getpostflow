// ─── Text generation ──────────────────────────────────────────────────────────

export interface TextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

export interface TextResult {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  raw?: Record<string, unknown>;
}

// ─── Structured generation ────────────────────────────────────────────────────

export interface StructuredGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export type ModerationCategory =
  | "safe"
  | "hate"
  | "violence"
  | "sexual"
  | "self-harm"
  | "spam"
  | "other";

export interface ModerationResult {
  safe: boolean;
  categories: ModerationCategory[];
  score: number; // 0–1 risk score
  raw?: Record<string, unknown>;
}

// ─── Image generation ─────────────────────────────────────────────────────────

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  style?: string;
  negativePrompt?: string;
  numImages?: number;
}

export interface ImageResult {
  urls: string[];
  model: string;
  raw?: Record<string, unknown>;
}

// ─── Video generation ─────────────────────────────────────────────────────────

export interface VideoGenerationOptions {
  durationSeconds?: number;
  aspectRatio?: string;
  style?: string;
  referenceImageUrl?: string;
}

export interface VideoResult {
  url: string;
  model: string;
  durationSeconds?: number;
  raw?: Record<string, unknown>;
}

// ─── Task type ────────────────────────────────────────────────────────────────

export type AITaskType =
  | "strategy_text"
  | "structured"
  | "embedding"
  | "moderation"
  | "caption"
  | "image"
  | "video";
