"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#000000",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  pinterest: "#E60023",
  reddit: "#FF4500",
  discord: "#5865F2",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  reddit: "Reddit",
  discord: "Discord",
};

interface ContentItemData {
  id: string;
  title: string;
  status: string;
  platform: string;
  contentType: string;
  locale: string;
  scheduledFor: string | null;
  publishedUrl: string | null;
  draftPayload: Record<string, unknown>;
}

interface VersionData {
  id: string;
  versionInt: number;
  body: string;
  changeSummary: string | null;
  createdAt: string;
}

interface Props {
  contentItem: ContentItemData;
  versions: VersionData[];
  clientId: string;
}

const STATUS_ACTIONS: Record<string, Array<{ label: string; status: string; variant: string }>> = {
  draft: [{ label: "Submit for Review", status: "pending_review", variant: "primary" }],
  pending_review: [
    { label: "Approve", status: "approved", variant: "success" },
    { label: "Return to Draft", status: "draft", variant: "muted" },
  ],
  approved: [{ label: "Schedule", status: "scheduled", variant: "primary" }],
  scheduled: [{ label: "Cancel / Back to Draft", status: "draft", variant: "muted" }],
  failed: [{ label: "Retry — Return to Draft", status: "draft", variant: "warning" }],
};

export default function ContentEditorClient({ contentItem, versions, clientId }: Props) {
  const router = useRouter();
  const draft = contentItem.draftPayload;

  const [body, setBody] = useState((draft.body as string) ?? "");
  const [headline, setHeadline] = useState((draft.headline as string) ?? "");
  const [cta, setCta] = useState((draft.callToAction as string) ?? "");
  const [hashtags, setHashtags] = useState(
    ((draft.hashtags as string[]) ?? []).join(" ")
  );
  const [scheduledFor, setScheduledFor] = useState(
    contentItem.scheduledFor
      ? new Date(contentItem.scheduledFor).toISOString().slice(0, 16)
      : ""
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const platformColor = PLATFORM_COLORS[contentItem.platform] ?? "#888";
  const platformLabel = PLATFORM_LABELS[contentItem.platform] ?? contentItem.platform;

  const videoScript = draft.videoScript as {
    hook: string;
    body: string;
    callToAction: string;
    captionSuggestion: string;
    trendingAudioHashtag?: string;
  } | undefined;

  async function handleStatusTransition(toStatus: string) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/content/${contentItem.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: toStatus,
          scheduledFor: (toStatus === "scheduled" || scheduledFor) ? scheduledFor || undefined : undefined,
          edits: { body, headline, callToAction: cta, hashtags: hashtags.split(/\s+/).filter(Boolean) },
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setSuccess(`Status updated to ${toStatus}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/content/${contentItem.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          edits: { body, headline, callToAction: cta, hashtags: hashtags.split(/\s+/).filter(Boolean) },
          changeSummary: "Manual edit",
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSuccess("Changes saved");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleVersionRevert(version: VersionData) {
    setBody(version.body);
    setSelectedVersionId(version.id);
    setSuccess(`Viewing v${version.versionInt} — click Save to persist this as a new version`);
  }

  const actions = STATUS_ACTIONS[contentItem.status] ?? [];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Left: editor */}
      <div className="md:col-span-2 flex flex-col gap-4">
        {/* Feedback */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--brand-danger)/10", color: "var(--brand-danger)", border: "1px solid var(--brand-danger)/20" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--brand-success)/10", color: "var(--brand-success)", border: "1px solid var(--brand-success)/20" }}>
            {success}
          </div>
        )}

        {selectedVersionId && (
          <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: "var(--brand-warning)/10", color: "var(--brand-warning)", border: "1px solid var(--brand-warning)/20" }}>
            Viewing a previous version. Current live version is not shown. Save to create a new version with these changes.
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: platformColor }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {platformLabel} — {contentItem.contentType}
                </h3>
              </div>
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-80 disabled:opacity-50"
                style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-y"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Call to Action</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Hashtags</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#brand #product"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video script */}
        {videoScript && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Video Script</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Hook (0-3s)</span>
                  <p className="mt-0.5">{videoScript.hook}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Body</span>
                  <p className="mt-0.5">{videoScript.body}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>CTA</span>
                  <p className="mt-0.5">{videoScript.callToAction}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Caption</span>
                  <p className="mt-0.5">{videoScript.captionSuggestion}</p>
                </div>
                {videoScript.trendingAudioHashtag && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Trending Audio</span>
                    <p className="mt-0.5">{videoScript.trendingAudioHashtag}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media prompts */}
        {Array.isArray(draft.mediaPrompts) && (draft.mediaPrompts as string[]).length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Media Suggestions</h3>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {(draft.mediaPrompts as string[]).map((mp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="mt-0.5" style={{ color: "var(--text-muted)" }}>•</span>
                    {mp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Platform preview */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {platformLabel} Preview
            </h3>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl p-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-soft)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: platformColor }}
                >
                  {clientId.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>@brand</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{platformLabel}</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap mb-2" style={{ color: "var(--text-primary)" }}>
                {body.slice(0, 300)}{body.length > 300 ? "…" : ""}
              </p>
              <p className="text-xs" style={{ color: platformColor }}>
                {hashtags.split(/\s+/).filter(Boolean).slice(0, 8).join(" ")}
              </p>
              {contentItem.publishedUrl && (
                <a
                  href={contentItem.publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs transition hover:opacity-80"
                  style={{ color: platformColor }}
                >
                  View on {platformLabel}
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3h7v7M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: sidebar */}
      <div className="flex flex-col gap-4">
        {/* Status actions */}
        {actions.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleStatusTransition(action.status)}
                    disabled={saving}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
                    style={{
                      background:
                        action.variant === "primary"
                          ? "var(--brand-primary)"
                          : action.variant === "success"
                          ? "var(--brand-success)"
                          : action.variant === "warning"
                          ? "var(--brand-warning)"
                          : "var(--bg-surface)",
                      color:
                        action.variant === "muted" ? "var(--text-secondary)" : "white",
                      border: action.variant === "muted" ? "1px solid var(--border-soft)" : "none",
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meta */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Details</h3>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-xs">
              {[
                ["Platform", platformLabel],
                ["Type", contentItem.contentType],
                ["Locale", contentItem.locale],
                ["Status", contentItem.status],
                ["Scheduled", contentItem.scheduledFor ? new Date(contentItem.scheduledFor).toLocaleString() : "Unscheduled"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt style={{ color: "var(--text-muted)" }}>{k}</dt>
                  <dd className="font-medium text-right" style={{ color: "var(--text-secondary)" }}>{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Version history */}
        {versions.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Version History ({versions.length})
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1.5">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleVersionRevert(v)}
                    className="flex items-start gap-2 rounded-lg p-2 text-left transition hover:opacity-80"
                    style={{
                      background: selectedVersionId === v.id ? "var(--brand-primary)10" : "transparent",
                      border: `1px solid ${selectedVersionId === v.id ? "var(--brand-primary)40" : "transparent"}`,
                    }}
                  >
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0"
                      style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
                    >
                      {v.versionInt}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {v.changeSummary ?? `Version ${v.versionInt}`}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
