import { describe, it, expect, vi, beforeEach } from "vitest";
import { route, getProviderChain } from "../src/router.js";
import { AnthropicProvider } from "../src/providers/anthropic.js";
import { OpenAIProvider } from "../src/providers/openai.js";
import { GeminiProvider } from "../src/providers/gemini.js";
import { FalProvider } from "../src/providers/fal.js";
import { ReplicateProvider } from "../src/providers/replicate.js";
import { RunwayProvider } from "../src/providers/runway.js";
import { VeoProvider } from "../src/providers/veo.js";
import { SoraProvider } from "../src/providers/sora.js";
import type { TextResult, ImageResult, VideoResult } from "../src/types.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockTextResult: TextResult = {
  text: "generated text",
  model: "test-model",
};

const mockImageResult: ImageResult = {
  urls: ["https://example.com/img.png"],
  model: "test-image-model",
};

const mockVideoResult: VideoResult = {
  url: "https://example.com/vid.mp4",
  model: "test-video-model",
};

// ─── strategy_text: anthropic → openai ───────────────────────────────────────

describe("router – strategy_text (anthropic → openai)", () => {
  it("returns result from anthropic when it succeeds", async () => {
    vi.spyOn(AnthropicProvider.prototype, "generateText").mockResolvedValueOnce(
      mockTextResult
    );

    const result = await route({ task: "strategy_text", prompt: "test" });
    expect(result).toEqual(mockTextResult);
  });

  it("falls back to openai when anthropic throws", async () => {
    vi.spyOn(AnthropicProvider.prototype, "generateText").mockRejectedValueOnce(
      new Error("anthropic unavailable")
    );
    vi.spyOn(OpenAIProvider.prototype, "generateText").mockResolvedValueOnce(
      mockTextResult
    );

    const result = await route({ task: "strategy_text", prompt: "test" });
    expect(result).toEqual(mockTextResult);
  });

  it("throws the last error when all providers in the chain fail", async () => {
    const fallbackErr = new Error("openai also failed");
    vi.spyOn(AnthropicProvider.prototype, "generateText").mockRejectedValueOnce(
      new Error("anthropic unavailable")
    );
    vi.spyOn(OpenAIProvider.prototype, "generateText").mockRejectedValueOnce(
      fallbackErr
    );

    await expect(
      route({ task: "strategy_text", prompt: "test" })
    ).rejects.toThrow("openai also failed");
  });
});

// ─── caption: gemini → openai ────────────────────────────────────────────────

describe("router – caption (gemini → openai)", () => {
  it("falls back to openai when gemini throws", async () => {
    vi.spyOn(GeminiProvider.prototype, "generateText").mockRejectedValueOnce(
      new Error("gemini unavailable")
    );
    vi.spyOn(OpenAIProvider.prototype, "generateText").mockResolvedValueOnce(
      mockTextResult
    );

    const result = await route({ task: "caption", prompt: "caption this" });
    expect(result).toEqual(mockTextResult);
  });
});

// ─── image: fal → replicate ───────────────────────────────────────────────────

describe("router – image (fal → replicate)", () => {
  it("returns result from fal when it succeeds", async () => {
    vi.spyOn(FalProvider.prototype, "generateImage").mockResolvedValueOnce(
      mockImageResult
    );

    const result = await route({ task: "image", prompt: "a sunset" });
    expect(result).toEqual(mockImageResult);
  });

  it("falls back to replicate when fal throws", async () => {
    vi.spyOn(FalProvider.prototype, "generateImage").mockRejectedValueOnce(
      new Error("fal unavailable")
    );
    vi.spyOn(ReplicateProvider.prototype, "generateImage").mockResolvedValueOnce(
      mockImageResult
    );

    const result = await route({ task: "image", prompt: "a sunset" });
    expect(result).toEqual(mockImageResult);
  });
});

// ─── video: runway → veo → sora ──────────────────────────────────────────────

describe("router – video (runway → veo → sora)", () => {
  it("returns result from runway when it succeeds", async () => {
    vi.spyOn(RunwayProvider.prototype, "generateVideo").mockResolvedValueOnce(
      mockVideoResult
    );

    const result = await route({ task: "video", prompt: "product showcase" });
    expect(result).toEqual(mockVideoResult);
  });

  it("falls back to veo when runway throws", async () => {
    vi.spyOn(RunwayProvider.prototype, "generateVideo").mockRejectedValueOnce(
      new Error("runway unavailable")
    );
    vi.spyOn(VeoProvider.prototype, "generateVideo").mockResolvedValueOnce(
      mockVideoResult
    );

    const result = await route({ task: "video", prompt: "product showcase" });
    expect(result).toEqual(mockVideoResult);
  });

  it("falls back to sora when runway and veo both throw", async () => {
    vi.spyOn(RunwayProvider.prototype, "generateVideo").mockRejectedValueOnce(
      new Error("runway unavailable")
    );
    vi.spyOn(VeoProvider.prototype, "generateVideo").mockRejectedValueOnce(
      new Error("veo unavailable")
    );
    vi.spyOn(SoraProvider.prototype, "generateVideo").mockResolvedValueOnce(
      mockVideoResult
    );

    const result = await route({ task: "video", prompt: "product showcase" });
    expect(result).toEqual(mockVideoResult);
  });
});

// ─── getProviderChain ─────────────────────────────────────────────────────────

describe("getProviderChain", () => {
  it("returns a chain with anthropic as primary for strategy_text", () => {
    const chain = getProviderChain("strategy_text");
    expect(chain[0]).toBeInstanceOf(AnthropicProvider);
    expect(chain[1]).toBeInstanceOf(OpenAIProvider);
  });

  it("returns a chain with fal as primary for image", () => {
    const chain = getProviderChain("image");
    expect(chain[0]).toBeInstanceOf(FalProvider);
    expect(chain[1]).toBeInstanceOf(ReplicateProvider);
  });

  it("returns a 3-provider chain for video (runway, veo, sora)", () => {
    const chain = getProviderChain("video");
    expect(chain).toHaveLength(3);
    expect(chain[0]).toBeInstanceOf(RunwayProvider);
    expect(chain[1]).toBeInstanceOf(VeoProvider);
    expect(chain[2]).toBeInstanceOf(SoraProvider);
  });
});
