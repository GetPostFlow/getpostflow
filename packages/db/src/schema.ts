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

export const strategies = pgTable("strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  kind: approvalKindEnum("kind").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  status: approvalStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Content ───────────────────────────────────────────────────────────────────

export const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  status: contentStatusEnum("status").notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const contentVersions = pgTable("content_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id").notNull(),
  body: text("body").notNull(),
  platformVariants: jsonb("platform_variants").notNull().default({}),
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
  socialAccountId: uuid("social_account_id").notNull(),
  platformThreadId: varchar("platform_thread_id", { length: 255 }).notNull(),
  detectedLocale: varchar("detected_locale", { length: 8 }).default("en"),
  sentimentSummary: varchar("sentiment_summary", { length: 64 }),
  assignedToUserId: uuid("assigned_to_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  direction: messageDirectionEnum("direction").notNull(),
  body: text("body").notNull(),
  detectedLocale: varchar("detected_locale", { length: 8 }).default("en"),
  platformMessageId: varchar("platform_message_id", { length: 255 }),
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
  kind: varchar("kind", { length: 64 }).notNull(),
  storageKey: varchar("storage_key", { length: 512 }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ── Analytics ─────────────────────────────────────────────────────────────────

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  domain: varchar("domain", { length: 64 }).notNull(),
  metric: varchar("metric", { length: 128 }).notNull(),
  value: integer("value").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull()
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
