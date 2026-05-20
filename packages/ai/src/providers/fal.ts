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
 * fal.ai provider stub.
 * Primary use: image generation (Flux, SDXL, etc.).
 * Text/structured/embedding/moderation are not the primary use-case.
 */
export class FalProvider implements AIProviderInterface {
  readonly name = "fal";

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
    throw new ProviderNotImplementedError("generateImage", this.name);
  }

  async generateVideo(
    _prompt: string,
    _opts?: VideoGenerationOptions
  ): Promise<VideoResult> {
    throw new ProviderNotSupportedError("generateVideo", this.name);
  }
}
