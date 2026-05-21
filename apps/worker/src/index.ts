/**
 * GetPostFlow BullMQ worker — Phase 5
 *
 * Queues registered:
 *   publish-queue        — publish a scheduled ContentItem to a platform
 *   analytics-sync-queue — pull analytics for published items every 6h
 *   inbox-sync-queue     — sync inbox messages every 15 min, run sentiment + AI reply
 *
 * Required env vars (see .env.example):
 *   REDIS_URL            — ioredis-compatible connection string
 *   DATABASE_URL         — Neon Postgres connection string
 *   AYRSHARE_API_KEY     — Ayrshare API key
 */

import { Queue, Worker, type Job } from "bullmq";

// ── Redis connection ─────────────────────────────────────────────────────────

export const redisConnection = {
  url: process.env.REDIS_URL ?? "",
};

// ── Queue names ─────────────────────────────────────────────────────────────

export const QUEUES = {
  ONBOARDING_ANALYSIS: "onboarding-analysis",
  CONTENT_PUBLISH: "publish-queue",
  ANALYTICS_SYNC: "analytics-sync-queue",
  INBOX_SYNC: "inbox-sync-queue",
  WEBHOOK_RECONCILE: "webhook-reconcile",
  SOCIAL_POLL: "social-poll",
  AI_JOBS: "ai-jobs",
} as const;

// ── Job payload types ────────────────────────────────────────────────────────

export interface PublishJobData {
  contentItemId: string;
  platform: string;
  scheduledAt: number; // unix ms
}

export interface AnalyticsSyncJobData {
  /** If provided, sync only this client; otherwise sync all active clients */
  clientId?: string;
}

export interface InboxSyncJobData {
  /** If provided, sync only this client; otherwise sync all active clients */
  clientId?: string;
}

// ── DB helper ────────────────────────────────────────────────────────────────

async function getDb() {
  const { createDb } = await import("@getpostflow/db");
  return createDb();
}

// ── Publish processor ────────────────────────────────────────────────────────

/**
 * Handles one publish job:
 *  1. Load ContentItem + latest ContentVersion from DB
 *  2. Call the Ayrshare connector publishPost()
 *  3. On success: write PublishedContent row + update ContentItem status
 *  4. On failure after all retries: mark status=failed, append audit log
 */
async function handlePublishJob(job: Job<PublishJobData>): Promise<void> {
  const { contentItemId, platform } = job.data;

  const db = await getDb();
  const {
    contentItems,
    contentVersions,
    publishedContent,
    auditLogs,
  } = await import("@getpostflow/db");
  const { eq, desc } = await import("drizzle-orm");
  const { getConnector } = await import("@getpostflow/social");

  // 1. Load content item
  const [item] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, contentItemId))
    .limit(1);

  if (!item) {
    throw new Error(`[publish-queue] ContentItem not found: ${contentItemId}`);
  }

  // 2. Load latest version body
  const [version] = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentItemId, contentItemId))
    .orderBy(desc(contentVersions.createdAt))
    .limit(1);

  if (!version) {
    throw new Error(`[publish-queue] No ContentVersion found for item: ${contentItemId}`);
  }

  // 3. Mark publishing
  await db
    .update(contentItems)
    .set({ status: "publishing" })
    .where(eq(contentItems.id, contentItemId));

  // 4. Call Ayrshare connector
  const connector = getConnector(platform as Parameters<typeof getConnector>[0]);
  const result = await connector.publishPost({
    orgId: item.clientId,
    text: version.body,
  });

  // 5. Write PublishedContent record
  await db.insert(publishedContent).values({
    contentItemId,
    clientId: item.clientId,
    platform,
    platformPostId: result.platformPostId,
    platformPostUrl: result.url,
    publishedAt: new Date(result.publishedAt),
    isClientPublished: false,
    rawResponse: (result.raw ?? {}) as Record<string, unknown>,
  });

  // 6. Update ContentItem to published
  await db
    .update(contentItems)
    .set({
      status: "published",
      publishedAt: new Date(result.publishedAt),
    })
    .where(eq(contentItems.id, contentItemId));

  // 7. Audit log
  await db.insert(auditLogs).values({
    clientId: item.clientId,
    action: "content.published",
    entityType: "content_item",
    entityId: contentItemId,
    payload: { platform, platformPostId: result.platformPostId, url: result.url ?? null },
  });

  console.log(
    `[publish-queue] Published contentItem=${contentItemId} platform=${platform} postId=${result.platformPostId}`
  );
}

/**
 * After all retries are exhausted BullMQ calls the failed handler.
 * We mark the ContentItem as failed and write an audit log.
 */
