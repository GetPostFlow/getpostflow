import { requireOrgAuthApi } from "@/lib/auth-org";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getImageSize(platform?: string): "1024x1024" | "1792x1024" | "1024x1792" {
  switch (platform) {
    case "tiktok":
    case "instagram":
      return "1024x1792"; // 9:16 portrait
    case "youtube":
      return "1792x1024"; // 16:9 landscape
    case "facebook":
    case "linkedin":
    case "pinterest":
    case "reddit":
    case "discord":
    default:
      return "1024x1024"; // 1:1 square
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireOrgAuthApi();
  if (!authResult) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, platform } = (await req.json()) as { prompt?: string; platform?: string };
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt.trim(),
      n: 1,
      size: getImageSize(platform),
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "No image returned" }, { status: 500 });

    const dataUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({ url: dataUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
