import {
  ProviderNotImplementedError,
  ProviderNotSupportedError,
} from "../provider";
import type { AIProviderInterface } from "../provider";
import type {
  TextGenerationOptions,
  TextResult,
  StructuredGenerationOptions,
  ModerationResult,
  ImageGenerationOptions,
  ImageResult,
  VideoGenerationOptions,
  VideoResult,
} from "../types";

/**
 * Google Veo provider stub.
 * Primary use: video generation via Google DeepMind Veo.
 * Uses the same API key as Gemini (GOOGLE_GENERATIVE_AI_API_KEY).
 */
export class VeoProvider implements AIProviderInterface {
  readonly name = "veo";

  async generateText(
    _prompt: string,
    _opts?: TextGenerationOptions
  ): Promise<TextResult> {
    throw new ProviderNotSupportedError("generateText", this.name);
  }

  async generateStructured<T>(
    _schema: unknown,
    _prompt: string,
    _opts?: StructuredGenerationOptions
  ): Promise<T> {
    throw new ProviderNotSupportedError("generateStructured", this.name);
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new ProviderNotSupportedError("generateEmbedding", this.name);
  }

  async moderate(_text: string): Promise<ModerationResult> {
    throw new ProviderNotSupportedError("moderate", this.name);
  }

  async generateImage(
    _prompt: string,
    _opts?: ImageGenerationOptions
  ): Promise<ImageResult> {
    throw new ProviderNotSupportedError("generateImage", this.name);
  }

  async generateVideo(
    _prompt: string,
    _opts?: VideoGenerationOptions
  ): Promise<VideoResult> {
    throw new ProviderNotImplementedError("generateVideo", this.name);
  }
}
