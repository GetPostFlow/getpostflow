"use client";

import { useState } from "react";
import type { BrandStrategyDraft } from "@getpostflow/ai";
import { clientApproveStrategy, clientRequestChanges } from "../../../../(app)/dashboard/clients/actions";

interface ClientPortalStrategyProps {
  strategyId: string;
  clientName: string;
  draft: BrandStrategyDraft;
  status: string;
  tokenHash: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      <h3
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#9ca3af",
          marginBottom: "12px",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ClientPortalStrategy({
  strategyId,
  clientName,
  draft,
  status,
  tokenHash,
}: ClientPortalStrategyProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesComment, setChangesComment] = useState("");
  const [outcome, setOutcome] = useState<"approved" | "changes_requested" | null>(
    status === "active" || status === "client_approved" ? "approved" : null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setIsApproving(true);
    setError(null);
    try {
      await clientApproveStrategy(strategyId, tokenHash);
      setOutcome("approved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setIsApproving(false);
    }
  }

  async function handleRequestChanges() {
    if (!changesComment.trim()) return;
    setIsRequestingChanges(true);
    setError(null);
    try {
      await clientRequestChanges(strategyId, tokenHash, changesComment);
      setOutcome("changes_requested");
      setShowChangesModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setIsRequestingChanges(false);
    }
  }

  if (outcome === "approved") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "64px 24px",
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>
          Strategy Approved!
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
          Thank you for reviewing and approving the brand strategy for <strong>{clientName}</strong>.
          Your agency will now begin executing the plan.
        </p>
      </div>
    );
  }

  if (outcome === "changes_requested") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "64px 24px",
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
          }}
        >
          ✎
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>
          Changes Requested
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
          Your feedback has been sent to the strategy team. They will review your comments and update the strategy.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
          Brand Strategy Review
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Please review the brand strategy for <strong>{clientName}</strong> below. Once approved, your agency will begin executing the plan.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* Strategy sections */}
      <Section title="Positioning Statement">
        <p
          style={{
            fontStyle: "italic",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#374151",
          }}
        >
          &ldquo;{draft.positioningStatement}&rdquo;
        </p>
      </Section>

      {draft.brandVoiceGuide && (
        <Section title="Brand Voice">
          <p style={{ color: "#4b5563", fontSize: "14px", marginBottom: "12px", lineHeight: 1.6 }}>
            {draft.brandVoiceGuide.description}
          </p>
          {draft.brandVoiceGuide.doAndDonts && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#10b981", marginBottom: "8px" }}>DO</p>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {draft.brandVoiceGuide.doAndDonts.do?.map((item, i) => (
                    <li key={i} style={{ fontSize: "13px", color: "#4b5563", marginBottom: "4px" }}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444", marginBottom: "8px" }}>{"DON'T"}</p>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {draft.brandVoiceGuide.doAndDonts.dont?.map((item, i) => (
                    <li key={i} style={{ fontSize: "13px", color: "#4b5563", marginBottom: "4px" }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Section>
      )}

      <Section title="Target Audience Personas">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {draft.audiencePersonas?.map((persona, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
                background: "#f9fafb",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "2px", color: "#1a1a1a" }}>
                {persona.name}
              </p>
              <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>{persona.ageRange}</p>
              <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>{persona.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Content Pillars">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {draft.contentPillars?.map((pillar, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#6366f1",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "bold",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {i + 1}
              </span>
              <div>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a1a", marginBottom: "2px" }}>{pillar.name}</p>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sample Posts">
        {draft.samplePostsByPlatform &&
          Object.entries(draft.samplePostsByPlatform).map(([platform, posts]) => (
            <div key={platform} style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "#9ca3af", marginBottom: "8px" }}>
                {platform}
              </p>
              {(posts as Array<{ caption: string; hashtags: string[] }>).slice(0, 2).map((post, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "8px",
                    background: "#f9fafb",
                  }}
                >
                  <p style={{ fontSize: "13px", color: "#374151", marginBottom: "6px", lineHeight: 1.5 }}>{post.caption}</p>
                  <p style={{ fontSize: "12px", color: "#6366f1" }}>{post.hashtags?.join(" ")}</p>
                </div>
              ))}
            </div>
          ))}
      </Section>

      {/* Approval actions */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", marginBottom: "6px" }}>
          Ready to approve this strategy?
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
          Approving will lock the brand strategy and allow your agency to start creating content.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            style={{
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isApproving ? "not-allowed" : "pointer",
              opacity: isApproving ? 0.6 : 1,
            }}
          >
            {isApproving ? "Approving…" : "Approve Strategy"}
          </button>
          <button
            onClick={() => setShowChangesModal(true)}
            style={{
              background: "transparent",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Request Changes
          </button>
        </div>
      </div>

      {/* Changes modal */}
      {showChangesModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Request Changes</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
              Please describe what changes you&apos;d like to see in the strategy.
            </p>
            <textarea
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              rows={4}
              placeholder="e.g. The brand voice feels too casual. We'd prefer a more professional tone for LinkedIn…"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "13px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                onClick={() => setShowChangesModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={isRequestingChanges || !changesComment.trim()}
                style={{
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: isRequestingChanges || !changesComment.trim() ? "not-allowed" : "pointer",
                  opacity: isRequestingChanges || !changesComment.trim() ? 0.6 : 1,
                }}
              >
                {isRequestingChanges ? "Sending…" : "Send Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
