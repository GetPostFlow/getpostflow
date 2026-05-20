/**
 * BullMQ worker entry point — stub for Phase 0.1.
 * All queue processors are registered here. Actual job implementations
 * are added in subsequent phases.
 *
 * Required env vars (see .env.example):
 *   UPSTASH_REDIS_URL  — Upstash Redis REST URL
 *   UPSTASH_REDIS_TOKEN — Upstash Redis REST token
 *   REDIS_URL          — ioredis-compatible connection string (worker uses this)
 */

import { Queue, Worker, type Job } from "bullmq";

const redisConnection = {
  url: process.env.REDIS_URL ?? "",
};

// ── Queue names ─────────────────────────────────────────────────────────────

export const QUEUES = {
  ONBOARDING_ANALYSIS: "onboarding-analysis",
  CONTENT_PUBLISH: "content-publish",
  ANALYTICS_SYNC: "analytics-sync",
  WEBHOOK_RECONCILE: "webhook-reconcile",
  SOCIAL_POLL: "social-poll",
  AI_JOBS: "ai-jobs",
} as const;

// ── Stub processors ─────────────────────────────────────────────────────────

function registerWorker(queueName: string) {
  const worker = new Worker(
    queueName,
    async (job: Job) => {
      console.log(`[${queueName}] Processing job ${job.id} (stub)`);
    },
    { connection: { url: redisConnection.url } }
  );

  worker.on("completed", (job: Job) => {
    console.log(`[${queueName}] Job ${job.id} completed`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`[${queueName}] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

const workers = Object.values(QUEUES).map(registerWorker);

console.log(
  `[worker] GetPostFlow BullMQ worker started. Registered ${workers.length} queue processors.`
);

// Export queue factories for enqueuing from apps/web
export function createQueue(name: string) {
  return new Queue(name, { connection: { url: redisConnection.url } });
}
