"use client";

import { useState, useTransition } from "react";
import type { BrandStrategyDraft } from "@getpostflow/ai";
import { ApprovalThread } from "@getpostflow/ui";
import type { ApprovalComment, ApprovalDecision } from "@getpostflow/approvals";
import { strategistApproveStrategy, addStrategistComment, regenerateSection } from "../../../actions";

interface StrategyRecord {
  id: string;
  clientId: string;
  versionInt: number;
  status: string;
  draftPayload: Record<string, unknown>;
  editedPayload: Record<string, unknown>;
  strategistComments: unknown[];
  aiMetadata: Record<string, unknown>;
}

interface ClientRecord {
  id: string;
  name: string;
  slug: string;
  status: string;
}

// ─── Section renderer ─────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  sectionKey,
  onRegenerate,
  isRegenerating,
}: {
  title: string;
  children: React.ReactNode;
  sectionKey: string;
  onRegenerate: (key: string) => void;
  isRegenerating: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--border-soft)", background: "var(--canvas)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {title}
        </h3>
        <button
          onClick={() => onRegenerate(sectionKey)}
          disabled={isRegenerating}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:bg-[var(--subtle)] disabled:opacity-40"
          style={{ color: "var(--text-secondary)", border: "1px solid var(--border-soft)" }}
          title="Regenerate this section with AI"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className={isRegenerating ? "animate-spin" : ""}>
            <path d="M1.5 8A6.5 6.5 0 008 14.5M14.5 8A6.5 6.5 0 008 1.5M1.5 8H4M14.5 8H12M1.5 8l2-2M1.5 8l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {isRegenerating ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── Draft display ────────────────────────────────────────────────────────────

