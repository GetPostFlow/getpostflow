FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# ── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter @getpostflow/worker...

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder

COPY tsconfig.base.json ./
COPY apps/worker ./apps/worker
COPY packages/db/src ./packages/db/src
COPY packages/shared/src ./packages/shared/src

RUN pnpm --filter @getpostflow/worker build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]
