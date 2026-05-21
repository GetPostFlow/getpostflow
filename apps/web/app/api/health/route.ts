import { NextResponse } from "next/server";

export async function GET() {
  const start = Date.now();

  const checks: Record<string, { ok: boolean; latency?: number; error?: string }> = {};

  // ── DB check ──────────────────────────────────────────────────────────
  try {
    const dbStart = Date.now();
    const { createDb } = await import("@getpostflow/db");
    const db = createDb();
    // Lightweight ping — select 1
    await db.execute("select 1" as Parameters<typeof db.execute>[0]);
    checks.db = { ok: true, latency: Date.now() - dbStart };
  } catch (err) {
    checks.db = { ok: false, error: String(err) };
  }

  // ── Redis check ────────────────────────────────────────────────────────
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    try {
      const redisStart = Date.now();
      const res = await fetch(`${redisUrl}/ping`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: "no-store",
      });
      checks.redis = { ok: res.ok, latency: Date.now() - redisStart };
    } catch (err) {
      checks.redis = { ok: false, error: String(err) };
    }
  } else {
    checks.redis = { ok: false, error: "UPSTASH_REDIS_REST_URL not configured" };
  }

  // ── Buffer check (GraphQL) ─────────────────────────────────────────────
  const bufferKey = process.env.BUFFER_API_KEY;
  if (bufferKey) {
    try {
      const bufferStart = Date.now();
      const res = await fetch("https://api.buffer.com/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bufferKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: "{ __typename }" }),
        cache: "no-store",
      });
      const json = (await res.json()) as { errors?: unknown[] };
      const gqlOk = res.ok && (!json.errors || (json.errors as unknown[]).length === 0);
      checks.buffer = { ok: gqlOk, latency: Date.now() - bufferStart };
    } catch (err) {
      checks.buffer = { ok: false, error: String(err) };
    }
  } else {
    checks.buffer = { ok: false, error: "BUFFER_API_KEY not configured" };
  }

  // ── OpenAI check ──────────────────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  checks.openai = {
    ok: Boolean(openaiKey && openaiKey.startsWith("sk-")),
    error: openaiKey ? undefined : "OPENAI_API_KEY not configured",
  };

  // ── Stripe check ──────────────────────────────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  checks.stripe = {
    ok: Boolean(stripeKey && (stripeKey.startsWith("sk_live_") || stripeKey.startsWith("sk_test_"))),
    error: stripeKey ? undefined : "STRIPE_SECRET_KEY not configured",
  };

  const allOk = Object.values(checks).every((c) => c.ok);
  const totalLatency = Date.now() - start;

  return NextResponse.json(
    {
      ok: allOk,
      service: "getpostflow-web",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      latency_ms: totalLatency,
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
