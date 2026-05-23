"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "#E1306C" },
  { key: "facebook", label: "Facebook", color: "#1877F2" },
  { key: "tiktok", label: "TikTok", color: "#000000" },
  { key: "youtube", label: "YouTube", color: "#FF0000" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { key: "pinterest", label: "Pinterest", color: "#E60023" },
  { key: "reddit", label: "Reddit", color: "#FF4500" },
  { key: "discord", label: "Discord", color: "#5865F2" },
] as const;

const CONTENT_TYPES = [
  { key: "post", label: "Post", desc: "Single text + image" },
  { key: "carousel", label: "Carousel", desc: "Multiple slides" },
  { key: "reel", label: "Reel / Short", desc: "Video script" },
  { key: "story", label: "Story", desc: "24h content" },
  { key: "thread", label: "Thread", desc: "Sequential posts" },
  { key: "ad", label: "Ad", desc: "Paid promotion" },
  { key: "video_script", label: "Video Script", desc: "Long-form script" },
] as const;

interface ContentDraft {
  headline: string;
  body: string;
  hashtags: string[];
  callToAction: string;
  mediaPrompts: string[];
  platformSpecific: { format: string; maxLength: number; bestTime: string; notes?: string };
  moderationFlags: string[];
  estimatedEngagement: string;
  videoScript?: {
    hook: string;
    body: string;
    callToAction: string;
    captionSuggestion: string;
    trendingAudioHashtag?: string;
  };
  platform: string;
  contentType: string;
}

interface PlatformResult {
  draft: ContentDraft;
  contentItemId: string;
  contentScore: number;
  autoApproved: boolean;
  status: string;
}

interface Props {
  clientId: string;
  clientName: string;
}

