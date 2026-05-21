"use client";

import type { ApprovalComment, ApprovalDecision, ApprovalStatus } from "@getpostflow/approvals";
import { Badge } from "./badge";

// ─── DecisionBadge ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" }> = {
  draft: { label: "Draft", variant: "muted" },
  pending_internal_review: { label: "Pending Review", variant: "warning" },
  pending_client_review: { label: "With Client", variant: "warning" },
  revision_requested: { label: "Changes Requested", variant: "danger" },
  approved: { label: "Approved", variant: "success" },
  scheduled: { label: "Scheduled", variant: "default" },
  publishing: { label: "Publishing", variant: "default" },
  published: { label: "Published", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  client_published: { label: "Client Published", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  approved_to_send: { label: "Approved to Send", variant: "success" },
  sending: { label: "Sending", variant: "default" },
  sent: { label: "Sent", variant: "success" },
  ai_drafting: { label: "AI Drafting", variant: "muted" },
  strategist_pending: { label: "Strategist Review", variant: "warning" },
  strategist_approved: { label: "Strategist Approved", variant: "success" },
  client_pending: { label: "Client Review", variant: "warning" },
  client_approved: { label: "Client Approved", variant: "success" },
  active: { label: "Active", variant: "success" },
  intake_pending: { label: "Intake Pending", variant: "warning" },
  ai_drafted: { label: "AI Drafted", variant: "default" },
  strategist_review: { label: "Strategist Review", variant: "warning" },
  client_review: { label: "Client Review", variant: "warning" },
  archived: { label: "Archived", variant: "muted" },
};

export function DecisionBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ─── CommentInput ─────────────────────────────────────────────────────────────

export interface CommentInputProps {
  onSubmit: (body: string, section?: string) => void;
  placeholder?: string;
  section?: string;
  disabled?: boolean;
}

export function CommentInput({ onSubmit, placeholder = "Add a comment…", section, disabled }: CommentInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const body = (form.elements.namedItem("body") as HTMLTextAreaElement).value.trim();
    if (!body) return;
    onSubmit(body, section);
    form.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        name="body"
        rows={3}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 transition"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface)",
          color: "var(--text-primary)",
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        className="self-end rounded-xl px-4 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--brand-primary)" }}
      >
        Comment
      </button>
    </form>
  );
}

// ─── ApprovalThread ───────────────────────────────────────────────────────────

export interface ApprovalThreadProps {
  comments: ApprovalComment[];
  decisions: ApprovalDecision[];
  status: ApprovalStatus | string;
  onComment?: (body: string, section?: string) => void;
  onApprove?: () => void;
  onRequestChanges?: (notes: string) => void;
  canApprove?: boolean;
  canComment?: boolean;
  isLoading?: boolean;
}

export function ApprovalThread({
  comments,
  decisions,
  status,
  onComment,
  onApprove,
  onRequestChanges,
  canApprove = false,
  canComment = true,
  isLoading = false,
}: ApprovalThreadProps) {
  const allEvents = [
    ...comments.map((c) => ({ ...c, type: "comment" as const })),
    ...decisions.map((d) => ({ ...d, type: "decision" as const })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Status
        </span>
        <DecisionBadge status={status} />
      </div>

      {/* Thread */}
      <div className="flex flex-col gap-3">
        {allEvents.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No activity yet.
          </p>
        )}
        {allEvents.map((event) => {
          if (event.type === "comment") {
            const c = event as ApprovalComment & { type: "comment" };
            return (
              <div
                key={c.id}
                className="rounded-xl border p-3 text-sm"
                style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs" style={{ color: "var(--text-primary)" }}>
                    {c.authorName}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {c.section && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full mb-1 inline-block"
                    style={{ background: "var(--subtle)", color: "var(--text-secondary)" }}
                  >
                    Re: {c.section}
                  </span>
                )}
                <p style={{ color: "var(--text-secondary)" }}>{c.body}</p>
              </div>
            );
          }
          const d = event as ApprovalDecision & { type: "decision" };
          return (
            <div
              key={d.id}
              className="rounded-xl border border-dashed p-3 text-sm"
              style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}
            >
              <div className="flex items-center gap-2">
                <DecisionBadge
                  status={
                    d.decision === "approved"
                      ? "approved"
                      : d.decision === "changes_requested"
                      ? "revision_requested"
                      : d.decision === "rejected"
                      ? "rejected"
                      : "draft"
                  }
                />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  by {d.decidedByName} · {new Date(d.createdAt).toLocaleString()}
                </span>
              </div>
              {d.notes && (
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {d.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {canApprove && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="rounded-xl px-4 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--brand-success)" }}
          >
            Approve
          </button>
          <button
            onClick={() => {
              const notes = window.prompt("What changes are needed?");
              if (notes) onRequestChanges?.(notes);
            }}
            disabled={isLoading}
            className="rounded-xl px-4 py-1.5 text-xs font-medium transition hover:bg-[var(--subtle)] disabled:opacity-50"
            style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
          >
            Request Changes
          </button>
        </div>
      )}

      {/* Comment input */}
      {canComment && onComment && (
        <CommentInput onSubmit={onComment} disabled={isLoading} />
      )}
    </div>
  );
}
