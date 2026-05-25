"use client";

import { useState } from "react";
import type { BrandStrategyDraft } from "@getpostflow/ai";
import { clientApproveStrategy, clientRequestChanges, clientRejectStrategy } from "../../../../(app)/dashboard/clients/actions";

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
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [changesComment, setChangesComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [outcome, setOutcome] = useState<"approved" | "changes_requested" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApproved = status === "active" || status === "client_approved";
  const isPending = status === "client_pending" || status === "strategist_approved" || status === "strategist_pending" || status === "ai_drafting";

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

  async function handleReject() {
    if (!rejectComment.trim()) return;
    setIsRejecting(true);
    setError(null);
    try {
      await clientRejectStrategy(strategyId, tokenHash, rejectComment);
      setOutcome("rejected");
      setShowRejectModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  }

  if (outcome === "approved") {
    return (
      <div>
        <ApprovedBanner clientName={clientName} />
        <StrategyContent
          draft={draft}
          clientName={clientName}
          strategyId={strategyId}
          tokenHash={tokenHash}
          status={status}
          onApprove={handleApprove}
          onRequestChanges={() => setShowChangesModal(true)}
          onReject={() => setShowRejectModal(true)}
          isApproving={isApproving}
          isRequestingChanges={isRequestingChanges}
          isRejecting={isRejecting}
          changesComment={changesComment}
          setChangesComment={setChangesComment}
          showChangesModal={showChangesModal}
          setShowChangesModal={setShowChangesModal}
          handleRequestChanges={handleRequestChanges}
          rejectComment={rejectComment}
          setRejectComment={setRejectComment}
          showRejectModal={showRejectModal}
          setShowRejectModal={setShowRejectModal}
          handleReject={handleReject}
          error={error}
        />
      </div>
    );
  }

  if (outcome === "changes_requested") {
    return (
      <div>
        <ChangesRequestedBanner />
        <StrategyContent
          draft={draft}
          clientName={clientName}
          strategyId={strategyId}
          tokenHash={tokenHash}
          status={status}
          onApprove={handleApprove}
          onRequestChanges={() => setShowChangesModal(true)}
          onReject={() => setShowRejectModal(true)}
          isApproving={isApproving}
          isRequestingChanges={isRequestingChanges}
          isRejecting={isRejecting}
          changesComment={changesComment}
          setChangesComment={setChangesComment}
          showChangesModal={showChangesModal}
          setShowChangesModal={setShowChangesModal}
          handleRequestChanges={handleRequestChanges}
          rejectComment={rejectComment}
          setRejectComment={setRejectComment}
          showRejectModal={showRejectModal}
          setShowRejectModal={setShowRejectModal}
          handleReject={handleReject}
          error={error}
        />
      </div>
    );
  }

  if (outcome === "rejected") {
    return (
      <div>
        <RejectedBanner />
        <StrategyContent
          draft={draft}
          clientName={clientName}
          strategyId={strategyId}
          tokenHash={tokenHash}
          status={status}
          onApprove={handleApprove}
          onRequestChanges={() => setShowChangesModal(true)}
          onReject={() => setShowRejectModal(true)}
          isApproving={isApproving}
          isRequestingChanges={isRequestingChanges}
          isRejecting={isRejecting}
          changesComment={changesComment}
          setChangesComment={setChangesComment}
          showChangesModal={showChangesModal}
          setShowChangesModal={setShowChangesModal}
          handleRequestChanges={handleRequestChanges}
          rejectComment={rejectComment}
          setRejectComment={setRejectComment}
          showRejectModal={showRejectModal}
          setShowRejectModal={setShowRejectModal}
          handleReject={handleReject}
          error={error}
        />
      </div>
    );
  }

  return (
    <div>
      {isApproved && <ApprovedBanner clientName={clientName} />}
      {isPending && <DraftBanner />}
      <StrategyContent
        draft={draft}
        clientName={clientName}
        strategyId={strategyId}
        tokenHash={tokenHash}
        status={status}
        onApprove={handleApprove}
        onRequestChanges={() => setShowChangesModal(true)}
        onReject={() => setShowRejectModal(true)}
        isApproving={isApproving}
        isRequestingChanges={isRequestingChanges}
        isRejecting={isRejecting}
        changesComment={changesComment}
        setChangesComment={setChangesComment}
        showChangesModal={showChangesModal}
        setShowChangesModal={setShowChangesModal}
        handleRequestChanges={handleRequestChanges}
        rejectComment={rejectComment}
        setRejectComment={setRejectComment}
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
        handleReject={handleReject}
        error={error}
      />
    </div>
  );
}

function ApprovedBanner({ clientName }: { clientName: string }) {
  return (
    <div
      style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#d1fae5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        ✓
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#065f46", marginBottom: "2px" }}>
          Strategy Approved
        </p>
        <p style={{ fontSize: "13px", color: "#16a34a" }}>
          Thank you for reviewing and approving the brand strategy for <strong>{clientName}</strong>.
          Your agency will now begin executing the plan.
        </p>
      </div>
    </div>
  );
}

function RejectedBanner() {
  return (
    <div
      style={{
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        ✕
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#991b1b", marginBottom: "2px" }}>
          Strategy Rejected
        </p>
        <p style={{ fontSize: "13px", color: "#dc2626" }}>
          Your feedback has been sent to the strategy team. They will review your comments and revise the strategy.
        </p>
      </div>
    </div>
  );
}

function ChangesRequestedBanner() {
  return (
    <div
      style={{
        background: "#fef3c7",
        border: "1px solid #fde68a",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#fef3c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        ✎
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#92400e", marginBottom: "2px" }}>
          Changes Requested
        </p>
        <p style={{ fontSize: "13px", color: "#d97706" }}>
          Your feedback has been sent to the strategy team. They will review your comments and update the strategy.
        </p>
      </div>
    </div>
  );
}

function DraftBanner() {
  return (
    <div
      style={{
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#dbeafe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        📝
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e40af", marginBottom: "2px" }}>
          Draft Strategy
        </p>
        <p style={{ fontSize: "13px", color: "#3b82f6" }}>
          This strategy is still in draft. Review the content below and request changes if needed.
        </p>
      </div>
    </div>
  );
}

interface StrategyContentProps {
  draft: BrandStrategyDraft;
  clientName: string;
  strategyId: string;
  tokenHash: string;
  status: string;
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRequestingChanges: boolean;
  isRejecting: boolean;
  changesComment: string;
  setChangesComment: (v: string) => void;
  showChangesModal: boolean;
  setShowChangesModal: (v: boolean) => void;
  handleRequestChanges: () => void;
  rejectComment: string;
  setRejectComment: (v: string) => void;
  showRejectModal: boolean;
  setShowRejectModal: (v: boolean) => void;
  handleReject: () => void;
  error: string | null;
}

function StrategyContent({
  draft,
  clientName,
  onApprove,
  onRequestChanges,
  onReject,
  isApproving,
  isRequestingChanges,
  isRejecting,
  changesComment,
  setChangesComment,
  showChangesModal,
  setShowChangesModal,
  handleRequestChanges,
  rejectComment,
  setRejectComment,
  showRejectModal,
  setShowRejectModal,
  handleReject,
  error,
}: StrategyContentProps) {
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {draft.contentPillars?.map((pillar, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#6366f1",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {i + 1}
              </span>
              {pillar.name}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                {(posts as Array<{ caption: string; hashtags: string[] }>).slice(0, 5).map((post, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "12px",
                      background: "#f9fafb",
                    }}
                  >
                    <p style={{ fontSize: "13px", color: "#374151", marginBottom: "6px", lineHeight: 1.5 }}>{post.caption}</p>
                    <p style={{ fontSize: "12px", color: "#6366f1" }}>{post.hashtags?.join(" ")}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </Section>

      {draft.hashtagStrategy && (
        <Section title="Hashtag Set">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(Array.isArray(draft.hashtagStrategy.primary) ? draft.hashtagStrategy.primary : []).map((tag: string, i: number) => (
              <span
                key={i}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  borderRadius: "999px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </Section>
      )}

      {draft.postingCadenceRecommendation && (
        <Section title="Recommended Cadence">
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>
            {draft.postingCadenceRecommendation.summary ?? "Post consistently across platforms to maintain engagement."}
          </p>
        </Section>
      )}

      <Section title="Brand Voice Summary">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tone</span>
            <p style={{ fontSize: "14px", color: "#374151", marginTop: "2px" }}>{draft.brandVoiceGuide.description}</p>
          </div>
          {draft.brandVoiceGuide.doAndDonts && (
            <>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Do Say</span>
                <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                  {draft.brandVoiceGuide.doAndDonts.do.map((s: string, i: number) => (
                    <li key={i} style={{ fontSize: "13px", color: "#374151" }}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{"Don't Say"}</span>
                <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                  {draft.brandVoiceGuide.doAndDonts.dont.map((s: string, i: number) => (
                    <li key={i} style={{ fontSize: "13px", color: "#374151" }}>{s}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
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
            onClick={onApprove}
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
            onClick={onRequestChanges}
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
          <button
            onClick={onReject}
            style={{
              background: "transparent",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reject
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

      {/* Reject modal */}
      {showRejectModal && (
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
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Reject Strategy</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
              Please explain why you are rejecting this strategy. This will be sent to the team.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={4}
              placeholder="e.g. This strategy doesn't align with our brand vision..."
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
                onClick={() => setShowRejectModal(false)}
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
                onClick={handleReject}
                disabled={isRejecting || !rejectComment.trim()}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: isRejecting || !rejectComment.trim() ? "not-allowed" : "pointer",
                  opacity: isRejecting || !rejectComment.trim() ? 0.6 : 1,
                }}
              >
                {isRejecting ? "Sending…" : "Reject Strategy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
