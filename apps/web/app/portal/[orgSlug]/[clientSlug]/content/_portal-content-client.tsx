"use client";

import { useState } from "react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#000000",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  pinterest: "#E60023",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
};

const PLATFORM_HINTS: Record<string, string> = {
  instagram: "Square image (1080×1080). Caption up to 2,200 chars.",
  facebook: "Landscape (1200×630). Longer text OK.",
  tiktok: "Vertical video (9:16). Hook in first 3s.",
  youtube: "Thumbnail 1280×720. Description up to 5,000 chars.",
  linkedin: "Landscape (1200×627). Professional tone.",
  pinterest: "Vertical (1000×1500). Rich pins enabled.",
};

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  tiktok: 2200,
  youtube: 5000,
  linkedin: 3000,
  pinterest: 500,
};

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  body: string;
  callToAction: string;
  scheduledFor: string | null;
  status: string;
  contentType: string;
}

interface Props {
  clientName: string;
  token: string;
  items: ContentItem[];
}

type Decision = { [id: string]: "approved" | "rejected" | "pending" };

export default function PortalContentApprovalClient({ clientName, token, items }: Props) {
  const [decisions, setDecisions] = useState<Decision>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const pending = items.filter((i) => !submitted[i.id] && i.status === "pending_review");
  const alreadyApproved = items.filter((i) => i.status !== "pending_review" || submitted[i.id]);

  async function handleSubmit(itemId: string) {
    const decision = decisions[itemId];
    if (!decision || decision === "pending") return;

    setSubmitting((s) => ({ ...s, [itemId]: true }));
    setError(null);

    try {
      const res = await fetch("/api/portal/content-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentItemId: itemId, decision, feedback: feedbacks[itemId] ?? "", token }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted((s) => ({ ...s, [itemId]: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting((s) => ({ ...s, [itemId]: false }));
    }
  }

  if (items.length === 0) {
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
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>All caught up!</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          There are no content items pending your review right now.
          Your agency will notify you when new posts are ready for approval.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
          Content Approval
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Review and approve upcoming posts for <strong>{clientName}</strong> before they go live.
          {pending.length > 0 && ` ${pending.length} post${pending.length !== 1 ? "s" : ""} awaiting your review.`}
        </p>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Pending items */}
      {pending.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "12px" }}>
            Pending Review ({pending.length})
          </h2>
          {pending.map((item) => {
            const decision = decisions[item.id];
            const isSubmitted = !!submitted[item.id];

            if (isSubmitted) {
              return (
                <div key={item.id} style={{ background: decision === "approved" ? "#f0fdf4" : "#fef3c7", border: `1px solid ${decision === "approved" ? "#bbf7d0" : "#fde68a"}`, borderRadius: "16px", padding: "20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>{decision === "approved" ? "✓" : "↩"}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a1a", marginBottom: "2px" }}>{item.title}</p>
                    <p style={{ fontSize: "13px", color: decision === "approved" ? "#16a34a" : "#d97706" }}>
                      {decision === "approved" ? "Approved — this post will be published as scheduled." : "Sent back to agency for revision."}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
                {/* Top row: platform + scheduled + type */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: `${PLATFORM_COLORS[item.platform] ?? "#6b7280"}18`,
                      color: PLATFORM_COLORS[item.platform] ?? "#6b7280",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: PLATFORM_COLORS[item.platform] ?? "#6b7280" }}></span>
                    {PLATFORM_LABELS[item.platform] ?? item.platform}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 500,
                      background: "#f3f4f6",
                      color: "#6b7280",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.contentType}
                  </span>
                  {item.scheduledFor && (
                    <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>
                      Scheduled for {new Date(item.scheduledFor).toLocaleDateString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                {/* Thumbnail / placeholder */}
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                    border: "1px dashed #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>🖼</div>
                    Image will be generated
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontWeight: 600, fontSize: "16px", color: "#1a1a1a", marginBottom: "8px" }}>{item.title}</h3>

                {/* Post preview */}
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#374151", margin: 0, whiteSpace: "pre-wrap" }}>{item.body}</p>
                  {item.callToAction && (
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#2F5D62", marginTop: "8px" }}>
                      CTA: {item.callToAction}
                    </p>
                  )}
                </div>

                {/* Format hint */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#9ca3af", background: "#f3f4f6", padding: "3px 8px", borderRadius: "6px" }}>
                    {item.body.length} / {PLATFORM_LIMITS[item.platform] ?? 2200} chars
                  </span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>{PLATFORM_HINTS[item.platform] ?? ""}</span>
                </div>

                {/* Decision buttons */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <button
                    onClick={() => setDecisions((d) => ({ ...d, [item.id]: "approved" }))}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: "10px",
                      border: `2px solid ${decision === "approved" ? "#10b981" : "#e5e7eb"}`,
                      background: decision === "approved" ? "#10b981" : "#fff",
                      color: decision === "approved" ? "#fff" : "#374151",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setDecisions((d) => ({ ...d, [item.id]: "rejected" }))}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: "10px",
                      border: `2px solid ${decision === "rejected" ? "#f59e0b" : "#e5e7eb"}`,
                      background: decision === "rejected" ? "#fef3c7" : "#fff",
                      color: decision === "rejected" ? "#92400e" : "#374151",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Request Changes
                  </button>
                </div>

                {/* Feedback text */}
                {decision === "rejected" && (
                  <textarea
                    value={feedbacks[item.id] ?? ""}
                    onChange={(e) => setFeedbacks((f) => ({ ...f, [item.id]: e.target.value }))}
                    placeholder="What changes would you like? (e.g. 'Change the call to action to mention our new location…')"
                    rows={3}
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", marginBottom: "12px" }}
                  />
                )}

                {/* Submit */}
                {decision && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleSubmit(item.id)}
                      disabled={submitting[item.id] || (decision === "rejected" && !feedbacks[item.id]?.trim())}
                      style={{
                        background: "#2F5D62",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: submitting[item.id] ? "not-allowed" : "pointer",
                        opacity: submitting[item.id] ? 0.6 : 1,
                      }}
                    >
                      {submitting[item.id] ? "Submitting…" : "Submit Decision"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Already reviewed */}
      {alreadyApproved.length > 0 && (
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "12px" }}>
            Previously Reviewed ({alreadyApproved.length})
          </h2>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>
            {alreadyApproved.map((item, i) => (
              <div
                key={item.id}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderBottom: i < alreadyApproved.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 600,
                    background: item.status === "published" || item.status === "client_published" ? "#d1fae5" : item.status === "scheduled" ? "#dbeafe" : "#f3f4f6",
                    color: item.status === "published" || item.status === "client_published" ? "#065f46" : item.status === "scheduled" ? "#1e40af" : "#6b7280",
                  }}
                >
                  {item.status === "published" ? "Published" : item.status === "scheduled" ? "Scheduled" : "Approved"}
                </span>
                <span style={{ flex: 1, fontSize: "13px", color: "#374151", fontWeight: 500 }}>{item.title}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                  {PLATFORM_LABELS[item.platform] ?? item.platform}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
