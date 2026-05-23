import { requireOrgAuthApi } from "@/lib/auth-org";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/content/generate-video
 *
 * Body: { clientId, prompt, platform }
 *
 * Generates a video using Fal.ai text-to-video.
 * Falls back to OpenAI image storyboard frames if Fal.ai is not configured.
 */

const FAL_API_KEY = process.env.FAL_API_KEY;

async function generateWithFal(prompt: string, platform: string) {
  const size = platform === "tiktok" || platform === "instagram" ? "9:16" : "16:9";

  // Submit job
  const submitRes = await fetch("https://queue.fal.run/fal-ai/fast-svd/text-to-video", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      video_size: size,
      num_frames: 120,
    }),
  });

  if (!submitRes.ok) {
    const err = (await submitRes.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Fal.ai submission failed: ${submitRes.status}`);
  }

  const submitData = (await submitRes.json()) as { request_id?: string; response_url?: string };
  const pollUrl = submitData.response_url;
  if (!pollUrl) throw new Error("No response_url from Fal.ai");

  // Poll for result (max 60s)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(pollUrl, {
      headers: { Authorization: `Key ${FAL_API_KEY}` },
    });
    if (!statusRes.ok) continue;
    const statusData = (await statusRes.json()) as {
      status?: string;
      video?: { url?: string };
      output?: { video?: { url?: string } };
    };
    if (statusData.status === "COMPLETED") {
      const url = statusData.video?.url ?? statusData.output?.video?.url;
      if (url) return url;
    }
  }

  throw new Error("Fal.ai video generation timed out");
}

async function generateStoryboardFallback(prompt: string) {
  // Generate 3 frames (hook, body, CTA) as a composite data URL
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No video or image API configured");

  const openai = new OpenAI({ apiKey });
  const frames: string[] = [];

  const scenes = [
    `Cinematic opening shot: ${prompt} — dramatic lighting, wide angle, 16:9`,
    `Medium shot continuation: ${prompt} — character in motion, dynamic composition`,
    `Close-up impactful ending: ${prompt} — emotional payoff, vivid colors`,
  ];

  for (const scene of scenes) {
    const res = await openai.images.generate({
      model: "gpt-image-1",
      prompt: scene,
      n: 1,
      size: "1024x1024",
    });
    const b64 = res.data?.[0]?.b64_json;
    if (b64) frames.push(`data:image/png;base64,${b64}`);
  }

  // Return first frame as placeholder (client can show all as storyboard)
  return { storyboard: frames, fallback: true };
}

export async function POST(req: NextRequest) {
  const authResult = await requireOrgAuthApi();
  if (!authResult) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, platform } = (await req.json()) as { prompt?: string; platform?: string };
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  try {
    if (FAL_API_KEY) {
      const videoUrl = await generateWithFal(prompt, platform ?? "instagram");
      return NextResponse.json({ url: videoUrl });
    }

    // Fallback: storyboard frames
    const fallback = await generateStoryboardFallback(prompt);
    return NextResponse.json(fallback);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Video generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