async function handlePublishFailed(
  job: Job<PublishJobData> | undefined,
  err: Error
): Promise<void> {
  if (!job) return;
  const { contentItemId, platform } = job.data;

  try {
    const db = await getDb();
    const { contentItems, auditLogs } = await import("@getpostflow/db");
    const { eq } = await import("drizzle-orm");

    await db
      .update(contentItems)
      .set({ status: "failed" })
      .where(eq(contentItems.id, contentItemId));

    await db.insert(auditLogs).values({
      clientId: "unknown", // best-effort; item may not have loaded
      action: "content.publish_failed",
      entityType: "content_item",
      entityId: contentItemId,
      payload: { platform, error: err.message },
    });

    console.error(
      `[publish-queue] FAILED contentItem=${contentItemId} platform=${platform}: ${err.message}`
    );
  } catch (logErr) {
    console.error(`[publish-queue] Failed to write failure audit log:`, logErr);
  }
}

// ── Analytics sync processor ─────────────────────────────────────────────────

const SYNC_METRIC_TYPES = [
  "impressions",
  "reach",
  "engagement",
  "clicks",
  "shares",
  "comments",
  "saves",
  "video_views",
  "watch_time",
] as const;

/**
 * For each published content item in the last 30 days:
 *  1. Fetch analytics from Ayrshare connector
 *  2. Insert rows into analytics_events
 *  3. Upsert daily aggregate per (clientId, date, platform)
 */
async function handleAnalyticsSyncJob(job: Job<AnalyticsSyncJobData>): Promise<void> {
  const db = await getDb();
  const { publishedContent, analyticsEvents, analyticsAggregates } = await import(
    "@getpostflow/db"
  );
  const { and, eq, gte, sql } = await import("drizzle-orm");
  const { getConnector } = await import("@getpostflow/social");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Load published items in the last 30 days
  let query = db
    .select()
    .from(publishedContent)
    .where(gte(publishedContent.publishedAt, thirtyDaysAgo))
    .$dynamic();

  if (job.data.clientId) {
    query = query.where(eq(publishedContent.clientId, job.data.clientId));
  }

  const items = await query;

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    if (!item.platformPostId) continue;

    try {
      const connector = getConnector(item.platform as Parameters<typeof getConnector>[0]);
      const bundle = await connector.fetchAnalytics(item.platformPostId, {
        from: thirtyDaysAgo.getTime(),
        to: Date.now(),
      });

      // Insert individual metric events
      for (const metric of bundle.metrics) {
        if (!SYNC_METRIC_TYPES.includes(metric.name as typeof SYNC_METRIC_TYPES[number])) {
          continue; // skip metrics we don't track
        }

        await db.insert(analyticsEvents).values({
          contentItemId: item.contentItemId,
          clientId: item.clientId,
          platform: item.platform,
          metricType: metric.name,
          value: metric.value,
          recordedAt: new Date(),
          rawPayload: (bundle.raw ?? {}) as Record<string, unknown>,
        });
      }

      // Build aggregate map for this item
      const dateStr = (item.publishedAt ?? new Date()).toISOString().slice(0, 10);
      const metricsMap: Record<string, number> = {};
      for (const metric of bundle.metrics) {
        metricsMap[metric.name] = metric.value;
      }

      // Upsert aggregate (insert or merge metrics json)
      const [existing] = await db
        .select()
        .from(analyticsAggregates)
        .where(
          and(
            eq(analyticsAggregates.clientId, item.clientId),
            eq(analyticsAggregates.date, dateStr),
            eq(analyticsAggregates.platform, item.platform)
          )
        )
        .limit(1);

      if (existing) {
        const merged = {
          ...(existing.metrics as Record<string, number>),
          ...metricsMap,
        };
        await db
          .update(analyticsAggregates)
          .set({ metrics: merged, updatedAt: new Date() })
          .where(eq(analyticsAggregates.id, existing.id));
      } else {
        await db.insert(analyticsAggregates).values({
          clientId: item.clientId,
          date: dateStr,
          platform: item.platform,
          metrics: metricsMap,
        });
      }

      synced++;
    } catch (err) {
      failed++;
      console.error(
        `[analytics-sync] Failed to sync item=${item.contentItemId} platform=${item.platform}:`,
        (err as Error).message
      );
    }
  }

  console.log(
    `[analytics-sync] Completed: synced=${synced} failed=${failed} total=${items.length}`
  );
}

// ── Worker registration ───────────────────────────────────────────────────────

function makeConnection() {
  return { url: redisConnection.url };
}

// ── Inbox sync processor ─────────────────────────────────────────────────────

