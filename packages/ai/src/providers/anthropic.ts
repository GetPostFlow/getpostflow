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
 * Anthropic (Claude) provider stub.
 * Supports: generateText, generateStructured, generateEmbedding, moderate.
 * Does NOT support image or video generation natively.
 */
export class AnthropicProvider implements AIProviderInterface {
  readonly name = "anthropic";

  async generateText(
    _prompt: string,
    _opts?: TextGenerationOptions
  ): Promise<TextResult> {
    throw new ProviderNotImplementedError("generateText", this.name);
  }

  async generateStructured<T>(
    _schema: unknown,
    _prompt: string,
    _opts?: StructuredGenerationOptions
  ): Promise<T> {
    throw new ProviderNotImplementedError("generateStructured", this.name);
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new ProviderNotImplementedError("generateEmbedding", this.name);
  }

  async moderate(_text: string): Promise<ModerationResult> {
    throw new ProviderNotImplementedError("moderate", this.name);
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
    throw new ProviderNotSupportedError("generateVideo", this.name);
  }
}
