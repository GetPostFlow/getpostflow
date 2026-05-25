import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const membershipRoleEnum = pgEnum("membership_role", [
  "org_owner",
  "org_admin",
  "strategist",
  "content_manager",
  "community_manager",
  "analyst",
  "support",
  "client_owner",
  "client_admin",
  "client_reviewer",
  "client_viewer"
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete"
]);

export const approvalKindEnum = pgEnum("approval_kind", [
  "brand_profile",
  "content_strategy",
  "community_strategy",
  "scheduled_post",
  "ai_response"
]);

export const approvalStatusEnum = pgEnum("approval_status", [
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
]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "pending_review",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "client_published",
  "failed",
  "archived"
]);

export const messageDirectionEnum = pgEnum("message_direction", [
  "inbound",
  "outbound"
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "open",
  "pending",
  "resolved",
  "spam"
]);

export const conversationPriorityEnum = pgEnum("conversation_priority", [
  "low",
  "normal",
  "high",
  "urgent"
]);

export const messageSentimentEnum = pgEnum("message_sentiment", [
  "positive",
  "neutral",
  "negative",
  "urgent"
]);

export const messageStatusEnum = pgEnum("message_status", [
  "unread",
  "read",
  "replied",
  "escalated"
]);

export const clientStatusEnum = pgEnum("client_status", [
  "draft",
  "intake_pending",
  "ai_drafting",
  "ai_drafted",
  "strategist_review",
  "client_review",
  "active",
  "archived"
]);

export const brandStrategyStatusEnum = pgEnum("brand_strategy_status", [
  "ai_drafting",
  "strategist_pending",
  "strategist_approved",
  "client_pending",
  "client_approved",
  "active"
]);

// ── Org / Tenant ──────────────────────────────────────────────────────────────