export default function NewContentForm({ clientId, clientName }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<"configure" | "preview" | "schedule">("configure");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [contentType, setContentType] = useState<string>("post");
  const [topic, setTopic] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [locale, setLocale] = useState("en");
  const [scheduledFor, setScheduledFor] = useState("");

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultsByPlatform, setResultsByPlatform] = useState<Record<string, PlatformResult> | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Per-platform editable state
  const [editedBody, setEditedBody] = useState<Record<string, string>>({});
  const [editedHeadline, setEditedHeadline] = useState<Record<string, string>>({});
  const [editedCta, setEditedCta] = useState<Record<string, string>>({});
  const [editedHashtags, setEditedHashtags] = useState<Record<string, string>>({});

  // Per-platform media state
  const [generatingImage, setGeneratingImage] = useState<Record<string, boolean>>({});
  const [generatedImageUrl, setGeneratedImageUrl] = useState<Record<string, string | null>>({});
  const [generatingVideo, setGeneratingVideo] = useState<Record<string, boolean>>({});
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<Record<string, string | null>>({});
  const [selectedAssetUrl, setSelectedAssetUrl] = useState<Record<string, string | null>>({});

  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerTargetPlatform, setAssetPickerTargetPlatform] = useState<string | null>(null);
  const [clientAssets, setClientAssets] = useState<Array<{ id: string; filename: string; publicUrl: string | null; type: string }>>([]);

  function togglePlatform(key: string) {
    setPlatforms((prev) => {
      if (prev.includes(key)) {
        return prev.length > 1 ? prev.filter((p) => p !== key) : prev;
      }
      return [...prev, key];
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, platforms, contentType, topic, campaignBrief, locale }),
      });
      const data = await res.json() as { results?: PlatformResult[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      const results = data.results ?? [];
      const byPlatform: Record<string, PlatformResult> = {};
      const bodyMap: Record<string, string> = {};
      const headlineMap: Record<string, string> = {};
      const ctaMap: Record<string, string> = {};
      const hashtagsMap: Record<string, string> = {};
      for (const r of results) {
        byPlatform[r.draft.platform] = r;
        bodyMap[r.draft.platform] = r.draft.body;
        headlineMap[r.draft.platform] = r.draft.headline;
        ctaMap[r.draft.platform] = r.draft.callToAction;
        hashtagsMap[r.draft.platform] = r.draft.hashtags.join(" ");
      }
      setResultsByPlatform(byPlatform);
      setActivePlatform(results[0]?.draft.platform ?? null);
      setEditedBody(bodyMap);
      setEditedHeadline(headlineMap);
      setEditedCta(ctaMap);
      setEditedHashtags(hashtagsMap);
      setStep("preview");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateImage(platform: string) {
    const headline = editedHeadline[platform];
    if (!headline?.trim()) return;
    setGeneratingImage((prev) => ({ ...prev, [platform]: true }));
    setError(null);
    try {
      const res = await fetch("/api/content/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, prompt: headline, platform }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Image generation failed");
      setGeneratedImageUrl((prev) => ({ ...prev, [platform]: data.url ?? null }));
      setSelectedAssetUrl((prev) => ({ ...prev, [platform]: data.url ?? null }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGeneratingImage((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function handleGenerateVideo(platform: string) {
    const result = resultsByPlatform?.[platform];
    const prompt = result?.draft.videoScript?.hook ?? editedHeadline[platform];
    if (!prompt?.trim()) return;
    setGeneratingVideo((prev) => ({ ...prev, [platform]: true }));
    setError(null);
    try {
      const res = await fetch("/api/content/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, prompt, platform }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Video generation failed");
      setGeneratedVideoUrl((prev) => ({ ...prev, [platform]: data.url ?? null }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGeneratingVideo((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function openAssetPicker(platform: string) {
    setAssetPickerTargetPlatform(platform);
    setAssetPickerOpen(true);
    try {
      const res = await fetch(`/api/assets?clientId=${clientId}`);
      const data = (await res.json()) as { assets?: Array<{ id: string; filename: string; publicUrl: string | null; contentType: string }> };
      setClientAssets(
        (data.assets ?? []).map((a) => ({
          id: a.id,
          filename: a.filename,
          publicUrl: a.publicUrl,
          type: a.contentType.startsWith("image/") ? "image" : a.contentType.startsWith("video/") ? "video" : "document",
        }))
      );
    } catch {
      setClientAssets([]);
    }
  }

  function selectAsset(url: string) {
    if (assetPickerTargetPlatform) {
      setSelectedAssetUrl((prev) => ({ ...prev, [assetPickerTargetPlatform]: url }));
    }
    setAssetPickerOpen(false);
    setAssetPickerTargetPlatform(null);
  }

  async function handleSubmitForReview() {
    if (!resultsByPlatform) return;
    setSubmitting(true);
    setError(null);
    try {
      const platformsToSubmit = Object.keys(resultsByPlatform);
      for (const platform of platformsToSubmit) {
        const result = resultsByPlatform[platform];
        if (!result) continue;
        const res = await fetch(`/api/content/${result.contentItemId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "pending_review",
            scheduledFor: scheduledFor || undefined,
            edits: {
              body: editedBody[platform] ?? result.draft.body,
              headline: editedHeadline[platform] ?? result.draft.headline,
              callToAction: editedCta[platform] ?? result.draft.callToAction,
              hashtags: (editedHashtags[platform] ?? "").split(/\s+/).filter(Boolean),
            },
          }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? `Submit failed for ${platform}`);
        }
      }
      router.push(`/dashboard/clients/${clientId}/content`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const isVideoType = contentType === "reel" || contentType === "video_script";

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(["configure", "preview", "schedule"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: step === s ? "var(--brand-primary)" : s === "configure" || (step === "preview" && i < 1) || (step === "schedule" && i < 2) ? "var(--brand-success)" : "var(--subtle)",
                color: step === s || s === "configure" || (step === "preview" && i < 1) || (step === "schedule" && i < 2) ? "white" : "var(--text-muted)",
              }}
            >
              {i + 1}
            </div>
            <span className="text-xs font-medium capitalize" style={{ color: step === s ? "var(--text-primary)" : "var(--text-muted)" }}>
              {s === "configure" ? "Configure" : s === "preview" ? "Edit & Preview" : "Schedule"}
            </span>
            {i < 2 && <span style={{ color: "var(--border-soft)" }}>›</span>}
          </div>
        ))}
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--brand-danger)/10", color: "var(--brand-danger)", border: "1px solid var(--brand-danger)/20" }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Configure */}
      {step === "configure" && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Configure Content
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {/* Platform selection — multi-select */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Platforms <span style={{ color: "var(--text-muted)" }}>(select multiple)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const selected = platforms.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        onClick={() => togglePlatform(p.key)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                        style={{
                          border: `2px solid ${selected ? p.color : "var(--border-soft)"}`,
                          background: selected ? `${p.color}15` : "transparent",
                          color: selected ? p.color : "var(--text-secondary)",
                        }}
                      >
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
                        {selected && <span>✓</span>}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content type */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setContentType(t.key)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
                      style={{
                        border: `2px solid ${contentType === t.key ? "var(--brand-primary)" : "var(--border-soft)"}`,
                        background: contentType === t.key ? "var(--brand-primary)15" : "transparent",
                        color: contentType === t.key ? "var(--brand-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Topic / Theme <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Summer sale, New product launch, Behind the scenes..."
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none transition"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Campaign brief */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Campaign Brief <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <textarea
                  value={campaignBrief}
                  onChange={(e) => setCampaignBrief(e.target.value)}
                  rows={3}
                  placeholder="Any specific campaign context, promotions, or messaging guidelines..."
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none transition"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Locale */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Language
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none transition"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="pt">Portuguese</option>
                  <option value="de">German</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 self-start"
                style={{ background: "var(--brand-primary)" }}
              >
                {generating ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 70" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Edit & Preview */}
      {step === "preview" && resultsByPlatform && activePlatform && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("configure")}
              className="flex items-center gap-1 text-sm transition hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {Object.keys(resultsByPlatform).length} platform{Object.keys(resultsByPlatform).length > 1 ? "s" : ""} generated
              </span>
            </div>
          </div>

          {/* Platform tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(resultsByPlatform).map((key) => {
              const p = PLATFORMS.find((x) => x.key === key);
              const active = activePlatform === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePlatform(key)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    border: `2px solid ${active ? p?.color : "var(--border-soft)"}`,
                    background: active ? `${p?.color}15` : "transparent",
                    color: active ? p?.color : "var(--text-secondary)",
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: p?.color }} />
                  {p?.label}
                </button>
              );
            })}
          </div>

          {/* Active platform editor + preview */}
          {(() => {
            const platform = activePlatform;
            const result = resultsByPlatform[platform];
            if (!result) return null;
            const draft = result.draft;
            const pMeta = PLATFORMS.find((x) => x.key === platform);
            const hasVideo = isVideoType && draft.videoScript;

            return (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Editor */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: pMeta?.color }} />
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        Edit {pMeta?.label} Content
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Headline</label>
                        <input
                          type="text"
                          value={editedHeadline[platform] ?? ""}
                          onChange={(e) => setEditedHeadline((prev) => ({ ...prev, [platform]: e.target.value }))}
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                          style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Body</label>
                        <textarea
                          value={editedBody[platform] ?? ""}
                          onChange={(e) => setEditedBody((prev) => ({ ...prev, [platform]: e.target.value }))}
                          rows={6}
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                          style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                        />
                        <div className="text-right text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {(editedBody[platform] ?? "").length} / {draft.platformSpecific.maxLength} chars
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Call to Action</label>
                        <input
                          type="text"
                          value={editedCta[platform] ?? ""}
                          onChange={(e) => setEditedCta((prev) => ({ ...prev, [platform]: e.target.value }))}
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                          style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Hashtags</label>
                        <input
                          type="text"
                          value={editedHashtags[platform] ?? ""}
                          onChange={(e) => setEditedHashtags((prev) => ({ ...prev, [platform]: e.target.value }))}
                          placeholder="#hashtag1 #hashtag2"
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                          style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                        />
                      </div>

                      {/* Media generation buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {hasVideo ? (
                          <button
                            onClick={() => handleGenerateVideo(platform)}
                            disabled={generatingVideo[platform] || !(editedHeadline[platform] ?? "").trim()}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                            style={{ background: "#ec4899" }}
                          >
                            {generatingVideo[platform] ? (
                              <>
                                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 70" />
                                </svg>
                                Generating video…
                              </>
                            ) : (
                              <>🎬 Generate video with AI</>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateImage(platform)}
                            disabled={generatingImage[platform] || !(editedHeadline[platform] ?? "").trim()}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                            style={{ background: "#8b5cf6" }}
                          >
                            {generatingImage[platform] ? (
                              <>
                                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 70" />
                                </svg>
                                Generating…
                              </>
                            ) : (
                              <>✨ Generate image with AI</>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => openAssetPicker(platform)}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition hover:opacity-90"
                          style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)", background: "var(--surface)" }}
                        >
                          📁 Use client asset
                        </button>
                      </div>

                      {/* Media preview */}
                      {(generatedVideoUrl[platform] || generatedImageUrl[platform] || selectedAssetUrl[platform]) && (
                        <div className="mt-2 rounded-xl overflow-hidden border" style={{ borderColor: "var(--border-soft)" }}>
                          {generatedVideoUrl[platform] ? (
                            <video
                              src={generatedVideoUrl[platform]!}
                              controls
                              className="w-full h-auto rounded-lg"
                              style={{ maxHeight: 480 }}
                            />
                          ) : (
                            <img
                              src={generatedImageUrl[platform] ?? selectedAssetUrl[platform] ?? ""}
                              alt="Selected asset"
                              className="w-full h-auto object-contain rounded-lg"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {pMeta?.label} Preview
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-soft)" }}
                    >
                      {/* Mock platform post */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: pMeta?.color }}
                        >
                          {clientName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>@{clientName.toLowerCase().replace(/\s+/g, "")}</div>
                          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Just now · {pMeta?.label}</div>
                        </div>
                      </div>

                      {/* Media placeholder or actual media */}
                      {draft.mediaPrompts.length > 0 && !generatedImageUrl[platform] && !selectedAssetUrl[platform] && !generatedVideoUrl[platform] && (
                        <div
                          className="w-full rounded-lg mb-3 flex items-center justify-center text-xs"
                          style={{
                            background: `${pMeta?.color}15`,
                            color: "var(--text-muted)",
                            minHeight: 80,
                            border: `1px dashed ${pMeta?.color}40`,
                          }}
                        >
                          <div className="text-center px-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1" style={{ color: pMeta?.color }}>
                              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <p>{draft.mediaPrompts[0]?.slice(0, 60)}...</p>
                          </div>
                        </div>
                      )}

                      {(generatedImageUrl[platform] || selectedAssetUrl[platform]) && (
                        <div className="w-full rounded-lg mb-3 overflow-hidden">
                          <img
                            src={generatedImageUrl[platform] ?? selectedAssetUrl[platform] ?? ""}
                            alt="Media"
                            className="w-full h-auto object-contain rounded-lg"
                          />
                        </div>
                      )}

                      {generatedVideoUrl[platform] && (
                        <div className="w-full rounded-lg mb-3 overflow-hidden">
                          <video
                            src={generatedVideoUrl[platform]!}
                            controls
                            className="w-full h-auto rounded-lg"
                            style={{ maxHeight: 480 }}
                          />
                        </div>
                      )}

                      <p className="text-xs leading-relaxed whitespace-pre-wrap mb-2" style={{ color: "var(--text-primary)" }}>
                        {(editedBody[platform] ?? "").slice(0, 200)}{(editedBody[platform] ?? "").length > 200 ? "..." : ""}
                      </p>
                      <p className="text-xs" style={{ color: pMeta?.color }}>
                        {(editedHashtags[platform] ?? "").split(/\s+/).filter(Boolean).slice(0, 5).join(" ")}
                      </p>

                      <div className="mt-3 pt-2 flex items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-soft)" }}>
                        <span>Best time: {draft.platformSpecific.bestTime}</span>
                        <span>·</span>
                        <span>Est. engagement: {draft.estimatedEngagement}</span>
                      </div>
                    </div>

                    {/* Video script */}
                    {draft.videoScript && (
                      <div className="mt-4 rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-soft)" }}>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Video Script</h4>
                        <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <div><strong>Hook (0-3s):</strong> {draft.videoScript.hook}</div>
                          <div><strong>Body:</strong> {draft.videoScript.body.slice(0, 100)}...</div>
                          <div><strong>CTA:</strong> {draft.videoScript.callToAction}</div>
                          {draft.videoScript.trendingAudioHashtag && (
                            <div><strong>Trending audio:</strong> {draft.videoScript.trendingAudioHashtag}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Media prompts */}
                    {draft.mediaPrompts.length > 1 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Media Suggestions</h4>
                        <ul className="space-y-1">
                          {draft.mediaPrompts.map((mp, i) => (
                            <li key={i} className="text-xs flex gap-2" style={{ color: "var(--text-muted)" }}>
                              <span>•</span>
                              <span>{mp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Schedule</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Scheduled Date & Time <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                {activePlatform && resultsByPlatform[activePlatform] && (
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Best time: {resultsByPlatform[activePlatform]!.draft.platformSpecific.bestTime}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--brand-primary)" }}
            >
              {submitting ? "Submitting..." : "Submit All for Review"}
            </button>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              This will send all platform drafts to the strategist review queue
            </span>
          </div>
        </div>
      )}

      {/* Asset picker modal */}
      {assetPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Select Client Asset</h3>
            {clientAssets.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No assets found for this client.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {clientAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => selectAsset(asset.publicUrl ?? "")}
                    className="flex flex-col items-center gap-2 rounded-xl border p-3 transition hover:bg-[var(--subtle)]"
                    style={{ borderColor: "var(--border-soft)" }}
                  >
                    {asset.type === "image" && asset.publicUrl ? (
                      <img src={asset.publicUrl} alt={asset.filename} className="w-full h-16 object-cover rounded-lg" />
                    ) : asset.type === "video" && asset.publicUrl ? (
                      <video src={asset.publicUrl} className="w-full h-16 object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">🖼</span>
                    )}
                    <span className="text-[10px] truncate w-full text-center" style={{ color: "var(--text-secondary)" }}>{asset.filename}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setAssetPickerOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium transition"
                style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
