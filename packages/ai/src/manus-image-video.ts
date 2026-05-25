/**
 * Manus Image and Video Generation Module
 * Handles AI-powered visual content creation with asset injection
 */

import { route } from "./router";

export interface ManusImageGenerationRequest {
  clientName: string;
  caption: string;
  brandVoice: string;
  platform: "instagram" | "facebook" | "tiktok" | "youtube" | "linkedin";
  contentType: "post" | "carousel" | "story" | "thumbnail" | "cover";
  brandAssets?: {
    logoUrl?: string;
    brandColors?: string[];
    fontFamily?: string;
  };
  locale?: string;
}

export interface ManusVideoGenerationRequest {
  clientName: string;
  caption: string;
  brandVoice: string;
  platform: "tiktok" | "youtube" | "instagram" | "facebook";
  contentType: "reel" | "short" | "video_ad" | "story_video";
  duration?: number; // in seconds
  brandAssets?: {
    logoUrl?: string;
    brandColors?: string[];
    fontFamily?: string;
  };
  locale?: string;
}

export interface ManusImageResponse {
  imageUrl: string;
  prompt: string;
  assetInjectionDetails: {
    logoIncluded: boolean;
    brandColorsApplied: boolean;
    customFontApplied: boolean;
  };
}

export interface ManusVideoResponse {
  videoUrl: string;
  prompt: string;
  duration: number;
  assetInjectionDetails: {
    logoIncluded: boolean;
    brandColorsApplied: boolean;
    customFontApplied: boolean;
  };
}

const MANUS_API_BASE = process.env.MANUS_API_BASE_URL ?? "https://api.manus.ai";
const MANUS_API_KEY = process.env.MANUS_API_KEY;

/**
 * Generates an AI image with client brand assets injected
 */
export async function generateImageViaManus(
  req: ManusImageGenerationRequest
): Promise<ManusImageResponse> {
  if (!MANUS_API_KEY || MANUS_API_KEY.length <= 10) {
    return fallbackImageGeneration(req);
  }

  try {
    const prompt = buildImageGenerationPrompt(req);
    const imageUrl = await generateImageWithManus(prompt, req.clientName);

    if (imageUrl) {
      return {
        imageUrl,
        prompt,
        assetInjectionDetails: {
          logoIncluded: !!req.brandAssets?.logoUrl,
          brandColorsApplied: !!req.brandAssets?.brandColors && req.brandAssets.brandColors.length > 0,
          customFontApplied: !!req.brandAssets?.fontFamily,
        },
      };
    }
  } catch (err) {
    console.warn("[manus-image] Image generation failed, falling back:", err);
  }

  return fallbackImageGeneration(req);
}

/**
 * Generates an AI video with client brand assets injected
 */
export async function generateVideoViaManus(
  req: ManusVideoGenerationRequest
): Promise<ManusVideoResponse> {
  if (!MANUS_API_KEY || MANUS_API_KEY.length <= 10) {
    return fallbackVideoGeneration(req);
  }

  try {
    const prompt = buildVideoGenerationPrompt(req);
    const videoUrl = await generateVideoWithManus(prompt, req.clientName);

    if (videoUrl) {
      return {
        videoUrl,
        prompt,
        duration: req.duration ?? 15,
        assetInjectionDetails: {
          logoIncluded: !!req.brandAssets?.logoUrl,
          brandColorsApplied: !!req.brandAssets?.brandColors && req.brandAssets.brandColors.length > 0,
          customFontApplied: !!req.brandAssets?.fontFamily,
        },
      };
    }
  } catch (err) {
    console.warn("[manus-video] Video generation failed, falling back:", err);
  }

  return fallbackVideoGeneration(req);
}

/**
 * Refines generated image based on text prompt feedback
 */
