/**
 * Integration env-var stubs — Phase 0.1 documentation only.
 * No live keys required until Phase 1. See .env.example for all values.
 */
export const integrationEnvVars = {
  neonPostgres: {
    required: ["DATABASE_URL"],
    docs: "https://console.neon.tech",
  },
  upstashRedis: {
    required: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "REDIS_URL"],
    docs: "https://console.upstash.com",
  },
  clerk: {
    required: [
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
      "CLERK_WEBHOOK_SECRET",
    ],
    docs: "https://dashboard.clerk.com",
  },
  stripe: {
    required: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    optional: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    docs: "https://dashboard.stripe.com",
  },
  cloudflareR2: {
    required: [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET",
    ],
    optional: ["R2_PUBLIC_URL"],
    docs: "https://dash.cloudflare.com",
  },
  ably: {
    required: ["ABLY_API_KEY"],
    optional: ["NEXT_PUBLIC_ABLY_PUBLISHABLE_KEY"],
    docs: "https://ably.com",
  },
  sentry: {
    required: ["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN"],
    optional: ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
    docs: "https://sentry.io",
  },
  posthog: {
    required: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
    docs: "https://app.posthog.com",
  },
  axiom: {
    required: ["AXIOM_TOKEN", "AXIOM_DATASET"],
    docs: "https://app.axiom.co",
  },
  bullmq: {
    required: ["REDIS_URL"],
    optional: ["WORKER_CONCURRENCY", "WORKER_MAX_JOBS_PER_WORKER"],
    docs: "https://docs.bullmq.io",
  },
  resend: {
    required: ["RESEND_API_KEY"],
    optional: ["RESEND_FROM_EMAIL"],
    docs: "https://resend.com",
  },
} as const;
