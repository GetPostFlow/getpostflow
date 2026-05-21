# Contributing to GetPostFlow

Thank you for your interest in contributing. This document covers the development setup, code conventions, and pull request process.

---

## Development setup

### Prerequisites

- **Node.js** 22+
- **pnpm** 9.15.4+

```bash
corepack enable && corepack prepare pnpm@9.15.4 --activate
```

### Install

```bash
git clone https://github.com/getpostflow/getpostflow
cd getpostflow
pnpm install
cp .env.example .env.local
# Fill in .env.local (only DATABASE_URL is required for most local work)
pnpm dev
```

---

## Monorepo structure

This is a pnpm + Turborepo monorepo.

```
apps/
  web/       — Next.js 15 app (main frontend + API routes)
  worker/    — BullMQ background worker (Fly.io)
packages/
  db/        — Drizzle ORM schema, migrations, typed queries
  ui/        — Shared component primitives
  billing/   — Plan/entitlement definitions
  permissions/ — RBAC helpers
  ai/        — AI provider abstractions
  social/    — Platform adapter contracts
  auth/      — Clerk auth env contract
  reporting/ — Report domain types
  shared/    — App-wide constants and stubs
  config/    — Shared ESLint, tsconfig, Tailwind tokens
```

---

## Code conventions

### TypeScript

- Strict mode is on everywhere — no `any`, no `// @ts-ignore` without justification.
- Export types explicitly — use `export type` for type-only exports.
- Prefer `unknown` over `any` for external/untrusted data; narrow explicitly.

### React / Next.js

- Server Components are the default. Add `"use client"` only when you need browser APIs or React state.
- Use `app/` directory conventions — layouts, page, route handlers.
- Colocate route-specific components inside the page folder. Shared components go in `packages/ui`.

### API routes

- All route handlers must validate inputs with a Zod schema before processing.
- All route handlers return `NextResponse.json()` with explicit HTTP status codes.
- Secrets stay server-side. Never read `process.env.SOME_SECRET` in a Client Component.

### Styling

- Tailwind v4 utility classes with the design system tokens from `packages/config/tailwind`.
- Inline `style={{}}` is acceptable for dynamic values (e.g. chart colors); avoid it for static styles.
- No CSS Modules or `styled-components` — keep it Tailwind-only.

### Database

- Schema changes go in `packages/db/src/schema.ts`.
- Generate migration files: `pnpm --filter @getpostflow/db generate`.
- Apply migrations: `pnpm --filter @getpostflow/db migrate`.
- Never modify existing migrations — create a new one.

---

## Branching & commit conventions

- Branch from `main`: `feat/my-feature`, `fix/my-bug`, `chore/my-task`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add approval batch endpoint`
  - `fix: resolve timezone offset in report scheduler`
  - `chore: update drizzle-orm to 0.31`
  - `docs: update API rate limiting section in README`

---

## Pull requests

1. Keep PRs focused — one feature or fix per PR.
2. Add/update tests for any changed logic.
3. Run the full check suite locally before opening:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

4. Fill in the PR description template — what changed, why, and how to test it.
5. Request review from at least one team member.

---

## Testing

```bash
pnpm test                        # Run all tests across packages
pnpm --filter apps/web test      # Run web app tests only
pnpm --filter @getpostflow/db test  # Run db package tests only
```

Tests use **Vitest**. Integration tests that touch Neon Postgres require `DATABASE_URL` set in your local `.env.local`.

---

## Environment variables

All env vars are documented in [`.env.example`](./.env.example). Never commit `.env.local`.

---

## Reporting bugs

Open a GitHub Issue with:
- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Environment (OS, Node version, browser if relevant)

---

## Questions

Reach the team at [hello@getpostflow.com](mailto:hello@getpostflow.com) or open a Discussion on GitHub.
