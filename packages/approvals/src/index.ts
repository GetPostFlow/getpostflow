export const approvalKinds = [
  "brand_profile",
  "content_strategy",
  "community_strategy",
  "scheduled_post",
  "ai_response",
  "brand_strategy",
] as const;

export const approvalStatuses = [
  "draft",
  "pending_internal_review",
  "pending_client_review",
  "revision_requested",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "client_published",
  "rejected",
  "approved_to_send",
  "sending",
  "sent",
] as const;

export type ApprovalKind = (typeof approvalKinds)[number];
export type ApprovalStatus = (typeof approvalStatuses)[number];
export type AssigneeRole = "strategist" | "client";

// ─── Generic approval entity ──────────────────────────────────────────────────

export interface ApprovalComment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  section?: string;
  createdAt: string;
}

export interface ApprovalDecision {
  id: string;
  decidedByUserId: string;
  decidedByName: string;
  decision: "approved" | "changes_requested" | "rejected" | "escalated";
  notes?: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  scopeType: "brand_strategy" | "content_item" | "campaign";
  scopeId: string;
  requestedBy: string;
  assigneeRole: AssigneeRole;
  state: ApprovalStatus;
  comments: ApprovalComment[];
  decisions: ApprovalDecision[];
  createdAt: string;
  updatedAt: string;
}

// ─── Repository helpers ───────────────────────────────────────────────────────

export function requestApproval(params: {
  scopeType: Approval["scopeType"];
  scopeId: string;
  requestedBy: string;
  assigneeRole: AssigneeRole;
}): Approval {
  return {
    id: crypto.randomUUID(),
    scopeType: params.scopeType,
    scopeId: params.scopeId,
    requestedBy: params.requestedBy,
    assigneeRole: params.assigneeRole,
    state: "pending_internal_review",
    comments: [],
    decisions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addComment(
  approval: Approval,
  comment: Omit<ApprovalComment, "id" | "createdAt">
): Approval {
  return {
    ...approval,
    comments: [
      ...approval.comments,
      {
        ...comment,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function approveApproval(
  approval: Approval,
  decidedByUserId: string,
  decidedByName: string,
  notes?: string
): Approval {
  const nextState: ApprovalStatus =
    approval.state === "pending_internal_review"
      ? "pending_client_review"
      : "approved";

  return {
    ...approval,
    state: nextState,
    decisions: [
      ...approval.decisions,
      {
        id: crypto.randomUUID(),
        decidedByUserId,
        decidedByName,
        decision: "approved",
        notes,
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function requestChanges(
  approval: Approval,
  decidedByUserId: string,
  decidedByName: string,
  notes?: string
): Approval {
  return {
    ...approval,
    state: "revision_requested",
    decisions: [
      ...approval.decisions,
      {
        id: crypto.randomUUID(),
        decidedByUserId,
        decidedByName,
        decision: "changes_requested",
        notes,
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function escalateApproval(
  approval: Approval,
  decidedByUserId: string,
  decidedByName: string,
  notes?: string
): Approval {
  return {
    ...approval,
    decisions: [
      ...approval.decisions,
      {
        id: crypto.randomUUID(),
        decidedByUserId,
        decidedByName,
        decision: "escalated",
        notes,
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

// ─── State machine transitions ────────────────────────────────────────────────

export const scheduledPostTransitions: Record<ApprovalStatus, ApprovalStatus[]> = {
  draft: ["pending_internal_review", "client_published"],
  pending_internal_review: ["pending_client_review", "draft"],
  pending_client_review: ["revision_requested", "approved", "client_published"],
  revision_requested: ["draft"],
  approved: ["scheduled", "client_published"],
  scheduled: ["publishing"],
  publishing: ["published", "failed"],
  published: [],
  failed: ["scheduled"],
  client_published: [],
  rejected: [],
  approved_to_send: ["sending"],
  sending: ["sent", "failed"],
  sent: [],
};

export const aiResponseTransitions: Record<ApprovalStatus, ApprovalStatus[]> = {
  draft: [],
  pending_internal_review: [],
  pending_client_review: [],
  revision_requested: [],
  approved: [],
  scheduled: [],
  publishing: [],
  published: [],
  failed: ["pending_internal_review"],
  client_published: [],
  rejected: [],
  approved_to_send: ["sending"],
  sending: ["sent", "failed"],
  sent: [],
} as Record<ApprovalStatus, ApprovalStatus[]>;

export const brandStrategyTransitions: Record<string, string[]> = {
  ai_drafting: ["strategist_pending"],
  strategist_pending: ["strategist_approved", "ai_drafting"],
  strategist_approved: ["client_pending"],
  client_pending: ["client_approved", "strategist_pending"],
  client_approved: ["active"],
  active: [],
};
