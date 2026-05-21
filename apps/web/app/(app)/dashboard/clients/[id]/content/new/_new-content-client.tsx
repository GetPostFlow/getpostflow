"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";

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
}

interface Props {
  clientId: string;
  clientName: string;
}

export default function NewContentForm({ clientId, clientName }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<"configure" | "preview" | "schedule">("configure");
  const [platform, setPlatform] = useState<string>("instagram");
  const [contentType, setContentType] = useState<string>("post");
  const [topic, setTopic] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [locale, setLocale] = useState("en");
  const [scheduledFor, setScheduledFor] = useState("");

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [editedHeadline, setEditedHeadline] = useState("");
  const [editedCta, setEditedCta] = useState("");
  const [editedHashtags, setEditedHashtags] = useState("");
  const [contentItemId, setContentItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentScore, setContentScore] = useState<number | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, platform, contentType, topic, campaignBrief, locale }),
      });
      const data = await res.json() as { draft: ContentDraft; contentItemId: string; contentScore: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setDraft(data.draft);
      setContentItemId(data.contentItemId);
      setContentScore(data.contentScore);
      setEditedBody(data.draft.body);
      setEditedHeadline(data.draft.headline);
      setEditedCta(data.draft.callToAction);
      setEditedHashtags(data.draft.hashtags.join(" "));
      setStep("preview");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmitForReview() {
    if (!contentItemId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/content/${contentItemId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "pending_review",
          scheduledFor: scheduledFor || undefined,
          edits: {
            body: editedBody,
            headline: editedHeadline,
            callToAction: editedCta,
            hashtags: editedHashtags.split(/\s+/).filter(Boolean),
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Submit failed");
      }
      router.push(`/dashboard/clients/${clientId}/content/${contentItemId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPlatform = PLATFORMS.find((p) => p.key === platform);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
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
              {/* Platform selection */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPlatform(p.key)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                      style={{
                        border: `2px solid ${platform === p.key ? p.color : "var(--border-soft)"}`,
                        background: platform === p.key ? `${p.color}15` : "transparent",
                        color: platform === p.key ? p.color : "var(--text-secondary)",
                      }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
                      {p.label}
                    </button>
                  ))}
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
                  style={{
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-subtle)",
                    color: "var(--text-primary)",
                  }}
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
                  style={{
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-subtle)",
                    color: "var(--text-primary)",
                  }}
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
                  style={{
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-subtle)",
                    color: "var(--text-primary)",
                  }}
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
      {step === "preview" && draft && (
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
            {contentScore !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>AI Content Score</span>
                <div
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    background: contentScore >= 0.85 ? "var(--brand-success)15" : contentScore >= 0.7 ? "var(--brand-warning)15" : "var(--brand-danger)15",
                    color: contentScore >= 0.85 ? "var(--brand-success)" : contentScore >= 0.7 ? "var(--brand-warning)" : "var(--brand-danger)",
                  }}
                >
                  {Math.round(contentScore * 100)}%
                </div>
              </div>
            )}
          </div>

          {draft.moderationFlags.length > 0 && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "var(--brand-warning)10", color: "var(--brand-warning)", border: "1px solid var(--brand-warning)20" }}
            >
              <strong>Moderation flags:</strong> {draft.moderationFlags.join("; ")}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: selectedPlatform?.color }}
                  />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Edit Content
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Headline</label>
                    <input
                      type="text"
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Body</label>
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={6}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                      style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                    />
                    <div className="text-right text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {editedBody.length} / {draft.platformSpecific.maxLength} chars
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Call to Action</label>
                    <input
                      type="text"
                      value={editedCta}
                      onChange={(e) => setEditedCta(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Hashtags</label>
                    <input
                      type="text"
                      value={editedHashtags}
                      onChange={(e) => setEditedHashtags(e.target.value)}
                      placeholder="#hashtag1 #hashtag2"
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform preview */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {selectedPlatform?.label} Preview
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
                      style={{ background: selectedPlatform?.color }}
                    >
                      {clientId.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>@clienthandle</div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Just now · {selectedPlatform?.label}</div>
                    </div>
                  </div>

                  {/* Media placeholder */}
                  {draft.mediaPrompts.length > 0 && (
                    <div
                      className="w-full rounded-lg mb-3 flex items-center justify-center text-xs"
                      style={{
                        background: `${selectedPlatform?.color}15`,
                        color: "var(--text-muted)",
                        minHeight: 80,
                        border: `1px dashed ${selectedPlatform?.color}40`,
                      }}
                    >
                      <div className="text-center px-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1" style={{ color: selectedPlatform?.color }}>
                          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>{draft.mediaPrompts[0]?.slice(0, 60)}...</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs leading-relaxed whitespace-pre-wrap mb-2" style={{ color: "var(--text-primary)" }}>
                    {editedBody.slice(0, 200)}{editedBody.length > 200 ? "..." : ""}
                  </p>
                  <p className="text-xs" style={{ color: selectedPlatform?.color }}>
                    {editedHashtags.split(/\s+/).filter(Boolean).slice(0, 5).join(" ")}
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
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Best time: {draft.platformSpecific.bestTime}
                </div>
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
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              This will send the draft to the strategist review queue
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