export const orgs = pgTable("orgs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 1024 }),
  brandColor: varchar("brand_color", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  status: clientStatusEnum("status").notNull().default("draft"),
  primaryContactName: varchar("primary_contact_name", { length: 255 }),
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
  industry: varchar("industry", { length: 128 }),
  targetLocales: jsonb("target_locales").notNull().default([]),
  primaryLocale: varchar("primary_locale", { length: 8 }).notNull().default("en"),
  permissions: jsonb("permissions").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 1024 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const orgMemberships = pgTable("org_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: membershipRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Client assignments (RBAC: employee → client restriction) ──────────────────

export const clientAssignments = pgTable("client_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  userId: uuid("user_id").notNull(),
  clientId: uuid("client_id").notNull(),
  role: membershipRoleEnum("role").notNull().default("support"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Billing / Plans ───────────────────────────────────────────────────────────

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  monthlyPriceCents: integer("monthly_price_cents").notNull(),
  annualPriceCents: integer("annual_price_cents").notNull(),
  connectedSocialAccountsLimit: integer("connected_social_accounts_limit").notNull(),
  clientSeatsLimit: integer("client_seats_limit").notNull(),
  localeLimit: integer("locale_limit").notNull(),
  aiTextCredits: integer("ai_text_credits").notNull(),
  aiImageCredits: integer("ai_image_credits").notNull(),
  aiVideoCredits: integer("ai_video_credits").notNull(),
  aiEngagementCredits: integer("ai_engagement_credits").notNull(),
  trialDays: integer("trial_days").notNull().default(0),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
  stripePriceIdAnnual: varchar("stripe_price_id_annual", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const orgSubscriptions = pgTable("org_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().unique(),
  planCode: varchar("plan_code", { length: 64 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  billingInterval: varchar("billing_interval", { length: 16 }).notNull().default("monthly"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Feature flags ─────────────────────────────────────────────────────────────

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  key: varchar("key", { length: 128 }).notNull(),
  enabled: boolean("enabled").notNull().default(false),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Social accounts ───────────────────────────────────────────────────────────

export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  clientId: uuid("client_id"),
  platform: varchar("platform", { length: 64 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  externalAccountId: varchar("external_account_id", { length: 255 }).notNull(),
  /** Encrypted OAuth tokens (access + refresh) stored as JSON */
  encryptedTokens: jsonb("encrypted_tokens").notNull().default({}),
  /** Token expiry timestamp */
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  /** Last successful sync / health check timestamp */
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Brand / strategy ──────────────────────────────────────────────────────────

export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  summary: text("summary").notNull(),
  locales: jsonb("locales").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const brandKits = pgTable("brand_kits", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull().unique(),
  /** Logo asset URLs by format: { png?: string, svg?: string, jpg?: string } */
  logos: jsonb("logos").notNull().default({}),
  /** Color palette: { primary, secondary, accent, background?, text? } */
  colors: jsonb("colors").notNull().default({}),
  /** Typography: { headingFont, bodyFont } */
  typography: jsonb("typography").notNull().default({}),
  /** Freeform markdown style guide */
  styleGuide: text("style_guide"),
  /** Voice/tone guidelines */
  voiceTone: text("voice_tone"),
  /** Do's and Don'ts: { dos: string[], donts: string[] } */
  dosAndDonts: jsonb("dos_and_donts").notNull().default({ dos: [], donts: [] }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const contentTemplates = pgTable("content_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  orgId: uuid("org_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  /** post | carousel | reel | story | thread | ad | video_script */
  contentType: varchar("content_type", { length: 64 }).notNull().default("post"),
  /** Template body with {{variable}} placeholders */
  body: text("body").notNull(),
  /** JSON array of variable names extracted from body */
  variables: jsonb("variables").notNull().default([]),
  tags: jsonb("tags").notNull().default([]),
  useCount: integer("use_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const strategies = pgTable("strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  kind: approvalKindEnum("kind").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  status: approvalStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Phase 3 enums ─────────────────────────────────────────────────────────────

export const contentTypeEnum = pgEnum("content_type", [
  "post",
  "carousel",
  "reel",
  "story",
  "thread",
  "ad",
  "video_script",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "image",
  "video",
  "document",
  "audio",
]);

// ── Content ───────────────────────────────────────────────────────────────────

export const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  orgId: uuid("org_id"),
  title: varchar("title", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 64 }),
  contentType: contentTypeEnum("content_type").notNull().default("post"),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  status: contentStatusEnum("status").notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  /** Set once the content is published across at least one platform */
  publishedAt: timestamp("published_at", { withTimezone: true }),
  publishedUrl: varchar("published_url", { length: 1024 }),
  /** Comma-separated platform keys this item should be published to */
  targetPlatforms: jsonb("target_platforms").notNull().default([]),
  /** Stores the full ContentDraft payload from the AI engine */
  draftPayload: jsonb("draft_payload").notNull().default({}),
  /** History tags: ai-generated, edited-by-internal, edited-by-client, client-published, etc. */
  historyTags: jsonb("history_tags").notNull().default([]),
  createdByUserId: uuid("created_by_user_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const contentVersions = pgTable("content_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id").notNull(),
  versionInt: integer("version_int").notNull().default(1),
  body: text("body").notNull(),
  platformVariants: jsonb("platform_variants").notNull().default({}),
  /** Full ContentDraft snapshot at this version */
  draftPayload: jsonb("draft_payload").notNull().default({}),
  changeSummary: varchar("change_summary", { length: 512 }),
  createdByUserId: uuid("created_by_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const approvals = pgTable("approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  kind: approvalKindEnum("kind").notNull(),
  status: approvalStatusEnum("status").notNull().default("draft"),
  targetEntityType: varchar("target_entity_type", { length: 128 }).notNull(),
  targetEntityId: uuid("target_entity_id").notNull(),
  decidedByUserId: uuid("decided_by_user_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Conversations ─────────────────────────────────────────────────────────────

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  platformConversationId: varchar("platform_conversation_id", { length: 255 }).notNull(),
  participantHandle: varchar("participant_handle", { length: 255 }),
  status: conversationStatusEnum("status").notNull().default("open"),
  priority: conversationPriorityEnum("priority").notNull().default("normal"),
  assignedToUserId: uuid("assigned_to_user_id"),
  detectedLocale: varchar("detected_locale", { length: 8 }).default("en"),
  sentimentSummary: messageSentimentEnum("sentiment_summary"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  /** social_account_id FK kept for analytics join */
  socialAccountId: uuid("social_account_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  platformMessageId: varchar("platform_message_id", { length: 255 }),
  direction: messageDirectionEnum("direction").notNull(),
  content: text("content").notNull(),
  senderHandle: varchar("sender_handle", { length: 255 }),
  sentiment: messageSentimentEnum("sentiment").default("neutral"),
  aiSuggestedReply: text("ai_suggested_reply"),
  aiConfidence: integer("ai_confidence"),
  status: messageStatusEnum("status").notNull().default("unread"),
  detectedLocale: varchar("detected_locale", { length: 8 }).default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const inboxAssignments = pgTable("inbox_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  userId: uuid("user_id").notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true })
});

export const conversationNotes = pgTable("conversation_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  userId: uuid("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Community management ──────────────────────────────────────────────────────

export const engagementTemplates = pgTable("engagement_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  clientId: uuid("client_id"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").notNull().default([]),
  useCount: integer("use_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const moderationRules = pgTable("moderation_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  clientId: uuid("client_id"),
  name: varchar("name", { length: 255 }).notNull(),
  blockedKeywords: jsonb("blocked_keywords").notNull().default([]),
  autoHide: boolean("auto_hide").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Leads / Funnels ───────────────────────────────────────────────────────────

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  conversationId: uuid("conversation_id"),
  status: varchar("status", { length: 64 }).notNull().default("new"),
  score: integer("score").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const funnels = pgTable("funnels", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  stageOrder: jsonb("stage_order").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Assets ────────────────────────────────────────────────────────────────────

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  clientId: uuid("client_id"),
  type: assetTypeEnum("type").notNull().default("image"),
  kind: varchar("kind", { length: 64 }).notNull(),
  filename: varchar("filename", { length: 512 }),
  mimeType: varchar("mime_type", { length: 128 }),
  sizeBytes: integer("size_bytes"),
  storageKey: varchar("storage_key", { length: 512 }).notNull(),
  publicUrl: varchar("public_url", { length: 1024 }),
  /** intake_upload | portal_upload | agency_upload | generated */
  source: varchar("source", { length: 64 }).notNull().default("agency_upload"),
  /** { width, height, duration, aspectRatio } */
  dimensions: jsonb("dimensions").notNull().default({}),
  /** AI-generated content tags for search */
  aiTags: jsonb("ai_tags").notNull().default([]),
  /** User-applied tags */
  tags: jsonb("tags").notNull().default([]),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Published content ─────────────────────────────────────────────────────────

export const publishedContent = pgTable("published_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id").notNull(),
  clientId: uuid("client_id").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  /** Ayrshare post id (or direct platform post id once migrated) */
  platformPostId: varchar("platform_post_id", { length: 255 }),
  platformPostUrl: varchar("platform_post_url", { length: 1024 }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  /** Whether this was directly published by the client (not the team) */
  isClientPublished: boolean("is_client_published").notNull().default(false),
  /** Raw Ayrshare or platform API response */
  rawResponse: jsonb("raw_response").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Analytics ─────────────────────────────────────────────────────────────────

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id"),
  clientId: uuid("client_id").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  /** Metric type: impressions | reach | engagement | clicks | shares | comments | saves | video_views | watch_time */
  metricType: varchar("metric_type", { length: 64 }).notNull(),
  value: integer("value").notNull().default(0),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  /** Raw metric payload from Ayrshare */
  rawPayload: jsonb("raw_payload").notNull().default({})
});

/** Per-client daily aggregate — used for dashboard charts */
export const analyticsAggregates = pgTable("analytics_aggregates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  date: varchar("date", { length: 16 }).notNull(), // YYYY-MM-DD
  platform: varchar("platform", { length: 64 }).notNull(),
  /** JSON object: { impressions, reach, engagement, clicks, shares, comments, saves, video_views, watch_time } */
  metrics: jsonb("metrics").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// ── AI learning ───────────────────────────────────────────────────────────────

export const aiLearningSamples = pgTable("ai_learning_samples", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  sourceType: varchar("source_type", { length: 64 }).notNull(),
  sourceEntityId: uuid("source_entity_id").notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  approved: boolean("approved").notNull().default(false),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Audit ─────────────────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id"),
  clientId: uuid("client_id"),
  actorUserId: uuid("actor_user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 128 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Ayrshare profile mapping ───────────────────────────────────────────────────

/**
 * Maps an org to an Ayrshare "profile key" (one profile per client/brand).
 * Each profile can have multiple social platform connections.
 * See: https://docs.ayrshare.com/profiles/manage-profiles
 */
export const socialAccountProfiles = pgTable("social_account_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  /**
   * Ayrshare profile key returned when a profile is created via POST /profiles.
   * Used as the Profile-Key header on subsequent Ayrshare API calls.
   */
  ayrshareProfileKey: varchar("ayrshare_profile_key", { length: 128 }).notNull(),
  /**
   * JSON array of platform keys connected to this profile,
   * e.g. ["facebook", "instagram", "tiktok"]
   */
  platformKeys: jsonb("platform_keys").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Phase 2: Client intake + brand strategy ───────────────────────────────────

export const clientIntakeSubmissions = pgTable("client_intake_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  submittedByUserId: uuid("submitted_by_user_id"),
  rawPayload: jsonb("raw_payload").notNull().default({}),
  isDraft: boolean("is_draft").notNull().default(true),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const clientBrandStrategies = pgTable("client_brand_strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  orgId: uuid("org_id").notNull(),
  versionInt: integer("version_int").notNull().default(1),
  status: brandStrategyStatusEnum("status").notNull().default("ai_drafting"),
  draftPayload: jsonb("draft_payload").notNull().default({}),
  editedPayload: jsonb("edited_payload").notNull().default({}),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  strategistComments: jsonb("strategist_comments").notNull().default([]),
  clientComments: jsonb("client_comments").notNull().default([]),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const portalTokens = pgTable("portal_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  userId: uuid("user_id"),
  kind: varchar("kind", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  linkHref: varchar("link_href", { length: 1024 }),
  read: boolean("read").notNull().default(false),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Phase 6: Learning Loop ─────────────────────────────────────────────────────

/**
 * Stores one learning record per published content item.
 * Tracks AI prediction vs actual engagement and the generated insight.
 */
export const aiLearningInsights = pgTable("ai_learning_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  contentItemId: uuid("content_item_id").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  contentType: varchar("content_type", { length: 64 }).notNull(),
  /** 0–1 score predicted by scoreContent() at publish time */
  prediction: integer("prediction").notNull().default(0), // stored as integer 0-100
  /** 0–1 normalised actual engagement score */
  actual: integer("actual").notNull().default(0), // stored as integer 0-100
  /** actual − prediction (can be negative), stored as integer -100..100 */
  delta: integer("delta").notNull().default(0),
  insightText: text("insight_text").notNull(),
  recommendations: jsonb("recommendations").notNull().default([]),
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Phase 6: Video analytics ───────────────────────────────────────────────────

export const videoAnalytics = pgTable("video_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id").notNull(),
  clientId: uuid("client_id").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  views: integer("views").notNull().default(0),
  watchTimeSeconds: integer("watch_time_seconds").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  completionRate: integer("completion_rate").notNull().default(0), // 0-100
  dropOffPoints: jsonb("drop_off_points").notNull().default([]),
  abTestVariant: varchar("ab_test_variant", { length: 4 }), // "A" | "B"
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Phase 6: Reports ──────────────────────────────────────────────────────────

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "generating",
  "ready",
  "sent",
  "failed"
]);

export const reportFrequencyEnum = pgEnum("report_frequency", [
  "weekly",
  "biweekly",
  "monthly"
]);

/**
 * Stores generated PDF reports per client.
 * pdf_url points to an R2/S3 stored file.
 */
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  orgId: uuid("org_id").notNull(),
  type: varchar("type", { length: 64 }).notNull().default("monthly"), // monthly | ondemand
  periodStart: varchar("period_start", { length: 16 }).notNull(), // YYYY-MM-DD
  periodEnd: varchar("period_end", { length: 16 }).notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  pdfUrl: varchar("pdf_url", { length: 1024 }),
  summaryPayload: jsonb("summary_payload").notNull().default({}),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ─────────────────────────────────────────────────────────────────────────────
// White-label (Phase 7 — data model only, feature flag OFF in v1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BrandingProfile: per-org white-label customization.
 * Feature flag `white_label_enabled` is FALSE for all plans in v1.
 */
export const brandingProfiles = pgTable("branding_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().unique(),
  logoUrl: varchar("logo_url", { length: 2048 }),
  primaryColor: varchar("primary_color", { length: 9 }),
  secondaryColor: varchar("secondary_color", { length: 9 }),
  fontHeading: varchar("font_heading", { length: 128 }),
  fontBody: varchar("font_body", { length: 128 }),
  customDomain: varchar("custom_domain", { length: 255 }),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Per-client report schedule configuration.
 */
export const reportSchedules = pgTable("report_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  orgId: uuid("org_id").notNull(),
  frequency: reportFrequencyEnum("frequency").notNull().default("monthly"),
  /** Day of month (1-28) for monthly/biweekly; day of week (0=Sun) for weekly */
  dayValue: integer("day_value").notNull().default(1),
  recipientEmails: jsonb("recipient_emails").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  nextSendAt: timestamp("next_send_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Portal Messages (client↔team chat) ───────────────────────────────────────

export const portalMessageSenderEnum = pgEnum("portal_message_sender", [
  "team",
  "client",
]);

export const portalMessages = pgTable("portal_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  senderType: portalMessageSenderEnum("sender_type").notNull(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Invoices ────────────────────────────────────────────────────────────────

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "open",
  "paid",
  "uncollectible",
  "void",
]);

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  orgId: uuid("org_id").notNull(),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  amountCents: integer("amount_cents").notNull(),
  status: invoiceStatusEnum("status").notNull().default("open"),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  pdfUrl: varchar("pdf_url", { length: 1024 }),
  description: varchar("description", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Funnel Rules (per-client community funnel configuration) ──────────────────

export const funnelStageEnum = pgEnum("funnel_stage", [
  "awareness",
  "interest",
  "conversion",
]);

export const funnelRules = pgTable("funnel_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  clientId: uuid("client_id").notNull(),
  stage: funnelStageEnum("stage").notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(), // e.g., "auto_like", "auto_reply", "dm_initiate", "lead_qualify"
  keywords: jsonb("keywords").$type<string[]>().default([]),
  replyTemplate: text("reply_template"),
  ctaUrl: varchar("cta_url", { length: 1024 }),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Tasks ───────────────────────────────────────────────────────────────────

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clientId: uuid("client_id"),
  assigneeId: uuid("assignee_id"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
