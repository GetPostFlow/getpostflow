# GetPostFlow

GetPostFlow is an AI-powered hybrid managed-service SaaS for social community management,
multilingual content creation, approval workflows, reporting, and publishing across all major
social platforms.

---

## Monorepo layout

```
apps/
  web/       — Next.js 15 + React 19 + Tailwind v4 + App Router (Vercel)
  worker/    — BullMQ worker process (Fly.io)
packages/
  db/        — Drizzle ORM schema + Neon Postgres + pgvector scaffolding
  ui/        — Shared UI primitives (Radix-ready)
  billing/   — Plan and entitlement definitions
  permissions/ — Roles, RBAC helpers, feature flags
  ai/        — Provider abstractions, task routing table
  social/    — Platform adapter contracts (all 9 launch platforms)
  auth/      — Clerk auth env contract
  reporting/ — Report formats and domain types
  shared/    — App constants, locales, integration env stubs
  config/    — Shared ESLint, tsconfig presets, Tailwind tokens
```

---

## Prerequisites

- **Node.js** 22+
- **pnpm** 9.15.4+ — install with `corepack enable && corepack prepare pnpm@9.15.4 --activate`

---

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Copy environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values you need for local development.
All required env vars are documented with comments in `.env.example`.
No live keys are required to run the app shell — only `DATABASE_URL` is
needed if you want to connect to Neon Postgres.

### 3. Start the web app

```bash
pnpm dev
```

Opens `http://localhost:3000`.

### 4. Run the BullMQ worker (optional for Phase 0.1)

```bash
pnpm --filter @getpostflow/worker dev
```

Requires `REDIS_URL` to be set.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start apps/web in dev mode |
| `pnpm build` | Build all workspaces via Turborepo |
| `pnpm typecheck` | TypeScript typecheck all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |

---

## Environment variables

All env vars are documented in [`.env.example`](./.env.example).

Integrations included (all env-driven stubs — no live keys required for Phase 0.1):

| Integration | Purpose |
|---|---|
| Neon Postgres | Primary database with pgvector |
| Upstash Redis | Queues, caching (BullMQ backing store) |
| Clerk | Authentication and multi-tenant auth |
| Stripe | Billing and subscription management |
| Cloudflare R2 | Media asset storage |
| Ably | Realtime pub/sub (inbox, approvals) |
| Sentry | Error tracking |
| PostHog | Product analytics and feature flags |
| Axiom | Structured log ingestion |
| BullMQ | Job queues (worker process) |
| Resend | Transactional email |
| OpenAI / Anthropic / Gemini | AI model providers |
| Meta / TikTok / Google / LinkedIn / Pinterest / Reddit / Discord | Social platform OAuth |

---

## Deployment

### Vercel (apps/web)

- Production URL: https://getpostflow.vercel.app
- `vercel.json` is at the repo root and at `apps/web/vercel.json`.
- `rootDirectory` is set to `apps/web` in the Vercel project settings.
- Configure environment variables in the Vercel dashboard for each environment:
  - **Development** → local `.env.local`
  - **Preview** → per-branch preview deployments
  - **Production** → production environment
- Pages for external platform app approval: `/privacy` and `/terms` are live.

### Fly.io (apps/worker)

```bash
# From repo root
fly launch --config apps/worker/fly.toml
fly secrets set REDIS_URL=... DATABASE_URL=...
fly deploy --config apps/worker/fly.toml
```

See `apps/worker/fly.toml` for full configuration.

---

## Design system

| Token | Value | Use |
|---|---|---|
| `bg.canvas` | `#F6F2EA` | Page background |
| `bg.surface` | `#FFFDF9` | Card / elevated surface |
| `bg.subtle` | `#EFE7DA` | Muted fill zones |
| `border.soft` | `#D8CCBA` | Dividers and outlines |
| `text.primary` | `#1F2430` | Body text |
| `text.secondary` | `#5E6472` | Secondary text |
| `brand.primary` | `#2F5D62` | Primary brand colour |
| `brand.secondary` | `#8C6A43` | Secondary brand colour |

Typography: **Plus Jakarta Sans / Satoshi** (display) + **Inter** (body).

Tailwind tokens are in `packages/config/tailwind/index.js`.

---

## CI

GitHub Actions runs on every PR and push to `main`:

- **Typecheck** — `pnpm typecheck` via Turborepo
- **Lint** — `pnpm lint`
- **Test** — `pnpm test`
- **Build** — `pnpm build` (depends on typecheck passing)

See `.github/workflows/ci.yml`.
