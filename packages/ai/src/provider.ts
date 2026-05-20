import type {
  TextGenerationOptions,
  TextResult,
  StructuredGenerationOptions,
  ModerationResult,
  ImageGenerationOptions,
  ImageResult,
  VideoGenerationOptions,
  VideoResult,
} from "./types";

// ─── Provider interface ───────────────────────────────────────────────────────

export interface AIProviderInterface {
  readonly name: string;

  /**
   * Generate free-form text from a prompt.
   */
  generateText(
    prompt: string,
    opts?: TextGenerationOptions
  ): Promise<TextResult>;

  /**
   * Generate structured output that conforms to a given schema.
   * The schema is provider-specific (e.g., Zod, JSON Schema) and is typed as unknown
   * at the interface level to remain provider-agnostic.
   */
  generateStructured<T>(
    schema: unknown,
    prompt: string,
    opts?: StructuredGenerationOptions
  ): Promise<T>;

  /**
   * Generate a vector embedding for the given text.
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Run content moderation on the given text.
   */
  moderate(text: string): Promise<ModerationResult>;

  /**
   * Generate one or more images from a text prompt.
   * Throw NotSupportedError if the provider does not support image generation.
   */
  generateImage(
    prompt: string,
    opts?: ImageGenerationOptions
  ): Promise<ImageResult>;

  /**
   * Generate a video from a text prompt.
   * Throw NotSupportedError if the provider does not support video generation.
   */
  generateVideo(
    prompt: string,
    opts?: VideoGenerationOptions
  ): Promise<VideoResult>;
}

// ─── Provider-level errors ────────────────────────────────────────────────────

export class ProviderNotImplementedError extends Error {
  constructor(method: string, providerName: string) {
    super(`${providerName}.${method} is not yet implemented`);
    this.name = "ProviderNotImplementedError";
  }
}

export class ProviderNotSupportedError extends Error {
  constructor(method: string, providerName: string) {
    super(`${providerName} does not support ${method}`);
    this.name = "ProviderNotSupportedError";
  }
}
