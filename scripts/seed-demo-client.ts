#!/usr/bin/env npx ts-node --esm
/**
 * seed:demo-client
 *
 * Creates "Acme Bakery" through the full state machine using stub AI.
 * Requires DATABASE_URL to be set (or falls back to localhost defaults).
 *
 * Usage:
 *   pnpm seed:demo-client
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  clientIntakeSubmissions,
  clientBrandStrategies,
  portalTokens,
  users,
  orgMemberships,
} from "@getpostflow/db";
import { getBrandStrategyFixture, type IntakeData } from "@getpostflow/ai";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local from apps/web
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DEMO_ORG_NAME = process.env.SEED_ORG_NAME ?? "Demo Agency";
// Allow targeting a real Clerk org via SEED_ORG_CLERK_ID so seed data lands
// in the correct org in production/staging. Falls back to the fixture value.
const DEMO_ORG_CLERK_ID = process.env.SEED_ORG_CLERK_ID ?? "demo-org-clerk-id";
const DEMO_CLIENT_NAME = "Acme Bakery";
const DEMO_CLIENT_SLUG = "acme-bakery";
const DEMO_CLIENT_EMAIL = "owner@acmebakery.com";
const DEMO_USER_EMAIL = "strategist@demoagency.com";

const ACME_INTAKE: IntakeData = {
  businessName: "Acme Bakery",
  website: "https://acmebakery.com",
  industry: "Food & Beverage",
  targetAudience:
    "Health-conscious millennials and Gen Z in urban areas, aged 22–38, who value artisan quality, local sourcing, and Instagram-worthy food experiences.",
  brandVoice: {
    formalCasual: 7,
    seriousPlayful: 6,
    conservativeBold: 7,
  },
  uniqueSellingProps:
    "Sourdough bread baked with 100-year-old starter. Zero artificial preservatives. Same-day local delivery. Custom celebration cakes.",
  productsServices:
    "Artisan sourdough loaves, pastries, custom cakes, seasonal specials, wholesale to local cafes.",
  competitors: "Big chain bakeries: lack authenticity. Small local bakeries: limited range. Grocery store bakery: no craft.",
  contentGoals: ["Brand awareness", "Community building", "Product promotion"],
  targetLocales: ["en"],
  preferredCadence: {
    instagram: "Daily",
    facebook: "3x per week",
    linkedin: "Weekly",
    tiktok: "3x per week",
  },
  existingAssets: {
    colorHex: "#c2825a",
    fonts: "Playfair Display (headings), Lato (body)",
    sampleContentUrls: ["https://instagram.com/acmebakery"],
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const db = createDb(DATABASE_URL!);
  console.log("🌱 Seeding demo client: Acme Bakery...\n");

  // ── 1. Ensure demo org exists ─────────────────────────────────────────────

  let [org] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.clerkOrgId, DEMO_ORG_CLERK_ID))
    .limit(1);

  if (!org) {
    const [inserted] = await db
      .insert(orgs)
      .values({
        clerkOrgId: DEMO_ORG_CLERK_ID,
        name: DEMO_ORG_NAME,
        brandColor: "#2F5D62",
      })
      .returning();
    org = inserted;
    console.log(`✓ Created org: ${org.name} (${org.id})`);
  } else {
    console.log(`✓ Org exists: ${org.name} (${org.id})`);
  }

  // ── 2. Ensure demo user exists ────────────────────────────────────────────

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_USER_EMAIL))
    .limit(1);

  if (!user) {
    const [insertedUser] = await db
      .insert(users)
      .values({
        clerkUserId: "demo-user-clerk-id",
        email: DEMO_USER_EMAIL,
        fullName: "Demo Strategist",
      })
      .returning();
    user = insertedUser;
    console.log(`✓ Created user: ${user.email} (${user.id})`);

    // Add to org as strategist
    await db.insert(orgMemberships).values({
      orgId: org.id,
      userId: user.id,
      role: "strategist",
    });
    console.log(`✓ Added user to org as strategist`);
  } else {
    console.log(`✓ User exists: ${user.email}`);
  }

  // ── 3. Upsert demo client ─────────────────────────────────────────────────

  let [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.orgId, org.id), eq(clients.slug, DEMO_CLIENT_SLUG)))
    .limit(1);

  if (!client) {
    const [inserted] = await db
      .insert(clients)
      .values({
        orgId: org.id,
        name: DEMO_CLIENT_NAME,
        slug: DEMO_CLIENT_SLUG,
        status: "intake_pending",
        industry: "Food & Beverage",
        primaryContactName: "Jane Acme",
        primaryContactEmail: DEMO_CLIENT_EMAIL,
        targetLocales: ["en"],
        primaryLocale: "en",
      })
      .returning();
    client = inserted;
    console.log(`✓ Created client: ${client.name} (${client.id})`);
  } else {
    console.log(`✓ Client exists: ${client.name} (${client.id})`);
  }

  // ── 4. Save intake submission ─────────────────────────────────────────────

  const [existingIntake] = await db
    .select()
    .from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, client.id))
    .limit(1);

  if (!existingIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: client.id,
      rawPayload: ACME_INTAKE as unknown as Record<string, unknown>,
      isDraft: false,
      submittedAt: new Date(),
    });
    console.log(`✓ Created intake submission`);
  } else {
    console.log(`✓ Intake exists`);
  }

  // ── 5. Generate brand strategy with stub AI ───────────────────────────────

  const [existingStrategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .limit(1);

  let strategy = existingStrategy;

  if (!strategy) {
    // Force stub mode for seeding
    const draft = getBrandStrategyFixture(ACME_INTAKE);
    const [inserted] = await db
      .insert(clientBrandStrategies)
      .values({
        clientId: client.id,
        versionInt: 1,
        status: "active",
        draftPayload: draft as unknown as Record<string, unknown>,
        editedPayload: draft as unknown as Record<string, unknown>,
        aiMetadata: {
          generatedAt: new Date().toISOString(),
          stubMode: true,
          seedScript: true,
        },
        strategistComments: [
          {
            id: crypto.randomUUID(),
            authorId: user.id,
            authorName: "Demo Strategist",
            body: "Strategy looks great. Positioning statement is spot on for the artisan bakery market.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
        ],
        approvedAt: new Date(),
      })
      .returning();
    strategy = inserted;
    console.log(`✓ Created brand strategy (stub mode, status: active)`);
  } else {
    console.log(`✓ Strategy exists (status: ${strategy.status})`);
  }

  // ── 6. Update client status → active ─────────────────────────────────────

  await db
    .update(clients)
    .set({ status: "active" })
    .where(eq(clients.id, client.id));
  console.log(`✓ Client status → active`);

  // ── 7. Create portal token for demo ──────────────────────────────────────

  const tokenPayload = `${client.id}:${DEMO_CLIENT_EMAIL}:demo-seed`;
  const tokenHash = crypto
    .createHmac("sha256", process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me")
    .update(tokenPayload)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const [existingToken] = await db
    .select()
    .from(portalTokens)
    .where(eq(portalTokens.tokenHash, tokenHash))
    .limit(1);

  if (!existingToken) {
    await db.insert(portalTokens).values({
      clientId: client.id,
      tokenHash,
      email: DEMO_CLIENT_EMAIL,
      expiresAt,
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const orgSlug = org.clerkOrgId ?? org.id;
  const portalUrl = `${appUrl}/portal/${orgSlug}/${client.slug}/strategy?token=${tokenHash}`;

  console.log(`\n✅ Demo client seeded successfully!\n`);
  console.log(`  Client ID:        ${client.id}`);
  console.log(`  Dashboard URL:    ${appUrl}/dashboard/clients/${client.id}`);
  console.log(`  Strategy Review:  ${appUrl}/dashboard/clients/${client.id}/strategy/review`);
  console.log(`  Portal URL:       ${portalUrl}`);
  console.log(`\n  Demo Path:`);
  console.log(`  1. Sign in → /dashboard/clients`);
  console.log(`  2. See "Acme Bakery" with status: Active`);
  console.log(`  3. Open strategy review to see full AI draft`);
  console.log(`  4. Open portal URL to see client approval UI`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
