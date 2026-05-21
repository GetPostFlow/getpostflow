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

## Marketing pages

All marketing pages are statically renderable (no auth required):

| Route | Page |
|---|---|
| `/` | Landing |
| `/pricing` | Pricing |
| `/features` | Features detail |
| `/how-it-works` | Step-by-step process |
| `/case-studies` | Case study grid |
| `/faq` | FAQ (with JSON-LD FAQPage schema) |
| `/blog` | Blog index |
| `/blog/:slug` | Blog post |
| `/contact` | Contact form |
| `/about` | About page |
| `/careers` | Job listings |
| `/legal` | Legal index |
| `/legal/cookie-policy` | Cookie policy |
| `/legal/gdpr` | GDPR compliance |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

---

## SEO

- `app/sitemap.ts` — Next.js App Router sitemap (auto-generates `/sitemap.xml`)
- `public/robots.txt` — crawl rules, disallows `/dashboard/*` and `/api/*`
- `lib/marketing/json-ld.tsx` — structured data components (Organization, Service, FAQPage, BreadcrumbList, BlogPosting)
- Global `Metadata` with `metadataBase`, Open Graph, Twitter card, and canonical URL in `app/layout.tsx`
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) via `next.config.ts`

---

## Multi-language (v1)

Five locales supported: **EN** (default), **ES**, **FR**, **PT**, **DE**.

- Message files: `messages/{locale}.json`
- Configuration: `i18n.ts` (next-intl)
- Locale switcher in footer (`lib/marketing/locale-switcher.tsx`)
- Preference stored in `NEXT_LOCALE` cookie

---

## Rate limiting

API routes (`/api/*`) are rate-limited via Upstash Redis sliding window (60 req/min per IP).
Webhooks (`/api/clerk/webhook`, `/api/stripe/webhook`, `/api/webhooks/*`) are excluded.
Configure with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`.

---

## Health check

`GET /api/health` returns a JSON status for all subsystems: DB, Redis, Ayrshare, OpenAI, and Stripe.
Returns HTTP 200 if all checks pass, 503 if any check fails.

---

## CI

GitHub Actions runs on every PR and push to `main`:

- **Typecheck** — `pnpm typecheck` via Turborepo
- **Lint** — `pnpm lint`
- **Test** — `pnpm test`
- **Build** — `pnpm build` (depends on typecheck passing)

See `.github/workflows/ci.yml`.
