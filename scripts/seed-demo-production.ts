#!/usr/bin/env node
/**
 * seed:demo-production
 *
 * Seeds 3 demo clients into the production org org_3E2xnW8XoT1Be86AuqqmL443gQm:
 *   1. Acme Bakery       – fully onboarded: intake submitted, strategy APPROVED, 6 content items, analytics
 *   2. Sunrise Cafe      – intake JUST submitted, strategy PENDING_REVIEW (strategist_pending)
 *   3. Northwind Studio  – intake in DRAFT (50% complete), no strategy, no content
 *
 * Usage:
 *   DATABASE_URL=... PORTAL_SIGNING_SECRET=... npx tsx scripts/seed-demo-production.ts
 *   OR with env file:
 *   dotenv -e apps/web/.env.production -- npx tsx scripts/seed-demo-production.ts
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
} from "@getpostflow/db";
import { getBrandStrategyFixture, generateBrandStrategy, type IntakeData } from "@getpostflow/ai";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load env
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.production") });
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set. Run: dotenv -e apps/web/.env.production -- npx tsx scripts/seed-demo-production.ts");
  process.exit(1);
}

const PORTAL_SECRET = process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://getpostflow.vercel.app";

// Production org Clerk ID
const PROD_ORG_CLERK_ID = "org_3E2xnW8XoT1Be86AuqqmL443gQm";
// Production user
const PROD_USER_CLERK_ID = "user_hello-37355787";
const PROD_USER_EMAIL = "demo@getpostflow.app";

// ─── Intake fixtures ──────────────────────────────────────────────────────────

const ACME_INTAKE: IntakeData = {
  businessName: "Acme Bakery",
  website: "https://acmebakery.com",
  industry: "Food & Beverage",
  targetAudience:
    "Local families and young professionals aged 25–45 in the neighbourhood who value fresh, artisan quality baked goods made with love and local ingredients.",
  brandVoice: { formalCasual: 7, seriousPlayful: 7, conservativeBold: 6 },
  uniqueSellingProps:
    "Sourdough baked with a 100-year-old starter. Zero artificial preservatives. Custom celebration cakes. Open kitchen so customers see everything.",
  productsServices: "Artisan sourdough, pastries, custom cakes, seasonal specials, coffee, wholesale supply.",
  competitors: "Chain bakeries: lack authenticity and warmth. Small local bakeries: limited range.",
  contentGoals: ["Brand awareness", "Community building", "Drive foot traffic"],
  doNotMentionList: "competitor pricing, preservative-free claims without certification",
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", tiktok: "3x per week" },
  existingAssets: { colorHex: "#c2825a", fonts: "Playfair Display (headings), Lato (body)", sampleContentUrls: [] },
};

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
  competitors: "Starbucks (corporate feel), Blue Bottle (premium price point), local diner (dated brand).",
  contentGoals: ["Brand awareness", "Community building", "Drive foot traffic"],
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", tiktok: "Daily" },
  existingAssets: { colorHex: "#F4A832", fonts: "DM Sans (body), Recoleta (headings)", sampleContentUrls: [] },
};

const NORTHWIND_PARTIAL_INTAKE = {
  businessName: "Northwind Studio",
  website: "https://northwindstudio.co",
  industry: "Creative & Design",
  targetAudience: "Small businesses and startups looking for brand identity and design services.",
  // Intentionally incomplete - 50% done
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTokenHash(clientId: string, email: string, suffix = "prod-seed-2026") {
  return crypto
    .createHmac("sha256", PORTAL_SECRET)
    .update(`${clientId}:${email}:${suffix}`)
    .digest("hex");
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
  console.log("🌱 Seeding 3 demo clients into production org...\n");

  // ── 1. Find/create the org ────────────────────────────────────────────────

  let [org] = await db.select().from(orgs).where(eq(orgs.clerkOrgId, PROD_ORG_CLERK_ID)).limit(1);
  if (!org) {
    const [ins] = await db.insert(orgs).values({
      clerkOrgId: PROD_ORG_CLERK_ID,
      name: "GetPostFlow Demo Agency",
      brandColor: "#2F5D62",
    }).returning();
    org = ins;
    console.log(`✓ Created org: ${org.name} (${org.id})`);
  } else {
    console.log(`✓ Org found: ${org.name} (${org.id})`);
  }

  // ── 2. Find/create admin user ─────────────────────────────────────────────

  let [adminUser] = await db.select().from(users).where(eq(users.clerkUserId, PROD_USER_CLERK_ID)).limit(1);
  if (!adminUser) {
    // Try by email
    const byEmail = await db.select().from(users).where(eq(users.email, PROD_USER_EMAIL)).limit(1);
    if (byEmail[0]) {
      adminUser = byEmail[0];
    } else {
      const [ins] = await db.insert(users).values({
        clerkUserId: PROD_USER_CLERK_ID,
        email: PROD_USER_EMAIL,
        fullName: "Demo Strategist",
      }).returning();
      adminUser = ins;
      console.log(`✓ Created admin user (${adminUser.id})`);
    }
  } else {
    console.log(`✓ Admin user found (${adminUser.id})`);
  }

  // Ensure membership
  const [mem] = await db.select().from(orgMemberships)
    .where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.userId, adminUser.id)))
    .limit(1);
  if (!mem) {
    await db.insert(orgMemberships).values({ orgId: org.id, userId: adminUser.id, role: "org_admin" });
    console.log(`✓ Added org_admin membership`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 1: Acme Bakery — fully onboarded
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Acme Bakery (fully onboarded) ──");

  let [acme] = await db.select().from(clients)
    .where(and(eq(clients.orgId, org.id), eq(clients.slug, "acme-bakery")))
    .limit(1);

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
      permissions: {
        brandVoice: {
          tone: "warm, neighborly",
          audience: "local families",
          pillars: ["behind-the-scenes", "recipes", "community"],
          package: "Growth",
          doSay: ["Use warm, welcoming language", "Share behind-the-scenes moments", "Celebrate community milestones"],
          dontSay: ["Use corporate jargon", "Mention competitor pricing", "Make unverified health claims"],
          examplePost: "Every loaf tells a story. 🍞 This week's sourdough was baked with love and our 100-year-old starter. Come in before 10am for first dibs. #AcmeBakery #Sourdough #LocalBakery",
        }
      },
    }).returning();
    acme = ins;
    console.log(`  ✓ Client created (${acme.id})`);
  } else {
    // Update brand voice in permissions
    await db.update(clients).set({
      status: "active",
      permissions: {
        brandVoice: {
          tone: "warm, neighborly",
          audience: "local families",
          pillars: ["behind-the-scenes", "recipes", "community"],
          package: "Growth",
          doSay: ["Use warm, welcoming language", "Share behind-the-scenes moments", "Celebrate community milestones"],
          dontSay: ["Use corporate jargon", "Mention competitor pricing", "Make unverified health claims"],
          examplePost: "Every loaf tells a story. 🍞 This week's sourdough was baked with love and our 100-year-old starter. Come in before 10am for first dibs. #AcmeBakery #Sourdough #LocalBakery",
        }
      },
    }).where(eq(clients.id, acme.id));
    console.log(`  ✓ Client exists, updated brand voice`);
  }

  // Intake
  const [acmeIntake] = await db.select().from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, acme.id)).limit(1);
  if (!acmeIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: acme.id,
      rawPayload: {
        ...ACME_INTAKE,
        package: "Growth",
        postsPerMonth: 12,
        videosPerMonth: 4,
        brandVoiceText: "warm, neighborly",
        targetAudienceText: "local families",
        contentPillars: ["behind-the-scenes", "recipes", "community"],
      } as unknown as Record<string, unknown>,
      isDraft: false,
      submittedAt: daysAgo(14),
    });
    console.log(`  ✓ Intake created (submitted)`);
  }

  // Strategy — APPROVED
  const [acmeStrategy] = await db.select().from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, acme.id)).limit(1);
  if (!acmeStrategy) {
    console.log(`  → Generating Acme strategy with AI...`);
    let draft;
    try {
      draft = await generateBrandStrategy(ACME_INTAKE);
      console.log(`  ✓ AI strategy generated`);
    } catch {
      draft = getBrandStrategyFixture(ACME_INTAKE);
      console.log(`  ✓ Strategy fixture used (AI unavailable)`);
    }
    await db.insert(clientBrandStrategies).values({
      clientId: acme.id,
      versionInt: 1,
      status: "client_approved",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: {
        generatedAt: daysAgo(12).toISOString(),
        package: "Growth",
        intakeSubmittedAt: daysAgo(14).toISOString(),
        model: "gpt-4o",
      },
      strategistComments: [
        {
          id: crypto.randomUUID(),
          authorId: adminUser.id,
          authorName: "Demo Strategist",
          body: "Strategy approved internally. Excellent positioning for a neighbourhood bakery. The 'warm, neighborly' tone is spot-on.",
          createdAt: daysAgo(10).toISOString(),
        },
      ],
      clientComments: [
        {
          id: crypto.randomUUID(),
          authorName: "Jane Acme",
          body: "Love the positioning statement! This really captures what we're about. The tone is exactly right.",
          createdAt: daysAgo(8).toISOString(),
        },
      ],
      approvedAt: daysAgo(8),
    });
    console.log(`  ✓ Strategy created (status: client_approved)`);
  }

  // Content items — 6 items across DRAFT/SCHEDULED/PUBLISHED
  const acmeContent = [
    { title: "Monday Morning Sourdough Drop", platform: "instagram", status: "draft" as const, daysOffset: 0, body: "Your Monday just got better. 🍞 Fresh sourdough from our 100-year-old starter is now ready. Stop by before 10am for first dibs.\n\n#AcmeBakery #SourdoughMonday #ArtisanBread #LocalBakery" },
    { title: "Behind the Scenes: Bread Shaping", platform: "tiktok", status: "scheduled" as const, daysOffset: 3, body: "Ever wonder how our signature loaves get that perfect crust? Here's a peek into our 4am baking ritual. 🌅 The fold. The proof. The score. The magic.\n\n#BakingBehindTheScenes #SourdoughTikTok #ArtisanBread" },
    { title: "Weekend Special: Custom Celebration Cakes", platform: "facebook", status: "scheduled" as const, daysOffset: 5, body: "Planning a celebration? Our custom cakes are made to order with locally sourced ingredients. From birthdays to weddings — every occasion deserves something extraordinary.\n\n🎂 Order by Thursday for weekend pickup." },
    { title: "Pumpkin Spice Season Has Arrived", platform: "instagram", status: "published" as const, daysOffset: -7, body: "Fall is officially here at Acme Bakery 🍂 Introducing our limited-edition pumpkin spice collection: loaves, muffins, and our fan-favourite pumpkin cream cheese danish.\n\nAvailable through October only." },
    { title: "Client Story: Wholesale Partner Spotlight", platform: "linkedin", status: "published" as const, daysOffset: -5, body: "We're proud to supply fresh artisan bread to 8 local cafes across the neighbourhood. Quality partnerships built on trust and shared values." },
    { title: "Recipe: Our Famous 100-Year Sourdough", platform: "instagram", status: "published" as const, daysOffset: -3, body: "You asked, we answered! Here's a simplified version of our famous sourdough recipe. The secret? Time, temperature, and a 100-year-old starter. 🍞\n\n#Recipe #Sourdough #BakingAtHome" },
  ];

  for (const item of acmeContent) {
    const [existing] = await db.select({ id: contentItems.id }).from(contentItems)
      .where(and(eq(contentItems.clientId, acme.id), eq(contentItems.title, item.title)))
      .limit(1);
    if (!existing) {
      const schedDate = item.daysOffset < 0 ? daysAgo(Math.abs(item.daysOffset)) : daysFromNow(item.daysOffset);
      const [ci] = await db.insert(contentItems).values({
        clientId: acme.id,
        orgId: org.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: schedDate,
        publishedAt: item.status === "published" ? schedDate : null,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: item.status === "published" ? ["ai-generated", "published"] : ["ai-generated"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
      console.log(`  ✓ Content: "${item.title.substring(0, 40)}" (${item.status})`);
    }
  }

  // Analytics for published content
  const acmePlatforms = ["instagram", "facebook"];
  for (let i = 1; i <= 14; i++) {
    const date = daysAgo(14 - i);
    const dateStr = date.toISOString().substring(0, 10);
    for (const platform of acmePlatforms) {
      const [existing] = await db.select().from(analyticsAggregates)
        .where(and(eq(analyticsAggregates.clientId, acme.id), eq(analyticsAggregates.date, dateStr), eq(analyticsAggregates.platform, platform)))
        .limit(1);
      if (!existing) {
        const base = platform === "instagram" ? 1800 : 900;
        const growth = 1 + (i / 14) * 0.2;
        const rand = 0.85 + Math.random() * 0.3;
        await db.insert(analyticsAggregates).values({
          clientId: acme.id,
          date: dateStr,
          platform,
          metrics: {
            impressions: Math.round(base * growth * rand),
            reach: Math.round(base * 0.72 * growth * rand),
            engagement: Math.round(base * 0.05 * growth * rand),
            clicks: Math.round(base * 0.02 * growth * rand),
            shares: Math.round(base * 0.008 * growth * rand),
            comments: Math.round(base * 0.012 * growth * rand),
            saves: Math.round(base * 0.018 * growth * rand),
          },
        });
      }
    }
  }
  console.log(`  ✓ Analytics: 14 days × 2 platforms`);

  // Portal token for Acme
  const acmeToken = makeTokenHash(acme.id, "jane@acmebakery.com");
  const [existingAcmeToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, acmeToken)).limit(1);
  if (!existingAcmeToken) {
    await db.insert(portalTokens).values({ clientId: acme.id, tokenHash: acmeToken, email: "jane@acmebakery.com", expiresAt: daysFromNow(90) });
  }
  console.log(`  ✓ Portal token created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 2: Sunrise Cafe — intake submitted, strategy PENDING_REVIEW
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Sunrise Cafe (intake submitted, strategy pending review) ──");

  let [sunrise] = await db.select().from(clients)
    .where(and(eq(clients.orgId, org.id), eq(clients.slug, "sunrise-cafe")))
    .limit(1);

  if (!sunrise) {
    const [ins] = await db.insert(clients).values({
      orgId: org.id,
      name: "Sunrise Cafe",
      slug: "sunrise-cafe",
      status: "strategist_review",
      industry: "Food & Beverage",
      primaryContactName: "Maria Chen",
      primaryContactEmail: "maria@sunrisecafe.com",
      targetLocales: ["en"],
      primaryLocale: "en",
      permissions: {
        brandVoice: {
          tone: "warm, community-focused, approachable",
          audience: "remote workers and young professionals",
          pillars: ["community", "coffee culture", "workspace"],
          package: "Starter",
          doSay: ["Use casual, friendly language", "Highlight community events", "Celebrate regulars"],
          dontSay: ["Use corporate tone", "Mention competitors by name"],
          examplePost: "Your favourite corner just got a little cozier ☕ New autumn menu drops this Friday. Come say hi — first drink on us for loyalty card holders. #SunriseCafe #CoffeeCommunity",
        }
      },
    }).returning();
    sunrise = ins;
    console.log(`  ✓ Client created (${sunrise.id})`);
  } else {
    await db.update(clients).set({
      status: "strategist_review",
      permissions: {
        brandVoice: {
          tone: "warm, community-focused, approachable",
          audience: "remote workers and young professionals",
          pillars: ["community", "coffee culture", "workspace"],
          package: "Starter",
          doSay: ["Use casual, friendly language", "Highlight community events", "Celebrate regulars"],
          dontSay: ["Use corporate tone", "Mention competitors by name"],
          examplePost: "Your favourite corner just got a little cozier ☕ New autumn menu drops this Friday. Come say hi — first drink on us for loyalty card holders. #SunriseCafe #CoffeeCommunity",
        }
      },
    }).where(eq(clients.id, sunrise.id));
    console.log(`  ✓ Client exists, updated`);
  }

  // Intake submitted
  const [sunriseIntake] = await db.select().from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, sunrise.id)).limit(1);
  if (!sunriseIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: sunrise.id,
      rawPayload: {
        ...SUNRISE_INTAKE,
        package: "Starter",
        brandVoiceText: "warm, community-focused, approachable",
        targetAudienceText: "remote workers and young professionals",
        contentPillars: ["community", "coffee culture", "workspace"],
      } as unknown as Record<string, unknown>,
      isDraft: false,
      submittedAt: daysAgo(2),
    });
    console.log(`  ✓ Intake created (submitted 2 days ago)`);
  }

  // Strategy PENDING STRATEGIST REVIEW — AI generated
  const [sunriseStrategy] = await db.select().from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, sunrise.id)).limit(1);
  if (!sunriseStrategy) {
    console.log(`  → Generating Sunrise Cafe strategy with AI...`);
    let draft;
    try {
      draft = await generateBrandStrategy(SUNRISE_INTAKE);
      console.log(`  ✓ AI strategy generated for Sunrise Cafe`);
    } catch {
      draft = getBrandStrategyFixture(SUNRISE_INTAKE);
      console.log(`  ✓ Strategy fixture used (AI unavailable)`);
    }
    await db.insert(clientBrandStrategies).values({
      clientId: sunrise.id,
      versionInt: 1,
      status: "strategist_pending",
      draftPayload: draft as unknown as Record<string, unknown>,
      editedPayload: draft as unknown as Record<string, unknown>,
      aiMetadata: {
        generatedAt: daysAgo(1).toISOString(),
        package: "Starter",
        intakeSubmittedAt: daysAgo(2).toISOString(),
        model: "gpt-4o",
      },
      strategistComments: [],
      clientComments: [],
    });
    console.log(`  ✓ Strategy created (status: strategist_pending) — needs your review!`);
  }

  // Portal token for Sunrise
  const sunriseToken = makeTokenHash(sunrise.id, "maria@sunrisecafe.com");
  const [existingSunriseToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, sunriseToken)).limit(1);
  if (!existingSunriseToken) {
    await db.insert(portalTokens).values({ clientId: sunrise.id, tokenHash: sunriseToken, email: "maria@sunrisecafe.com", expiresAt: daysFromNow(90) });
  }
  console.log(`  ✓ Portal token created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 3: Northwind Studio — intake DRAFT (50% complete)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Northwind Studio (just signed up, intake draft) ──");

  let [northwind] = await db.select().from(clients)
    .where(and(eq(clients.orgId, org.id), eq(clients.slug, "northwind-studio")))
    .limit(1);

  if (!northwind) {
    const [ins] = await db.insert(clients).values({
      orgId: org.id,
      name: "Northwind Studio",
      slug: "northwind-studio",
      status: "intake_pending",
      industry: "Creative & Design",
      primaryContactName: "Sam Northwind",
      primaryContactEmail: "sam@northwindstudio.co",
      targetLocales: ["en"],
      primaryLocale: "en",
      permissions: {
        brandVoice: {
          tone: "professional, creative",
          audience: "small businesses and startups",
          pillars: [],
          package: "Starter",
          doSay: [],
          dontSay: [],
          examplePost: "",
        }
      },
    }).returning();
    northwind = ins;
    console.log(`  ✓ Client created (${northwind.id})`);
  } else {
    await db.update(clients).set({ status: "intake_pending" }).where(eq(clients.id, northwind.id));
    console.log(`  ✓ Client exists, updated status → intake_pending`);
  }

  // Intake DRAFT (50% complete)
  const [northwindIntake] = await db.select().from(clientIntakeSubmissions)
    .where(and(eq(clientIntakeSubmissions.clientId, northwind.id), eq(clientIntakeSubmissions.isDraft, true)))
    .limit(1);
  if (!northwindIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: northwind.id,
      rawPayload: {
        ...NORTHWIND_PARTIAL_INTAKE,
        // Intentionally missing: brand voice sliders, USP, competitors, content goals
        _completionPercent: 50,
        _draftNote: "Client has completed basic info but not yet filled brand voice or goals sections.",
      } as unknown as Record<string, unknown>,
      isDraft: true, // NOT submitted
    });
    console.log(`  ✓ Intake draft created (50% complete, not submitted)`);
  }

  // NO strategy, NO content for Northwind — demonstrates 'just signed up' state

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log(`
✅ Seeded 3 demo clients into org ${PROD_ORG_CLERK_ID}

┌────────────────────────────────────────────────────────────────────────────┐
│  ACME BAKERY (fully onboarded)                                              │
│  Dashboard:  ${APP_URL}/dashboard/clients/${acme.id}                       │
│  → Intake submitted, strategy client_approved, 6 content items + analytics │
│  → Brand voice: warm/neighborly, audience: local families, Growth package  │
│                                                                              │
│  SUNRISE CAFE (intake submitted, strategy pending review)                   │
│  Dashboard:  ${APP_URL}/dashboard/clients/${sunrise.id}                    │
│  → Strategy PENDING STRATEGIST REVIEW → shows in Strategy Reviews tab      │
│                                                                              │
│  NORTHWIND STUDIO (just signed up)                                          │
│  Dashboard:  ${APP_URL}/dashboard/clients/${northwind.id}                  │
│  → Intake 50% draft, no strategy, no content                                │
└────────────────────────────────────────────────────────────────────────────┘

STRATEGY REVIEWS tab should show Sunrise Cafe as "Needs Your Review".
`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