/**
 * Inbox sync job:
 *  1. Load all active social accounts per client
 *  2. For each: call connector.fetchInbox() (skips Reddit — throws NotImplementedError)
 *  3. Upsert conversations + messages
 *  4. Run sentiment classification on inbound messages
 *  5. Generate AI-suggested reply
 *  6. Auto-escalate negative/urgent messages
 */
async function handleInboxSyncJob(job: Job<InboxSyncJobData>): Promise<void> {
  const db = await getDb();
  const {
    socialAccounts,
    conversations,
    messages,
    notifications,
  } = await import("@getpostflow/db");
  const { eq, and } = await import("drizzle-orm");
  const { getConnector, classifySentiment, generateSuggestedReply, shouldEscalate } =
    await import("@getpostflow/social");

  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

  // Supported platforms for inbox (Reddit excluded — connector throws)
  const INBOX_PLATFORMS = ["facebook", "instagram", "discord"];

  let query = db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.isActive, true))
    .$dynamic();

  if (job.data.clientId) {
    query = query.where(eq(socialAccounts.clientId, job.data.clientId));
  }

  const accounts = await query;

  let synced = 0;
  let failed = 0;
  let escalated = 0;

  for (const account of accounts) {
    const platform = account.platform.toLowerCase();
    if (!INBOX_PLATFORMS.includes(platform)) {
      continue; // Reddit and unsupported platforms skip inbox sync
    }

    try {
      const connector = getConnector(platform as Parameters<typeof getConnector>[0]);
      let inboxMessages: Awaited<ReturnType<typeof connector.fetchInbox>>;

      try {
        inboxMessages = await connector.fetchInbox(account.orgId, fifteenMinutesAgo);
      } catch {
        // fetchInbox not implemented for this platform — skip silently
        continue;
      }

      for (const msg of inboxMessages) {
        // Upsert conversation
        const [existingConv] = await db
          .select()
          .from(conversations)
          .where(
            and(
              eq(conversations.platformConversationId, msg.threadId),
              eq(conversations.platform, platform)
            )
          )
          .limit(1);

        let conversationId: string;

        if (!existingConv) {
          const [created] = await db
            .insert(conversations)
            .values({
              clientId: account.clientId ?? account.orgId,
              platform,
              platformConversationId: msg.threadId,
              participantHandle: msg.authorId,
              status: "open",
              priority: "normal",
              socialAccountId: account.id,
              lastMessageAt: new Date(msg.receivedAt),
            })
            .returning({ id: conversations.id });

          conversationId = created!.id;
        } else {
          conversationId = existingConv.id;
          await db
            .update(conversations)
            .set({ lastMessageAt: new Date(msg.receivedAt) })
            .where(eq(conversations.id, existingConv.id));
        }

        // Skip duplicate messages
        const [dupMsg] = await db
          .select()
          .from(messages)
          .where(eq(messages.platformMessageId, msg.messageId))
          .limit(1);

        if (dupMsg) continue;

        // Classify sentiment + AI-suggested reply
        const { sentiment, confidence } = classifySentiment(msg.content);
        const suggestedReply = generateSuggestedReply(
          msg.content,
          sentiment,
          platform,
          account.accountName
        );
        const escalate = shouldEscalate(sentiment);
        const msgStatus = escalate ? "escalated" : "unread";

        await db.insert(messages).values({
          conversationId,
          platformMessageId: msg.messageId,
          direction: "inbound",
          content: msg.content,
          senderHandle: msg.authorId,
          sentiment,
          aiSuggestedReply: suggestedReply,
          aiConfidence: confidence,
          status: msgStatus,
          createdAt: new Date(msg.receivedAt),
        });

        if (escalate) {
          await db
            .update(conversations)
            .set({
              status: "open",
              priority: sentiment === "urgent" ? "urgent" : "high",
              sentimentSummary: sentiment,
            })
            .where(eq(conversations.id, conversationId));

          // Notify assigned user
          if (existingConv?.assignedToUserId) {
            await db.insert(notifications).values({
              orgId: account.orgId,
              userId: existingConv.assignedToUserId,
              kind: "inbox_escalation",
              title: "Conversation escalated",
              body: `A ${sentiment} message from @${msg.authorId} on ${platform} requires your attention.`,
              linkHref: `/dashboard/inbox`,
            });
          }
          escalated++;
        }

        synced++;
      }
    } catch (err) {
      failed++;
      console.error(
        `[inbox-sync] Failed to sync account=${account.id} platform=${platform}:`,
        (err as Error).message
      );
    }
  }

  console.log(
    `[inbox-sync] Completed: synced=${synced} escalated=${escalated} failed=${failed}`
  );
}

