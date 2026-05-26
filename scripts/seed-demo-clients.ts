#!/usr/bin/env npx ts-node --esm
/**
 * seed:demo-clients
 *
 * Creates 3 demo clients in different states:
 *   1. Sunrise Cafe       – strategy PENDING client review (client_pending)
 *   2. Acme Bakery        – strategy approved, content items PENDING approval
 *   3. Metro Fitness      – everything approved, scheduled content + analytics
 *
 * Usage:
 *   pnpm seed:demo-clients
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  clientIntakeSubmissions,
  clientBrandStrategies,
  contentItems,
  contentVersions,
  portalTokens,
  analyticsAggregates,
  users,
  orgMemberships,
  socialAccounts,
} from "@getpostflow/db";
import { getBrandStrategyFixture, type IntakeData } from "@getpostflow/ai";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

const PORTAL_SECRET = process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Demo Org ──────────────────────────────────────────────────────────────────

const DEMO_ORG_CLERK_ID = "demo-org-clerk-id";
const DEMO_ORG_NAME = "Demo Agency";
const DEMO_USER_EMAIL = "a.rgittens87@gmail.com";

// ─── Intake fixtures ───────────────────────────────────────────────────────────

const SUNRISE_INTAKE: IntakeData = {
  businessName: "Sunrise Cafe",
  website: "https://sunrisecafe.com",
  industry: "Food & Beverage",
  targetAudience:
    "Remote workers, students, and young professionals aged 22–40 who want a welcoming neighbourhood cafe with quality espresso drinks and fast Wi-Fi.",
  brandVoice: { formalCasual: 8, seriousPlayful: 7, conservativeBold: 6 },
  uniqueSellingProps:
    "Single-origin beans sourced directly from three farms. All-day breakfast. Dog-friendly patio. Strong community vibes.",
  productsServices: "Espresso drinks, batch brew, pour-over, pastries, sandwiches, loyalty programme.",
  competitors: "Starbucks (corporate), Blue Bottle (premium price), local diner (dated brand).",
  contentGoals: ["Brand awareness", "Community building", "Drive foot traffic"],
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", tiktok: "Daily" },
  existingAssets: { colorHex: "#F4A832", fonts: "DM Sans (body), Recoleta (headings)", sampleContentUrls: [] },
};

const ACME_INTAKE: IntakeData = {
  businessName: "Acme Bakery",
  website: "https://acmebakery.com",
  industry: "Food & Beverage",
  targetAudience:
    "Health-conscious millennials and Gen Z in urban areas, aged 22–38, who value artisan quality and local sourcing.",
  brandVoice: { formalCasual: 7, seriousPlayful: 6, conservativeBold: 7 },
  uniqueSellingProps: "Sourdough bread baked with 100-year-old starter. Zero artificial preservatives. Custom cakes.",
  productsServices: "Artisan sourdough, pastries, custom cakes, seasonal specials, wholesale.",
  competitors: "Big chain bakeries: lack authenticity. Small local bakeries: limited range.",
  contentGoals: ["Brand awareness", "Product promotion", "Community building"],
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", linkedin: "Weekly", tiktok: "3x per week" },
  existingAssets: { colorHex: "#c2825a", fonts: "Playfair Display (headings), Lato (body)", sampleContentUrls: [] },
};

const METRO_INTAKE: IntakeData = {
  businessName: "Metro Fitness",
  website: "https://metrofitness.com",
  industry: "Health & Fitness",
  targetAudience:
    "Busy urban professionals aged 25–45 who want efficient, results-driven workouts they can fit into their commute.",
  brandVoice: { formalCasual: 5, seriousPlayful: 4, conservativeBold: 8 },
  uniqueSellingProps:
    "45-minute high-intensity classes. Locations at 12 city transit hubs. No membership lock-in. App-based booking.",
  productsServices: "HIIT classes, strength training, yoga, personal training, nutrition coaching.",
  competitors: "Equinox (too expensive), Planet Fitness (low quality), boutique gyms (inconvenient locations).",
  contentGoals: ["Member acquisition", "Community building", "Brand authority"],
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", linkedin: "Weekly", tiktok: "Daily", youtube: "Weekly" },
  existingAssets: { colorHex: "#1A1A2E", fonts: "Barlow Condensed (headings), Inter (body)", sampleContentUrls: [] },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTokenHash(clientId: string, email: string, suffix = "demo-seed") {
  return crypto
    .createHmac("sha256", PORTAL_SECRET)
    .update(`${clientId}:${email}:${suffix}`)
    .digest("hex");
}

function portalUrl(orgSlug: string, clientSlug: string, token: string) {
  return `${APP_URL}/portal/${orgSlug}/${clientSlug}/strategy?token=${token}`;
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const db = createDb(DATABASE_URL!);
  console.log("🌱 Seeding 3 demo clients...\n");

  // ── 1. Org ────────────────────────────────────────────────────────────────

  let [org] = await db.select().from(orgs).where(eq(orgs.clerkOrgId, DEMO_ORG_CLERK_ID)).limit(1);
  if (!org) {
    const [ins] = await db.insert(orgs).values({ clerkOrgId: DEMO_ORG_CLERK_ID, name: DEMO_ORG_NAME, brandColor: "#2F5D62" }).returning();
    org = ins;
    console.log(`✓ Created org: ${org.name} (${org.id})`);
  } else {
    console.log(`✓ Org exists: ${org.name} (${org.id})`);
  }

  // ── 2. Team user (link to actual Clerk user email if it exists) ───────────

  let [adminUser] = await db.select().from(users).where(eq(users.email, DEMO_USER_EMAIL)).limit(1);
  if (!adminUser) {
    const [ins] = await db.insert(users).values({ clerkUserId: `demo-admin-${Date.now()}`, email: DEMO_USER_EMAIL, fullName: "Agency Admin" }).returning();
    adminUser = ins;
    console.log(`✓ Created user: ${adminUser.email} (${adminUser.id})`);
    await db.insert(orgMemberships).values({ orgId: org.id, userId: adminUser.id, role: "org_admin" });
    console.log(`✓ Added user to org as org_admin`);
  } else {
    console.log(`✓ User exists: ${adminUser.email}`);
    const [mem] = await db.select().from(orgMemberships).where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.userId, adminUser.id))).limit(1);
    if (!mem) {
      await db.insert(orgMemberships).values({ orgId: org.id, userId: adminUser.id, role: "org_admin" });
      console.log(`✓ Added membership to org`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 1: Sunrise Cafe — strategy PENDING client approval
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Sunrise Cafe (strategy pending) ──");

  let [sunrise] = await db.select().from(clients).where(and(eq(clients.orgId, org.id), eq(clients.slug, "sunrise-cafe"))).limit(1);
  if (!sunrise) {
    const [ins] = await db.insert(clients).values({
      orgId: org.id,
      name: "Sunrise Cafe",
      slug: "sunrise-cafe",
      status: "client_review",
      industry: "Food & Beverage",
      primaryContactName: "Maria Chen",
      primaryContactEmail: "maria@sunrisecafe.com",
      targetLocales: ["en"],
      primaryLocale: "en",
    }).returning();
    sunrise = ins;
    console.log(`  ✓ Client created (${sunrise.id})`);
  } else {
    await db.update(clients).set({ status: "client_review" }).where(eq(clients.id, sunrise.id));
    console.log(`  ✓ Client exists, updated status → client_review`);
  }

  const [existingSunriseIntake] = await db.select().from(clientIntakeSubmissions).where(eq(clientIntakeSubmissions.clientId, sunrise.id)).limit(1);
  if (!existingSunriseIntake) {
    await db.insert(clientIntakeSubmissions).values({ clientId: sunrise.id, rawPayload: SUNRISE_INTAKE as unknown as Record<string, unknown>, isDraft: false, submittedAt: daysAgo(5) });
    console.log(`  ✓ Intake created`);
  }

  const [existingSunriseStrategy] = await db.select().from(clientBrandStrategies).where(eq(clientBrandStrategies.clientId, sunrise.id)).limit(1);
  if (!existingSunriseStrategy) {
    const draft = getBrandStrategyFixture(SUNRISE_INTAKE);
    await db.insert(clientBrandStrategies).values({
      orgId: org.id,
      clientId: sunrise.id,
      versionInt: 1,
      status: "client_pending",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: { generatedAt: daysAgo(3).toISOString(), stubMode: true },
      strategistComments: [
        { id: crypto.randomUUID(), authorId: adminUser.id, authorName: "Agency Admin", body: "Reviewed and approved internally. Sending to client for sign-off.", createdAt: daysAgo(1).toISOString() },
      ],
      clientComments: [],
    });
    console.log(`  ✓ Strategy created (status: client_pending)`);
  }

  const sunriseToken = makeTokenHash(sunrise.id, "maria@sunrisecafe.com");
  const [existingSunriseToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, sunriseToken)).limit(1);
  if (!existingSunriseToken) {
    await db.insert(portalTokens).values({ clientId: sunrise.id, tokenHash: sunriseToken, email: "maria@sunrisecafe.com", expiresAt: daysFromNow(90) });
  }
  console.log(`  ✓ Portal token: ${sunriseToken.substring(0, 16)}...`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 2: Acme Bakery — strategy approved, content items PENDING
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Acme Bakery (content pending approval) ──");

  let [acme] = await db.select().from(clients).where(and(eq(clients.orgId, org.id), eq(clients.slug, "acme-bakery"))).limit(1);
  if (!acme) {
    const [ins] = await db.insert(clients).values({
      orgId: org.id,
      name: "Acme Bakery",
      slug: "acme-bakery",
      status: "active",
      industry: "Food & Beverage",
      primaryContactName: "Jane Acme",
      primaryContactEmail: "jane@acmebakery.com",
      targetLocales: ["en"],
      primaryLocale: "en",
    }).returning();
    acme = ins;
    console.log(`  ✓ Client created (${acme.id})`);
  } else {
    await db.update(clients).set({ status: "active" }).where(eq(clients.id, acme.id));
    console.log(`  ✓ Client exists, status → active`);
  }

  const [existingAcmeIntake] = await db.select().from(clientIntakeSubmissions).where(eq(clientIntakeSubmissions.clientId, acme.id)).limit(1);
  if (!existingAcmeIntake) {
    await db.insert(clientIntakeSubmissions).values({ clientId: acme.id, rawPayload: ACME_INTAKE as unknown as Record<string, unknown>, isDraft: false, submittedAt: daysAgo(14) });
    console.log(`  ✓ Intake created`);
  }

  const [existingAcmeStrategy] = await db.select().from(clientBrandStrategies).where(eq(clientBrandStrategies.clientId, acme.id)).limit(1);
  if (!existingAcmeStrategy) {
    const draft = getBrandStrategyFixture(ACME_INTAKE);
    await db.insert(clientBrandStrategies).values({
      orgId: org.id,
      clientId: acme.id,
      versionInt: 1,
      status: "client_approved",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: { generatedAt: daysAgo(10).toISOString(), stubMode: true },
      strategistComments: [
        { id: crypto.randomUUID(), authorId: adminUser.id, authorName: "Agency Admin", body: "Strategy approved internally. Very strong positioning.", createdAt: daysAgo(9).toISOString() },
      ],
      clientComments: [
        { id: crypto.randomUUID(), authorName: "Jane Acme", body: "Love the positioning statement! The tone is exactly right.", createdAt: daysAgo(7).toISOString() },
      ],
      approvedAt: daysAgo(7),
    });
    console.log(`  ✓ Strategy created (status: client_approved)`);
  }

  // Content items for Acme Bakery — mix of pending and approved
  const acmeContentItems = [
    { title: "Monday Morning Sourdough Drop", platform: "instagram", status: "pending_review" as const, scheduledFor: daysFromNow(2), body: "Your Monday just got better. 🍞 Fresh sourdough from our 100-year-old starter is now available. Stop by before 10am for first dibs — or order online for same-day delivery.\n\n#AcmeBakery #SourdoughMonday #ArtisanBread #LocalBakery #FreshBaked" },
    { title: "Behind the Scenes: Bread Shaping", platform: "tiktok", status: "pending_review" as const, scheduledFor: daysFromNow(3), body: "Ever wonder how our signature loaves get that perfect crust? Here's a peek into our 4am baking ritual. 🌅 The fold. The proof. The score. The magic.\n\n#BakingBehindTheScenes #SourdoughTikTok #ArtisanBread #BreadBaking" },
    { title: "Weekend Special: Custom Celebration Cakes", platform: "facebook", status: "approved" as const, scheduledFor: daysFromNow(5), body: "Planning a celebration? Our custom cakes are made to order with locally sourced ingredients. From birthdays to weddings — every occasion deserves something extraordinary.\n\n🎂 Order by Thursday for weekend pickup. Link in bio." },
    { title: "Client Story: Wholesale Partner Spotlight", platform: "linkedin", status: "approved" as const, scheduledFor: daysFromNow(7), body: "We're proud to supply fresh artisan bread to 12 local cafes across the city. This week we're spotlighting our longest-running partner, Brew & Co., who've been serving our sourdough for 3 years." },
    { title: "Seasonal Special: Pumpkin Spice Everything", platform: "instagram", status: "published" as const, scheduledFor: daysAgo(3), body: "Fall is officially here at Acme Bakery 🍂 Introducing our limited-edition pumpkin spice collection: loaves, muffins, and our fan-favourite pumpkin cream cheese danish.\n\nAvailable through October only." },
  ];

  for (const item of acmeContentItems) {
    const [existing] = await db.select({ id: contentItems.id }).from(contentItems).where(and(eq(contentItems.clientId, acme.id), eq(contentItems.title, item.title))).limit(1);
    if (!existing) {
      const [ci] = await db.insert(contentItems).values({
        clientId: acme.id,
        orgId: org.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: item.scheduledFor,
        publishedAt: item.status === "published" ? daysAgo(3) : null,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: item.status === "published" ? ["ai-generated", "published"] : ["ai-generated"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
      console.log(`  ✓ Content item: "${item.title}" (${item.status})`);
    }
  }

  const acmeToken = makeTokenHash(acme.id, "jane@acmebakery.com");
  const [existingAcmeToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, acmeToken)).limit(1);
  if (!existingAcmeToken) {
    await db.insert(portalTokens).values({ clientId: acme.id, tokenHash: acmeToken, email: "jane@acmebakery.com", expiresAt: daysFromNow(90) });
  }
  console.log(`  ✓ Portal token: ${acmeToken.substring(0, 16)}...`);

  // Social accounts for Acme
  const acmePlatforms = ["instagram", "facebook", "tiktok", "linkedin"];
  for (const platform of acmePlatforms) {
    const [existing] = await db.select().from(socialAccounts).where(and(eq(socialAccounts.clientId, acme.id), eq(socialAccounts.platform, platform))).limit(1);
    if (!existing) {
      await db.insert(socialAccounts).values({ orgId: org.id, clientId: acme.id, platform, accountName: `@acmebakery${platform === "instagram" ? "" : `_${platform}`}`, externalAccountId: `acme-${platform}-demo-id` });
    }
  }
  console.log(`  ✓ Social accounts: ${acmePlatforms.join(", ")}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 3: Metro Fitness — everything approved, analytics data
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Metro Fitness (active, full analytics) ──");

  let [metro] = await db.select().from(clients).where(and(eq(clients.orgId, org.id), eq(clients.slug, "metro-fitness"))).limit(1);
  if (!metro) {
    const [ins] = await db.insert(clients).values({
      orgId: org.id,
      name: "Metro Fitness",
      slug: "metro-fitness",
      status: "active",
      industry: "Health & Fitness",
      primaryContactName: "Alex Torres",
      primaryContactEmail: "alex@metrofitness.com",
      targetLocales: ["en"],
      primaryLocale: "en",
    }).returning();
    metro = ins;
    console.log(`  ✓ Client created (${metro.id})`);
  } else {
    await db.update(clients).set({ status: "active" }).where(eq(clients.id, metro.id));
    console.log(`  ✓ Client exists, status → active`);
  }

  const [existingMetroIntake] = await db.select().from(clientIntakeSubmissions).where(eq(clientIntakeSubmissions.clientId, metro.id)).limit(1);
  if (!existingMetroIntake) {
    await db.insert(clientIntakeSubmissions).values({ clientId: metro.id, rawPayload: METRO_INTAKE as unknown as Record<string, unknown>, isDraft: false, submittedAt: daysAgo(30) });
    console.log(`  ✓ Intake created`);
  }

  const [existingMetroStrategy] = await db.select().from(clientBrandStrategies).where(eq(clientBrandStrategies.clientId, metro.id)).limit(1);
  if (!existingMetroStrategy) {
    const draft = getBrandStrategyFixture(METRO_INTAKE);
    await db.insert(clientBrandStrategies).values({
      orgId: org.id,
      clientId: metro.id,
      versionInt: 1,
      status: "active",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: { generatedAt: daysAgo(28).toISOString(), stubMode: true },
      strategistComments: [
        { id: crypto.randomUUID(), authorId: adminUser.id, authorName: "Agency Admin", body: "Excellent strategy — very differentiated positioning around transit convenience.", createdAt: daysAgo(26).toISOString() },
      ],
      clientComments: [
        { id: crypto.randomUUID(), authorName: "Alex Torres", body: "This nails our brand perfectly. Love the 'urban efficiency' positioning.", createdAt: daysAgo(25).toISOString() },
      ],
      approvedAt: daysAgo(25),
    });
    console.log(`  ✓ Strategy created (status: active)`);
  }

  // Published + scheduled content for Metro
  const metroContentItems = [
    { title: "5 Reasons to Work Out During Your Commute", platform: "instagram", status: "published" as const, daysOffset: -14, body: "Stop treating your commute as dead time. 🚇 Our transit-hub studios mean you can squeeze in a 45-min HIIT session before you even reach the office.\n\n5 reasons this changes everything 👇\n1. No extra travel time\n2. Morning endorphins hit different\n3. You're already dressed for the day\n4. Beat the gym rush\n5. We have showers\n\n#MetroFitness #CommuteFit #UrbanWorkout" },
    { title: "New Class: Power HIIT — Now at Union Station", platform: "instagram", status: "published" as const, daysOffset: -10, body: "Power HIIT has arrived at Union Station 🔥 Our most intense 45-min class just landed at our busiest location. Limited spots — book via the app before they're gone.\n\n#MetroFitness #PowerHIIT #UnionStation #NewClass" },
    { title: "Client Transformation: Sarah's 90-Day Journey", platform: "facebook", status: "published" as const, daysOffset: -7, body: "Meet Sarah. She started Metro Fitness 90 days ago — 3x/week during her commute. Today she ran her first 10K. 🏅\n\n'I didn't think I had time to get fit. Metro proved me wrong.' — Sarah K.\n\nEvery transformation starts with one class. Book your first free session." },
    { title: "Metro Monthly: October Recap", platform: "linkedin", status: "published" as const, daysOffset: -3, body: "October by the numbers:\n• 12,400 classes completed\n• 3 new locations opened\n• Average class satisfaction: 4.8/5\n• 847 new members\n\nWe're growing fast — and we're just getting started. Looking for enterprise wellness partnerships? Let's talk." },
    { title: "November Challenge: 20 Classes in 30 Days", platform: "instagram", status: "scheduled" as const, daysOffset: 1, body: "The November Challenge is LIVE 🗓️ Complete 20 classes in 30 days and earn a free month of Metro Fitness. Share your check-ins with #MetroNovember for a chance to be featured.\n\nWho's in? Drop a 💪 below." },
    { title: "New Location: King Street Opens Nov 15", platform: "instagram", status: "scheduled" as const, daysOffset: 4, body: "Huge news 🎉 Metro Fitness King Street opens November 15! Early access members get 50% off their first month. Sign up via the link in bio — spots are limited." },
    { title: "Holiday Gift Guide: Give the Gift of Fitness", platform: "facebook", status: "scheduled" as const, daysOffset: 8, body: "Not sure what to get someone who has everything? Give them a Metro Fitness gift membership. Available in 1, 3, and 6-month options. 🎁\n\nPerfect for the health-conscious person in your life. Order before Nov 30 for guaranteed delivery." },
    { title: "The Science Behind HIIT: Why 45 Minutes is Enough", platform: "youtube", status: "scheduled" as const, daysOffset: 12, body: "We've partnered with Dr. Chris West (Sports Medicine, UofT) to explain why Metro's 45-minute HIIT format produces better results than hour-long steady-state cardio.\n\n[Full video in bio]\n\n#ExerciseScience #HIIT #MetroFitness" },
  ];

  for (const item of metroContentItems) {
    const [existing] = await db.select({ id: contentItems.id }).from(contentItems).where(and(eq(contentItems.clientId, metro.id), eq(contentItems.title, item.title))).limit(1);
    if (!existing) {
      const schedDate = item.daysOffset < 0 ? daysAgo(Math.abs(item.daysOffset)) : daysFromNow(item.daysOffset);
      const [ci] = await db.insert(contentItems).values({
        clientId: metro.id,
        orgId: org.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: schedDate,
        publishedAt: item.status === "published" ? schedDate : null,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: item.status === "published" ? ["ai-generated", "client-approved", "published"] : ["ai-generated", "client-approved"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
      console.log(`  ✓ Content item: "${item.title.substring(0, 40)}..." (${item.status})`);
    }
  }

  // Analytics aggregates — 30 days of demo data for Metro
  const metroPlatforms = ["instagram", "facebook", "linkedin", "youtube"];
  for (let i = 1; i <= 30; i++) {
    const date = daysAgo(30 - i);
    const dateStr = date.toISOString().substring(0, 10);
    for (const platform of metroPlatforms) {
      const [existing] = await db.select().from(analyticsAggregates).where(and(eq(analyticsAggregates.clientId, metro.id), eq(analyticsAggregates.date, dateStr), eq(analyticsAggregates.platform, platform))).limit(1);
      if (!existing) {
        const base = platform === "instagram" ? 3200 : platform === "facebook" ? 1800 : platform === "linkedin" ? 900 : 2200;
        const growth = 1 + (i / 30) * 0.25; // 25% growth over 30 days
        const rand = 0.85 + Math.random() * 0.3;
        await db.insert(analyticsAggregates).values({
          clientId: metro.id,
          date: dateStr,
          platform,
          metrics: {
            impressions: Math.round(base * growth * rand),
            reach: Math.round(base * 0.72 * growth * rand),
            engagement: Math.round(base * 0.045 * growth * rand),
            clicks: Math.round(base * 0.022 * growth * rand),
            shares: Math.round(base * 0.008 * growth * rand),
            comments: Math.round(base * 0.012 * growth * rand),
            saves: Math.round(base * 0.015 * growth * rand),
            video_views: platform === "youtube" ? Math.round(base * 0.68 * growth * rand) : 0,
          },
        });
      }
    }
  }
  console.log(`  ✓ Analytics: 30 days × ${metroPlatforms.length} platforms`);

  // Social accounts for Metro
  const metroPlatformList = ["instagram", "facebook", "linkedin", "youtube", "tiktok"];
  for (const platform of metroPlatformList) {
    const [existing] = await db.select().from(socialAccounts).where(and(eq(socialAccounts.clientId, metro.id), eq(socialAccounts.platform, platform))).limit(1);
    if (!existing) {
      await db.insert(socialAccounts).values({ orgId: org.id, clientId: metro.id, platform, accountName: `@metrofitness${platform === "instagram" ? "" : `_${platform}`}`, externalAccountId: `metro-${platform}-demo-id` });
    }
  }
  console.log(`  ✓ Social accounts: ${metroPlatformList.join(", ")}`);

  const metroToken = makeTokenHash(metro.id, "alex@metrofitness.com");
  const [existingMetroToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, metroToken)).limit(1);
  if (!existingMetroToken) {
    await db.insert(portalTokens).values({ clientId: metro.id, tokenHash: metroToken, email: "alex@metrofitness.com", expiresAt: daysFromNow(90) });
  }
  console.log(`  ✓ Portal token: ${metroToken.substring(0, 16)}...`);

  // ─── Summary ──────────────────────────────────────────────────────────────

  const orgSlug = org.clerkOrgId ?? org.id;

  console.log(`
✅ All 3 demo clients seeded successfully!

┌─────────────────────────────────────────────────────────────────────────────┐
│  SUNRISE CAFE (Strategy Pending)                                            │
│  Dashboard:  ${APP_URL}/dashboard/clients/${sunrise.id}
│  Portal:     ${portalUrl(orgSlug, "sunrise-cafe", sunriseToken)}
│  → Client should see: strategy review + approve/request changes buttons
│
│  ACME BAKERY (Content Pending Approval)                                     │
│  Dashboard:  ${APP_URL}/dashboard/clients/${acme.id}
│  Portal:     ${portalUrl(orgSlug, "acme-bakery", acmeToken)}
│  → Client should see: 2 posts pending approval (Instagram + TikTok)
│
│  METRO FITNESS (Active, Full Analytics)                                     │
│  Dashboard:  ${APP_URL}/dashboard/clients/${metro.id}
│  Portal:     ${portalUrl(orgSlug, "metro-fitness", metroToken)}
│  → Client should see: scheduled calendar + analytics dashboard
└─────────────────────────────────────────────────────────────────────────────┘
`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
