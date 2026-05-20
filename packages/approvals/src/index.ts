export const approvalKinds = [
  "brand_profile",
  "content_strategy",
  "community_strategy",
  "scheduled_post",
  "ai_response"
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
  "sent"
] as const;

export type ApprovalKind = (typeof approvalKinds)[number];
export type ApprovalStatus = (typeof approvalStatuses)[number];

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
  approved_to_send: [],
  sending: [],
  sent: []
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
  pending_human_review: ["approved_to_send", "rejected"]
} as Record<ApprovalStatus | "pending_human_review", ApprovalStatus[]>;