export const publishQueue = new Queue<PublishJobData>(QUEUES.CONTENT_PUBLISH, {
  connection: makeConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

// Publish worker
const publishWorker = new Worker<PublishJobData>(
  QUEUES.CONTENT_PUBLISH,
  handlePublishJob,
  {
    connection: makeConnection(),
    concurrency: 5,
  }
);

publishWorker.on("completed", (job: Job) => {
  console.log(`[publish-queue] Job ${job.id} completed`);
});

publishWorker.on("failed", (job: Job | undefined, err: Error) => {
  void handlePublishFailed(job as Job<PublishJobData> | undefined, err);
});

// Analytics sync worker — repeatable every 6 hours
const analyticsWorker = new Worker<AnalyticsSyncJobData>(
  QUEUES.ANALYTICS_SYNC,
  handleAnalyticsSyncJob,
  {
    connection: makeConnection(),
    concurrency: 2,
  }
);

analyticsWorker.on("completed", (job: Job) => {
  console.log(`[analytics-sync] Job ${job.id} completed`);
});

analyticsWorker.on("failed", (_job: Job | undefined, err: Error) => {
  console.error(`[analytics-sync] Job failed:`, err.message);
});

// Inbox sync worker — repeatable every 15 minutes
export const inboxSyncQueue = new Queue<InboxSyncJobData>(QUEUES.INBOX_SYNC, {
  connection: makeConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
  },
});

const inboxSyncWorker = new Worker<InboxSyncJobData>(
  QUEUES.INBOX_SYNC,
  handleInboxSyncJob,
  {
    connection: makeConnection(),
    concurrency: 3,
  }
);

inboxSyncWorker.on("completed", (job: Job) => {
  console.log(`[inbox-sync] Job ${job.id} completed`);
});

inboxSyncWorker.on("failed", (_job: Job | undefined, err: Error) => {
  console.error(`[inbox-sync] Job failed:`, err.message);
});

// Stub workers for remaining queues (Phase 5+)
const stubQueues = [
  QUEUES.ONBOARDING_ANALYSIS,
  QUEUES.WEBHOOK_RECONCILE,
  QUEUES.SOCIAL_POLL,
  QUEUES.AI_JOBS,
];

const stubWorkers = stubQueues.map((queueName) => {
  const w = new Worker(
    queueName,
    async (job: Job) => {
      console.log(`[${queueName}] Processing job ${job.id} (stub)`);
    },
    { connection: makeConnection() }
  );
  w.on("failed", (_job: Job | undefined, err: Error) => {
    console.error(`[${queueName}] Job failed:`, err.message);
  });
  return w;
});

console.log(
  `[worker] GetPostFlow BullMQ worker started. Active queues: ${
    [QUEUES.CONTENT_PUBLISH, QUEUES.ANALYTICS_SYNC, QUEUES.INBOX_SYNC, ...stubQueues].join(", ")
  }`
);

// ── Analytics sync scheduler ─────────────────────────────────────────────────

/**
 * Schedules a recurring analytics sync job every 6 hours.
 * Safe to call multiple times — BullMQ deduplicates by jobId.
 */
export async function scheduleAnalyticsSync(): Promise<void> {
  const queue = new Queue<AnalyticsSyncJobData>(QUEUES.ANALYTICS_SYNC, {
    connection: makeConnection(),
  });

  await queue.upsertJobScheduler("analytics-sync-every-6h", {
    every: 6 * 60 * 60 * 1000, // 6 hours in ms
  }, {
    name: "analytics-sync-scheduled",
    data: {},
  });

  await queue.close();
}

// Auto-schedule on startup
scheduleAnalyticsSync().catch((err) => {
  console.error("[worker] Failed to schedule analytics sync:", err);
});

// ── Inbox sync scheduler ──────────────────────────────────────────────────────

/**
 * Schedules a recurring inbox sync job every 15 minutes.
 * Safe to call multiple times — BullMQ deduplicates by jobId.
 */
export async function scheduleInboxSync(): Promise<void> {
  const queue = new Queue<InboxSyncJobData>(QUEUES.INBOX_SYNC, {
    connection: makeConnection(),
  });

  await queue.upsertJobScheduler("inbox-sync-every-15m", {
    every: 15 * 60 * 1000, // 15 minutes in ms
  }, {
    name: "inbox-sync-scheduled",
    data: {},
  });

  await queue.close();
}

// Auto-schedule on startup
scheduleInboxSync().catch((err) => {
  console.error("[worker] Failed to schedule inbox sync:", err);
});

// ── Queue factory (for enqueuing from apps/web) ───────────────────────────────

export function createQueue<T = unknown>(name: string) {
  return new Queue<T>(name, { connection: makeConnection() });
}

export { publishWorker, analyticsWorker, inboxSyncWorker, stubWorkers };