function DraftView({ draft, onRegenerate, regeneratingSection }: {
  draft: BrandStrategyDraft;
  onRegenerate: (section: string) => void;
  regeneratingSection: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
      <SectionCard title="Positioning Statement" sectionKey="positioningStatement" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "positioningStatement"}>
        <p className="text-sm italic" style={{ color: "var(--text-primary)" }}>&ldquo;{draft.positioningStatement}&rdquo;</p>
      </SectionCard>

      <SectionCard title="Brand Voice Guide" sectionKey="brandVoiceGuide" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "brandVoiceGuide"}>
        {draft.brandVoiceGuide && (
          <div className="flex flex-col gap-2">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{draft.brandVoiceGuide.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { label: "Formal↔Casual", value: draft.brandVoiceGuide.formalCasual },
                { label: "Serious↔Playful", value: draft.brandVoiceGuide.seriousPlayful },
                { label: "Conservative↔Bold", value: draft.brandVoiceGuide.conservativeBold },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>{value}/10</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</div>
                </div>
              ))}
            </div>
            {draft.brandVoiceGuide.doAndDonts && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="text-[10px] font-medium mb-1" style={{ color: "var(--brand-success)" }}>DO</p>
                  <ul className="text-xs space-y-0.5" style={{ color: "var(--text-secondary)" }}>
                    {draft.brandVoiceGuide.doAndDonts.do?.slice(0, 3).map((item, i) => <li key={i}>• {item}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-medium mb-1" style={{ color: "var(--brand-danger)" }}>DON'T</p>
                  <ul className="text-xs space-y-0.5" style={{ color: "var(--text-secondary)" }}>
                    {draft.brandVoiceGuide.doAndDonts.dont?.slice(0, 3).map((item, i) => <li key={i}>• {item}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Audience Personas" sectionKey="audiencePersonas" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "audiencePersonas"}>
        <div className="flex flex-col gap-3">
          {draft.audiencePersonas?.map((persona, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{persona.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{persona.ageRange}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{persona.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Content Pillars" sectionKey="contentPillars" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "contentPillars"}>
        <div className="flex flex-col gap-2">
          {draft.contentPillars?.map((pillar, i) => (
            <div key={i} className="flex gap-2">
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                style={{ background: "var(--brand-primary)" }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{pillar.name}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Sample Posts" sectionKey="samplePostsByPlatform" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "samplePostsByPlatform"}>
        {draft.samplePostsByPlatform && Object.entries(draft.samplePostsByPlatform).map(([platform, posts]) => (
          <div key={platform} className="mb-3">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-2" style={{ color: "var(--text-muted)" }}>{platform}</p>
            {(posts as Array<{ caption: string; hashtags: string[] }>).slice(0, 2).map((post, i) => (
              <div key={i} className="rounded-lg border p-2 mb-1.5 text-xs" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
                <p style={{ color: "var(--text-primary)" }}>{post.caption}</p>
                <p className="mt-1 text-[10px]" style={{ color: "var(--brand-primary)" }}>{post.hashtags?.join(" ")}</p>
              </div>
            ))}
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Hashtag Strategy" sectionKey="hashtagStrategy" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "hashtagStrategy"}>
        {draft.hashtagStrategy && Object.entries(draft.hashtagStrategy).map(([platform, tags]) => (
          <div key={platform} className="mb-2">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{platform}</p>
            <div className="flex flex-wrap gap-1">
              {(tags as string[]).map((tag, i) => (
                <span key={i} className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "var(--subtle)", color: "var(--text-secondary)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Risk Flags" sectionKey="riskFlagsForReview" onRegenerate={onRegenerate} isRegenerating={regeneratingSection === "riskFlagsForReview"}>
        {draft.riskFlagsForReview?.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No risk flags identified.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {draft.riskFlagsForReview?.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span style={{ color: "var(--brand-warning)" }}>⚠</span>
                <span style={{ color: "var(--text-secondary)" }}>{flag}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Editable form ────────────────────────────────────────────────────────────

function EditableForm({ draft, onChange }: { draft: BrandStrategyDraft; onChange: (d: BrandStrategyDraft) => void }) {
  function updateField(field: string, value: unknown) {
    onChange({ ...draft, [field]: value });
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
      {/* Positioning Statement */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Positioning Statement</label>
        <textarea
          rows={3}
          value={draft.positioningStatement ?? ""}
          onChange={(e) => updateField("positioningStatement", e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 transition"
          style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
        />
      </div>

      {/* Brand Voice Description */}
      {draft.brandVoiceGuide && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Brand Voice Description</label>
          <textarea
            rows={3}
            value={draft.brandVoiceGuide.description ?? ""}
            onChange={(e) =>
              updateField("brandVoiceGuide", { ...draft.brandVoiceGuide, description: e.target.value })
            }
            className="rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 transition"
            style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
          />
        </div>
      )}

      {/* Content Pillars */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Content Pillars</label>
        {draft.contentPillars?.map((pillar, i) => (
          <div key={i} className="flex flex-col gap-1">
            <input
              value={pillar.name ?? ""}
              onChange={(e) => {
                const updated = [...(draft.contentPillars ?? [])];
                updated[i] = { ...updated[i], name: e.target.value };
                updateField("contentPillars", updated);
              }}
              className="rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
              style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
              placeholder="Pillar name"
            />
            <textarea
              rows={2}
              value={pillar.description ?? ""}
              onChange={(e) => {
                const updated = [...(draft.contentPillars ?? [])];
                updated[i] = { ...updated[i], description: e.target.value };
                updateField("contentPillars", updated);
              }}
              className="rounded-xl border px-3 py-1.5 text-xs resize-none focus:outline-none transition"
              style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-secondary)" }}
              placeholder="Description"
            />
          </div>
        ))}
      </div>

      {/* Do Not Mention */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Do Not Mention</label>
        <textarea
          rows={2}
          value={(draft.doNotMention ?? []).join("\n")}
          onChange={(e) =>
            updateField(
              "doNotMention",
              e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
            )
          }
          className="rounded-xl border px-3 py-2 text-xs resize-none focus:outline-none transition"
          style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
          placeholder="One item per line"
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StrategyReviewClient({
  strategy,
  client,
}: {
  strategy: StrategyRecord;
  client: ClientRecord;
}) {
  const [isPending, startTransition] = useTransition();
  const [editedDraft, setEditedDraft] = useState<BrandStrategyDraft>(
    (strategy.editedPayload ?? strategy.draftPayload) as unknown as BrandStrategyDraft
  );
  const [comments, setComments] = useState<ApprovalComment[]>(
    (strategy.strategistComments ?? []) as ApprovalComment[]
  );
  const [decisions, setDecisions] = useState<ApprovalDecision[]>([]);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleApprove() {
    setIsApproving(true);
    try {
      const result = await strategistApproveStrategy(
        strategy.id,
        editedDraft as unknown as Record<string, unknown>
      );
      if (result?.success) {
        const msg = (result as Record<string, unknown>).stubUrl
          ? `Strategy approved! Dev stub link: ${(result as Record<string, unknown>).stubUrl}`
          : 'Strategy approved! Client review email has been sent.';
        setNotification({ type: 'success', message: msg });
        setDecisions((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            decidedByUserId: "strategist",
            decidedByName: "Strategist",
            decision: "approved",
            notes: "Approved and sent to client for review",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      setNotification({ type: "error", message: "Failed to approve. Please try again." });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleComment(body: string, section?: string) {
    startTransition(async () => {
      await addStrategistComment(strategy.id, body, section);
      setComments((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          authorId: "strategist",
          authorName: "Strategist",
          body,
          section,
          createdAt: new Date().toISOString(),
        },
      ]);
    });
  }

  async function handleRegenerate(sectionKey: string) {
    setRegeneratingSection(sectionKey);
    try {
      const result = await regenerateSection(strategy.id, sectionKey as keyof BrandStrategyDraft);
      if (result?.section) {
        setEditedDraft((prev) => ({ ...prev, ...result.section }));
      }
    } catch (e) {
      console.error("Failed to regenerate section:", e);
    } finally {
      setRegeneratingSection(null);
    }
  }

  const isApproved = strategy.status === "client_pending" || strategy.status === "client_approved" || strategy.status === "active";

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Notification */}
      {notification && (
        <div
          className="rounded-xl border px-4 py-3 text-sm flex items-center justify-between"
          style={{
            borderColor: notification.type === "success" ? "var(--brand-success)" : "var(--brand-danger)",
            background: notification.type === "success" ? "var(--brand-success)/10" : "var(--brand-danger)/10",
            color: notification.type === "success" ? "var(--brand-success)" : "var(--brand-danger)",
          }}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Strategy Review — {client.name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Version {strategy.versionInt} · Review AI draft and approve to send to client
          </p>
        </div>
        <a
          href={`/dashboard/clients/${client.id}`}
          className="text-xs transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Workspace
        </a>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Left: AI Draft (read-only) */}
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Draft</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "var(--subtle)", color: "var(--text-muted)" }}
            >
              Read-only
            </span>
            {Boolean((strategy.aiMetadata as Record<string, unknown>)?.stubMode) && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: "var(--brand-warning)/20", color: "var(--brand-warning)" }}
              >
                Stub Mode
              </span>
            )}
          </div>
          <DraftView
            draft={strategy.draftPayload as unknown as BrandStrategyDraft}
            onRegenerate={handleRegenerate}
            regeneratingSection={regeneratingSection}
          />
        </div>

        {/* Right: Editable + Approval Thread */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border p-4 flex-1"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Editable Version
            </h2>
            <EditableForm draft={editedDraft} onChange={setEditedDraft} />
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Approval Thread
            </h2>
            <ApprovalThread
              comments={comments}
              decisions={decisions}
              status={strategy.status}
              onComment={handleComment}
              onApprove={isApproved ? undefined : handleApprove}
              canApprove={!isApproved && strategy.status === "strategist_pending"}
              canComment
              isLoading={isPending || isApproving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