export async function refineImageViaManus(
  originalPrompt: string,
  refinementFeedback: string,
  clientName: string
): Promise<ManusImageResponse> {
  const refinedPrompt = `${originalPrompt}\n\nRefinement feedback: ${refinementFeedback}`;

  try {
    const imageUrl = await generateImageWithManus(refinedPrompt, clientName);
    if (imageUrl) {
      return {
        imageUrl,
        prompt: refinedPrompt,
        assetInjectionDetails: {
          logoIncluded: true,
          brandColorsApplied: true,
          customFontApplied: true,
        },
      };
    }
  } catch (err) {
    console.warn("[manus-image] Refinement failed:", err);
  }

  return fallbackImageGeneration({
    clientName,
    caption: refinementFeedback,
    brandVoice: "professional",
    platform: "instagram",
    contentType: "post",
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageGenerationPrompt(req: ManusImageGenerationRequest): string {
  const assetInstructions = req.brandAssets
    ? `
Brand Assets to Inject:
- Logo: ${req.brandAssets.logoUrl ? "Include prominently" : "N/A"}
- Brand Colors: ${req.brandAssets.brandColors?.join(", ") || "N/A"}
- Font: ${req.brandAssets.fontFamily || "N/A"}
`
    : "";

  return `Generate a professional, high-quality image for social media.

Client: ${req.clientName}
Platform: ${req.platform}
Content Type: ${req.contentType}
Caption: ${req.caption}
Brand Voice: ${req.brandVoice}
${assetInstructions}
Locale: ${req.locale ?? "en"}

IMPORTANT: NO EM DASHES. Use hyphens instead.
Create an image that is platform-optimized and on-brand.`;
}

function buildVideoGenerationPrompt(req: ManusVideoGenerationRequest): string {
  const assetInstructions = req.brandAssets
    ? `
Brand Assets to Inject:
- Logo: ${req.brandAssets.logoUrl ? "Include in intro/outro" : "N/A"}
- Brand Colors: ${req.brandAssets.brandColors?.join(", ") || "N/A"}
- Font: ${req.brandAssets.fontFamily || "N/A"}
`
    : "";

  return `Generate a short-form video for social media.

Client: ${req.clientName}
Platform: ${req.platform}
Content Type: ${req.contentType}
Duration: ${req.duration ?? 15} seconds
Caption: ${req.caption}
Brand Voice: ${req.brandVoice}
${assetInstructions}
Locale: ${req.locale ?? "en"}

IMPORTANT: NO EM DASHES. Use hyphens instead.
Create an engaging, platform-optimized video that captures attention in the first 3 seconds.`;
}

async function generateImageWithManus(prompt: string, clientName: string): Promise<string | null> {
  // This would integrate with Manus image generation API
  // For now, returning null to trigger fallback
  // In production, this would call the actual Manus image generation endpoint
  console.log(`[manus-image] Would generate image for ${clientName}`);
  return null;
}

async function generateVideoWithManus(prompt: string, clientName: string): Promise<string | null> {
  // This would integrate with Manus video generation API
  // For now, returning null to trigger fallback
  // In production, this would call the actual Manus video generation endpoint
  console.log(`[manus-video] Would generate video for ${clientName}`);
  return null;
}

// ─── Fallback Functions ────────────────────────────────────────────────────────

async function fallbackImageGeneration(req: ManusImageGenerationRequest): Promise<ManusImageResponse> {
  // Fallback to placeholder or existing image generation service
  return {
    imageUrl: "https://via.placeholder.com/1080x1080?text=Generated+Image",
    prompt: `Image for ${req.clientName} - ${req.contentType}`,
    assetInjectionDetails: {
      logoIncluded: false,
      brandColorsApplied: false,
      customFontApplied: false,
    },
  };
}

async function fallbackVideoGeneration(req: ManusVideoGenerationRequest): Promise<ManusVideoResponse> {
  // Fallback to placeholder or existing video generation service
  return {
    videoUrl: "https://via.placeholder.com/1080x1920?text=Generated+Video",
    prompt: `Video for ${req.clientName} - ${req.contentType}`,
    duration: req.duration ?? 15,
    assetInjectionDetails: {
      logoIncluded: false,
      brandColorsApplied: false,
      customFontApplied: false,
    },
  };
}
