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

export const orgs = pgTable("orgs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  primaryLocale: varchar("primary_locale", { length: 8 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalAuthId: varchar("external_auth_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const orgMemberships = pgTable("org_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: membershipRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  externalAccountId: varchar("external_account_id", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

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

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  kind: varchar("kind", { length: 64 }).notNull(),
  storageKey: varchar("storage_key", { length: 512 }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  domain: varchar("domain", { length: 64 }).notNull(),
  metric: varchar("metric", { length: 128 }).notNull(),
  value: integer("value").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull()
});

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

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  connectedSocialAccounts: integer("connected_social_accounts").notNull(),
  clientSeats: integer("client_seats").notNull(),
  localeLimit: integer("locale_limit").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  planId: uuid("plan_id").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  key: varchar("key", { length: 128 }).notNull(),
  enabled: boolean("enabled").notNull().default(false),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id"),
  actorUserId: uuid("actor_user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 128 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});