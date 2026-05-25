#!/usr/bin/env node
/**
 * seed:demo-data
 *
 * Comprehensive demo seed for the GetPostFlow preview deployment.
 * Targets the production org (org_3E2xnW8XoT1Be86AuqqmL443gQm).
 *
 * Creates:
 *  - 4 demo users (2 admins, 1 strategist, 1 content_manager) with fake Clerk IDs
 *  - 3 clients at different lifecycle stages
 *  - 16 content items across platforms and statuses
 *  - 11 conversations + messages + internal notes
 *  - 30 days of analytics aggregates
 *  - 2 brand kits + 5 content templates
 *  - 3 reports + 2 report schedules
 *  - 8 tasks assigned to demo users
 *  - 2 portal tokens
 *
 * Usage:
 *   dotenv -e apps/web/.env.production -- npx tsx scripts/seed-demo-data.ts
 *   OR:
 *   DATABASE_URL=... PORTAL_SIGNING_SECRET=... npx tsx scripts/seed-demo-data.ts
 *
 * Idempotent: safe to run multiple times.
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  users,
  orgMemberships,
  clientAssignments,
  clientIntakeSubmissions,
  clientBrandStrategies,
  contentItems,
  contentVersions,
  conversations,
  messages,
  conversationNotes,
  analyticsAggregates,
  brandKits,
  contentTemplates,
  reports,
  reportSchedules,
  tasks,
  portalTokens,
  socialAccounts,
  assets,
} from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { resolve } from "path";

// ─── Load env ──────────────────────────────────────────────────────────────────
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.production") });
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set.");
  process.exit(1);
}

const PORTAL_SECRET = process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://getpostflow.vercel.app";

// ─── Constants ────────────────────────────────────────────────────────────────
const PROD_ORG_CLERK_ID = "org_3E2xnW8XoT1Be86AuqqmL443gQm";

const DEMO_USERS = [
  { clerkId: "user_demo_admin_1", email: "alex@getpostflow.app", name: "Alex Rivera", fullName: "Alex Rivera", role: "org_admin" as const },
  { clerkId: "user_demo_admin_2", email: "jordan@getpostflow.app", name: "Jordan Kim", fullName: "Jordan Kim", role: "org_admin" as const },
  { clerkId: "user_demo_strategist_1", email: "sam@getpostflow.app", name: "Sam Chen", fullName: "Sam Chen", role: "strategist" as const },
  { clerkId: "user_demo_cm_1", email: "taylor@getpostflow.app", name: "Taylor Brooks", fullName: "Taylor Brooks", role: "content_manager" as const },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number) { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 24 * 60 * 60 * 1000); }
function minsAgo(n: number) { return new Date(Date.now() - n * 60 * 1000); }

function makePortalToken(clientId: string, email: string) {
  return crypto.createHmac("sha256", PORTAL_SECRET).update(`${clientId}:${email}:prod-seed-2026`).digest("hex");
}

// ─── Intake fixtures ──────────────────────────────────────────────────────────
const ACME_INTAKE = {
  businessName: "Acme Bakery",
  website: "https://acmebakery.com",
  industry: "Food & Beverage",
  targetAudience: "Local families and young professionals aged 25–45 who value fresh, artisan quality baked goods.",
  brandVoice: { formalCasual: 7, seriousPlayful: 7, conservativeBold: 6 },
  uniqueSellingProps: "Sourdough baked with a 100-year-old starter. Zero artificial preservatives. Custom celebration cakes.",
  productsServices: "Artisan sourdough, pastries, custom cakes, seasonal specials, coffee, wholesale.",
  competitors: "Chain bakeries lack authenticity. Small local bakeries have limited range.",
  contentGoals: ["Brand awareness", "Community building", "Drive foot traffic"],
  doNotMentionList: "competitor pricing, preservative-free claims without certification",
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", tiktok: "3x per week" },
  existingAssets: { colorHex: "#c2825a", fonts: "Playfair Display (headings), Lato (body)", sampleContentUrls: [] },
  package: "Growth",
  brandVoiceText: "warm, neighborly",
  contentPillars: ["behind-the-scenes", "recipes", "community"],
};

const SUNRISE_INTAKE = {
  businessName: "Sunrise Cafe",
  website: "https://sunrisecafe.com",
  industry: "Food & Beverage",
  targetAudience: "Remote workers, students, and young professionals aged 22–40 who want a welcoming neighbourhood cafe.",
  brandVoice: { formalCasual: 8, seriousPlayful: 7, conservativeBold: 6 },
  uniqueSellingProps: "Single-origin beans. All-day breakfast. Dog-friendly patio.",
  productsServices: "Espresso drinks, pour-over, pastries, sandwiches, loyalty programme.",
  competitors: "Starbucks (corporate), Blue Bottle (premium), local diner (dated brand).",
  contentGoals: ["Brand awareness", "Community building", "Drive foot traffic"],
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", tiktok: "Daily" },
  existingAssets: { colorHex: "#F4A832", fonts: "DM Sans (body), Recoleta (headings)", sampleContentUrls: [] },
  package: "Starter",
  brandVoiceText: "warm, community-focused, approachable",
  contentPillars: ["community", "coffee culture", "workspace"],
};

const ACME_STRATEGY_DRAFT = {
  positioningStatement: "Acme Bakery is the neighbourhood's artisan bakery that connects community through the warmth of scratch-baked goods — where every loaf carries 100 years of tradition.",
  brandEssence: "Rooted warmth",
  brandPersonality: ["Welcoming", "Artisan", "Community-centred", "Authentic"],
  toneOfVoice: "Warm, neighbourly, conversational. Never corporate.",
  targetAudience: "Local families and young professionals aged 25–45 who value quality and authenticity.",
  contentPillars: ["Behind the scenes", "Recipes & education", "Community moments", "Seasonal specials"],
  contentCalendar: {
    instagram: "Daily — alternate between product/BTS/community.",
    facebook: "3x per week — promotions and events.",
    tiktok: "3x per week — baking process Reels."
  },
  competitiveDifferentiation: "100-year-old sourdough starter, open kitchen, no artificial preservatives, custom celebration cakes.",
  kpis: ["Reach", "Engagement rate", "Foot traffic uplift", "Community mentions"],
  version: 1,
};

const SUNRISE_STRATEGY_DRAFT = {
  positioningStatement: "Sunrise Cafe is the remote worker's neighbourhood home — where great coffee, fast wifi, and genuine community make every workday better.",
  brandEssence: "Your daily anchor",
  brandPersonality: ["Approachable", "Energetic", "Community-first", "Authentic"],
  toneOfVoice: "Casual, friendly, upbeat. Celebrate regulars. No corporate speak.",
  targetAudience: "Remote workers, students, and young professionals aged 22–40.",
  contentPillars: ["Community", "Coffee culture", "Workspace vibes", "Seasonal menu"],
  contentCalendar: {
    instagram: "Daily — community stories, coffee art, patio.",
    facebook: "3x per week — events and loyalty offers.",
    tiktok: "Daily — barista tips, behind the scenes."
  },
  competitiveDifferentiation: "Single-origin beans, dog-friendly patio, 300 Mbps wifi, loyalty programme.",
  kpis: ["Reach", "Foot traffic", "Loyalty sign-ups", "Community mentions"],
  version: 1,
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const db = createDb(DATABASE_URL!);
  console.log("🌱 GetPostFlow comprehensive demo seed starting...\n");

  // ── Org ────────────────────────────────────────────────────────────────────
  let [org] = await db.select().from(orgs).where(eq(orgs.clerkOrgId, PROD_ORG_CLERK_ID)).limit(1);
  if (!org) {
    [org] = await db.insert(orgs).values({ clerkOrgId: PROD_ORG_CLERK_ID, name: "GetPostFlow Demo Agency", brandColor: "#2F5D62" }).returning();
    console.log(`✓ Org created: ${org!.name}`);
  } else {
    console.log(`✓ Org found: ${org.name} (${org.id})`);
  }

  // ── Demo Users ────────────────────────────────────────────────────────────
  const userIdMap: Record<string, string> = {};

  for (const u of DEMO_USERS) {
    let [existing] = await db.select().from(users).where(eq(users.clerkUserId, u.clerkId)).limit(1);
    if (!existing) {
      const byEmail = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
      if (byEmail[0]) {
        existing = byEmail[0];
      } else {
        [existing] = await db.insert(users).values({ clerkUserId: u.clerkId, email: u.email, name: u.name, fullName: u.fullName }).returning();
        console.log(`  ✓ User created: ${u.name}`);
      }
    }
    userIdMap[u.clerkId] = existing!.id;

    // Ensure membership
    const [mem] = await db.select().from(orgMemberships)
      .where(and(eq(orgMemberships.orgId, org!.id), eq(orgMemberships.userId, existing!.id))).limit(1);
    if (!mem) {
      await db.insert(orgMemberships).values({ orgId: org!.id, userId: existing!.id, role: u.role });
    }
  }

  const alexId = userIdMap["user_demo_admin_1"]!;
  const jordanId = userIdMap["user_demo_admin_2"]!;
  const samId = userIdMap["user_demo_strategist_1"]!;
  const taylorId = userIdMap["user_demo_cm_1"]!;

  console.log(`✓ 4 demo users ready\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 1: Acme Bakery — fully active
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("── Acme Bakery (active) ──");

  let [acme] = await db.select().from(clients).where(and(eq(clients.orgId, org!.id), eq(clients.slug, "acme-bakery"))).limit(1);
  if (!acme) {
    [acme] = await db.insert(clients).values({
      orgId: org!.id,
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
          dontSay: ["Use corporate jargon", "Mention competitor pricing"],
          examplePost: "Every loaf tells a story. 🍞 Fresh sourdough from our 100-year-old starter is now ready. Come in before 10am for first dibs. #AcmeBakery #Sourdough",
        }
      },
    }).returning();
    console.log(`  ✓ Client created (${acme!.id})`);
  } else {
    console.log(`  ✓ Client exists (${acme.id})`);
  }

  // Client assignments for Acme
  for (const { userId, role } of [
    { userId: samId, role: "strategist" as const },
    { userId: taylorId, role: "content_manager" as const },
  ]) {
    const [ex] = await db.select().from(clientAssignments)
      .where(and(eq(clientAssignments.clientId, acme!.id), eq(clientAssignments.userId, userId))).limit(1);
    if (!ex) await db.insert(clientAssignments).values({ orgId: org!.id, clientId: acme!.id, userId, role });
  }

  // Intake
  const [acmeIntake] = await db.select().from(clientIntakeSubmissions).where(eq(clientIntakeSubmissions.clientId, acme!.id)).limit(1);
  if (!acmeIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: acme!.id,
      rawPayload: ACME_INTAKE as unknown as Record<string, unknown>,
      isDraft: false,
      submittedAt: daysAgo(14),
    });
    console.log(`  ✓ Intake created`);
  }

  // Strategy — client_approved
  const [acmeStrategy] = await db.select().from(clientBrandStrategies).where(eq(clientBrandStrategies.clientId, acme!.id)).limit(1);
  if (!acmeStrategy) {
    await db.insert(clientBrandStrategies).values({
      clientId: acme!.id,
      orgId: org!.id,
      versionInt: 1,
      status: "client_approved",
      draftPayload: ACME_STRATEGY_DRAFT as unknown as Record<string, unknown>,
      editedPayload: ACME_STRATEGY_DRAFT as unknown as Record<string, unknown>,
      aiMetadata: { generatedAt: daysAgo(12).toISOString(), model: "gpt-4o" },
      strategistComments: [{
        id: crypto.randomUUID(),
        authorId: samId,
        authorName: "Sam Chen",
        body: "Strategy approved internally. Excellent positioning for a neighbourhood bakery.",
        createdAt: daysAgo(10).toISOString(),
      }],
      clientComments: [{
        id: crypto.randomUUID(),
        authorName: "Jane Acme",
        body: "Love the positioning statement! This really captures what we're about.",
        createdAt: daysAgo(8).toISOString(),
      }],
      approvedAt: daysAgo(8),
    });
    console.log(`  ✓ Strategy created (client_approved)`);
  }

  // Brand Kit — Acme
  const [acmeBrandKit] = await db.select().from(brandKits).where(eq(brandKits.clientId, acme!.id)).limit(1);
  if (!acmeBrandKit) {
    await db.insert(brandKits).values({
      clientId: acme!.id,
      logos: { png: "https://picsum.photos/seed/acme-logo/200/200", svg: "" },
      colors: { primary: "#c2825a", secondary: "#f5e6d8", accent: "#2F5D62" },
      typography: { headingFont: "Playfair Display", bodyFont: "Lato" },
      styleGuide: "Use warm, earthy tones. Photography should feel natural and inviting. Avoid stark white backgrounds — prefer off-white or warm neutrals.",
      voiceTone: "Warm, neighbourly, conversational. Write like a friend sharing a recommendation, not a brand. Use short sentences. Include seasonal references.",
      dosAndDonts: {
        dos: ["Use warm, welcoming language", "Share behind-the-scenes moments", "Celebrate community milestones", "Reference local landmarks"],
        donts: ["Use corporate jargon", "Mention competitor pricing", "Make unverified health claims", "Post without relevant hashtags"]
      },
    });
    console.log(`  ✓ Brand Kit created`);
  }

  // Content Templates — Acme
  const acmeTemplates = [
    { title: "Product Spotlight Post", contentType: "post", body: "Introducing our latest {{product_name}}! 🍞 Made with {{key_ingredient}}, this is the perfect {{occasion}}. Available now in-store. #AcmeBakery #{{hashtag}}", tags: ["product", "spotlight"] },
    { title: "Behind The Scenes Reel", contentType: "reel", body: "Ever wondered how we make our {{product_name}}? Join us behind the counter as our team {{baking_action}} from {{start_time}} every morning. #BakingBehindTheScenes #AcmeBakery", tags: ["bts", "reel"] },
    { title: "Community Event Post", contentType: "post", body: "We're excited to announce {{event_name}} at Acme Bakery! Join us on {{date}} at {{time}}. {{event_details}}. Tag a friend you'd like to bring! 🥐 #AcmeBakery #Community", tags: ["community", "event"] },
  ];

  for (const tpl of acmeTemplates) {
    const [ex] = await db.select().from(contentTemplates)
      .where(and(eq(contentTemplates.clientId, acme!.id), eq(contentTemplates.title, tpl.title))).limit(1);
    if (!ex) {
      await db.insert(contentTemplates).values({
        clientId: acme!.id,
        orgId: org!.id,
        title: tpl.title,
        contentType: tpl.contentType,
        body: tpl.body,
        tags: tpl.tags,
        variables: (tpl.body.match(/\{\{(\w+)\}\}/g) ?? []).map((m: string) => m.replace(/[{}]/g, "")),
      });
    }
  }
  console.log(`  ✓ 3 content templates created`);

  // Content items — Acme (8 items)
  const acmeContentItems = [
    { title: "Monday Morning Sourdough Drop", platform: "instagram", status: "draft" as const, daysOffset: 0, body: "Your Monday just got better. 🍞 Fresh sourdough from our 100-year-old starter is now ready. Stop by before 10am for first dibs.\n\n#AcmeBakery #SourdoughMonday #ArtisanBread" },
    { title: "Behind the Scenes: Bread Shaping", platform: "tiktok", status: "pending_review" as const, daysOffset: 3, body: "Ever wonder how our signature loaves get that perfect crust? Here's a peek into our 4am baking ritual. 🌅\n\n#BakingBehindTheScenes #SourdoughTikTok #ArtisanBread" },
    { title: "Weekend Special: Custom Celebration Cakes", platform: "facebook", status: "approved" as const, daysOffset: 5, body: "Planning a celebration? Our custom cakes are made to order with locally sourced ingredients.\n\n🎂 Order by Thursday for weekend pickup." },
    { title: "Fall Pumpkin Collection Launch", platform: "instagram", status: "scheduled" as const, daysOffset: 7, body: "Fall is officially here at Acme Bakery 🍂 Introducing our limited-edition pumpkin collection. Available through October only." },
    { title: "Pumpkin Spice Season Has Arrived", platform: "instagram", status: "published" as const, daysOffset: -7, body: "Fall is officially here at Acme Bakery 🍂 Introducing pumpkin spice loaves, muffins, and our fan-favourite pumpkin cream cheese danish.\n\nAvailable through October only." },
    { title: "Wholesale Partner Spotlight", platform: "linkedin", status: "published" as const, daysOffset: -5, body: "We're proud to supply fresh artisan bread to 8 local cafes across the neighbourhood. Quality partnerships built on trust and shared values." },
    { title: "Recipe: Our Famous 100-Year Sourdough", platform: "instagram", status: "published" as const, daysOffset: -3, body: "You asked, we answered! Here's a simplified version of our famous sourdough recipe. The secret? Time, temperature, and a 100-year-old starter. 🍞\n\n#Recipe #Sourdough #BakingAtHome" },
    { title: "November Community Bake-Off", platform: "facebook", status: "draft" as const, daysOffset: 0, body: "Join us for our first community bake-off event! Enter your best sourdough recipe and win a year's supply of our starter culture. 🏆" },
  ];

  for (const item of acmeContentItems) {
    const [ex] = await db.select({ id: contentItems.id }).from(contentItems)
      .where(and(eq(contentItems.clientId, acme!.id), eq(contentItems.title, item.title))).limit(1);
    if (!ex) {
      const schedDate = item.daysOffset < 0 ? daysAgo(Math.abs(item.daysOffset)) : daysFromNow(item.daysOffset);
      const [ci] = await db.insert(contentItems).values({
        clientId: acme!.id,
        orgId: org!.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: schedDate,
        publishedAt: item.status === "published" ? schedDate : null,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: item.status === "published" ? ["published"] : ["ai-generated"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci!.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
    }
  }
  console.log(`  ✓ 8 content items created`);

  // Analytics — 30 days, 3 platforms
  for (let i = 1; i <= 30; i++) {
    const date = daysAgo(30 - i);
    const dateStr = date.toISOString().substring(0, 10);
    for (const platform of ["instagram", "facebook", "tiktok"]) {
      const [ex] = await db.select({ id: analyticsAggregates.id }).from(analyticsAggregates)
        .where(and(eq(analyticsAggregates.clientId, acme!.id), eq(analyticsAggregates.date, dateStr), eq(analyticsAggregates.platform, platform))).limit(1);
      if (!ex) {
        const base = platform === "instagram" ? 2000 : platform === "tiktok" ? 1500 : 900;
        const growth = 1 + (i / 30) * 0.3;
        const rand = 0.8 + Math.random() * 0.4;
        await db.insert(analyticsAggregates).values({
          clientId: acme!.id,
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
  console.log(`  ✓ Analytics: 30 days × 3 platforms`);

  // Reports — Acme
  const acmeReports = [
    { periodStart: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-01`; })(), periodEnd: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${new Date(d.getFullYear(), d.getMonth(), 0).getDate()}`; })(), status: "sent" as const, sentAt: daysAgo(5) },
    { periodStart: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() - 1 > 0 ? d.getMonth() - 1 : 12).padStart(2, "0")}-01`; })(), periodEnd: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() - 1 > 0 ? d.getMonth() - 1 : 12).padStart(2, "0")}-28`; })(), status: "sent" as const, sentAt: daysAgo(35) },
  ];
  for (const r of acmeReports) {
    const [ex] = await db.select({ id: reports.id }).from(reports)
      .where(and(eq(reports.clientId, acme!.id), eq(reports.periodStart, r.periodStart))).limit(1);
    if (!ex) {
      await db.insert(reports).values({
        clientId: acme!.id,
        orgId: org!.id,
        type: "monthly",
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        status: r.status,
        sentAt: r.sentAt,
        summaryPayload: {},
      });
    }
  }

  // Report schedule — Acme
  const [acmeSched] = await db.select({ id: reportSchedules.id }).from(reportSchedules).where(eq(reportSchedules.clientId, acme!.id)).limit(1);
  if (!acmeSched) {
    await db.insert(reportSchedules).values({
      clientId: acme!.id,
      orgId: org!.id,
      frequency: "monthly",
      dayValue: 28,
      recipientEmails: ["jane@acmebakery.com"],
      isActive: true,
    });
  }
  console.log(`  ✓ 2 reports + schedule created`);

  // Social account stub — Acme
  const [acmeSocial] = await db.select({ id: socialAccounts.id }).from(socialAccounts)
    .where(and(eq(socialAccounts.clientId, acme!.id), eq(socialAccounts.platform, "instagram_business"))).limit(1);
  if (!acmeSocial) {
    await db.insert(socialAccounts).values({
      orgId: org!.id,
      clientId: acme!.id,
      platform: "instagram_business",
      accountName: "@acmebakery",
      externalAccountId: "ig_acme_stub_001",
      isActive: true,
    });
  }

  // Assets — Acme
  const acmeAssets = [
    { storageKey: "acme/hero-sourdough.jpg", publicUrl: "https://picsum.photos/seed/acme1/800/800", filename: "hero-sourdough.jpg", kind: "brand_photo", aiTags: ["sourdough", "bread"], tags: ["hero"] },
    { storageKey: "acme/logo-primary.png", publicUrl: "https://picsum.photos/seed/acme3/400/400", filename: "logo-primary.png", kind: "logo", aiTags: ["logo"], tags: ["brand-asset"] },
  ];
  for (const a of acmeAssets) {
    const [ex] = await db.select({ id: assets.id }).from(assets)
      .where(and(eq(assets.clientId, acme!.id), eq(assets.storageKey, a.storageKey))).limit(1);
    if (!ex) {
      await db.insert(assets).values({
        orgId: org!.id,
        clientId: acme!.id,
        type: "image",
        kind: a.kind,
        filename: a.filename,
        mimeType: "image/jpeg",
        sizeBytes: 800000,
        storageKey: a.storageKey,
        publicUrl: a.publicUrl,
        aiTags: a.aiTags,
        tags: a.tags,
        dimensions: { width: 800, height: 800 },
        metadata: {},
      });
    }
  }

  // Portal token — Acme
  const acmeTokenHash = makePortalToken(acme!.id, "jane@acmebakery.com");
  const [exAcmeToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, acmeTokenHash)).limit(1);
  if (!exAcmeToken) {
    await db.insert(portalTokens).values({ clientId: acme!.id, tokenHash: acmeTokenHash, email: "jane@acmebakery.com", expiresAt: daysFromNow(90) });
  }

  // Conversations — Acme (8 total)
  type ConvSeed = {
    platformConversationId: string;
    platform: string;
    participantHandle: string;
    status: "open" | "pending" | "resolved" | "spam";
    priority: "low" | "normal" | "high" | "urgent";
    sentimentSummary: "positive" | "neutral" | "negative" | "urgent";
    lastMessageAt: Date;
    messages: Array<{
      direction: "inbound" | "outbound";
      content: string;
      senderHandle: string;
      sentiment: "positive" | "neutral" | "negative" | "urgent";
      status: "unread" | "read" | "replied" | "escalated";
      createdAt: Date;
      note?: string;
    }>;
  };

  const acmeConvs: ConvSeed[] = [
    {
      platformConversationId: "ig_conv_acme_001",
      platform: "instagram", participantHandle: "@bread_lover_local",
      status: "open", priority: "high", sentimentSummary: "positive", lastMessageAt: minsAgo(15),
      messages: [
        { direction: "inbound", content: "Hi! Do you do custom orders for wedding cakes? We're getting married in June!", senderHandle: "@bread_lover_local", sentiment: "positive", status: "unread", createdAt: minsAgo(16) },
        { direction: "inbound", content: "We'd need a 3-tier cake for around 80 guests, gluten-free options if possible!", senderHandle: "@bread_lover_local", sentiment: "positive", status: "unread", createdAt: minsAgo(15), note: "High-value lead — wedding cake inquiry. Follow up with pricing sheet." },
      ],
    },
    {
      platformConversationId: "ig_conv_acme_002",
      platform: "instagram", participantHandle: "@healthyeats_mama",
      status: "open", priority: "normal", sentimentSummary: "positive", lastMessageAt: minsAgo(55),
      messages: [
        { direction: "inbound", content: "What time do you open on Sundays? Your sourdough loaves are the BEST 🙌", senderHandle: "@healthyeats_mama", sentiment: "positive", status: "unread", createdAt: minsAgo(62) },
        { direction: "outbound", content: "Hi! We open at 7am on Sundays and the sourdough is usually ready by 8am. Thank you for the love! ❤️", senderHandle: "acmebakery", sentiment: "positive", status: "replied", createdAt: minsAgo(60) },
        { direction: "inbound", content: "Perfect! I'll be there 🎉", senderHandle: "@healthyeats_mama", sentiment: "positive", status: "read", createdAt: minsAgo(55) },
      ],
    },
    {
      platformConversationId: "tt_conv_acme_001",
      platform: "tiktok", participantHandle: "@tiktokfoodie99",
      status: "open", priority: "normal", sentimentSummary: "positive", lastMessageAt: minsAgo(180),
      messages: [
        { direction: "inbound", content: "Just saw your sourdough video omg!! Do you ship nationwide?", senderHandle: "@tiktokfoodie99", sentiment: "positive", status: "unread", createdAt: minsAgo(185) },
        { direction: "outbound", content: "We love the support! Unfortunately we're local-only right now, but we do offer wholesale to nearby cafes.", senderHandle: "acmebakery", sentiment: "positive", status: "replied", createdAt: minsAgo(180) },
      ],
    },
    {
      platformConversationId: "ig_conv_acme_003",
      platform: "instagram", participantHandle: "@corporate_catering_co",
      status: "pending", priority: "high", sentimentSummary: "neutral", lastMessageAt: daysAgo(1),
      messages: [
        { direction: "inbound", content: "Good morning! We run a corporate catering service and are looking for a regular bread supplier for our events. Could we discuss bulk pricing?", senderHandle: "@corporate_catering_co", sentiment: "neutral", status: "read", createdAt: daysAgo(1), note: "Potential B2B wholesale deal. Need to loop in management before responding." },
      ],
    },
    {
      platformConversationId: "fb_conv_acme_001",
      platform: "facebook", participantHandle: "Sarah Mitchell",
      status: "resolved", priority: "normal", sentimentSummary: "negative", lastMessageAt: daysAgo(3),
      messages: [
        { direction: "inbound", content: "Hi, I ordered a custom birthday cake last week and it wasn't quite what I expected. The frosting color was different from what we discussed.", senderHandle: "Sarah Mitchell", sentiment: "negative", status: "read", createdAt: daysAgo(3) },
        { direction: "outbound", content: "Hi Sarah, I'm so sorry about that! Could we offer you a complimentary replacement or a 50% refund? Please let us know what works best.", senderHandle: "acmebakery", sentiment: "neutral", status: "replied", createdAt: daysAgo(3) },
        { direction: "inbound", content: "The 50% refund would be great. Thank you for responding so quickly!", senderHandle: "Sarah Mitchell", sentiment: "positive", status: "read", createdAt: daysAgo(2) },
      ],
    },
    {
      platformConversationId: "fb_conv_acme_002",
      platform: "facebook", participantHandle: "Mike Torres",
      status: "open", priority: "urgent", sentimentSummary: "negative", lastMessageAt: minsAgo(20),
      messages: [
        { direction: "inbound", content: "URGENT: My order was wrong and nobody has responded to my emails for 14 hours.", senderHandle: "Mike Torres", sentiment: "negative", status: "unread", createdAt: minsAgo(20), note: "Escalated — urgent response required within 2 hours." },
      ],
    },
    {
      platformConversationId: "li_conv_acme_001",
      platform: "linkedin", participantHandle: "Rebecca Huang",
      status: "open", priority: "normal", sentimentSummary: "positive", lastMessageAt: daysAgo(2),
      messages: [
        { direction: "inbound", content: "Hi! I'm a food blogger with 50k followers. I'd love to feature Acme Bakery in my next piece on artisan bakers. Would you be open to a partnership?", senderHandle: "Rebecca Huang", sentiment: "positive", status: "unread", createdAt: daysAgo(2) },
      ],
    },
    {
      platformConversationId: "ig_conv_acme_004",
      platform: "instagram", participantHandle: "@gluten_free_adventures",
      status: "open", priority: "normal", sentimentSummary: "neutral", lastMessageAt: daysAgo(1),
      messages: [
        { direction: "inbound", content: "Are any of your pastries truly gluten free (not just gluten-friendly)? Asking for a friend with celiac.", senderHandle: "@gluten_free_adventures", sentiment: "neutral", status: "unread", createdAt: daysAgo(1) },
      ],
    },
  ];

  for (const conv of acmeConvs) {
    const [exConv] = await db.select({ id: conversations.id }).from(conversations)
      .where(and(eq(conversations.clientId, acme!.id), eq(conversations.platformConversationId, conv.platformConversationId))).limit(1);
    let convId: string;
    if (!exConv) {
      const [ins] = await db.insert(conversations).values({
        clientId: acme!.id,
        platform: conv.platform,
        platformConversationId: conv.platformConversationId,
        participantHandle: conv.participantHandle,
        status: conv.status,
        priority: conv.priority,
        sentimentSummary: conv.sentimentSummary,
        lastMessageAt: conv.lastMessageAt,
        detectedLocale: "en",
      }).returning();
      convId = ins!.id;
      console.log(`  ✓ Conversation: ${conv.participantHandle}`);
    } else {
      convId = exConv.id;
    }

    for (const msg of conv.messages) {
      const [exMsg] = await db.select({ id: messages.id }).from(messages)
        .where(and(eq(messages.conversationId, convId), eq(messages.content, msg.content))).limit(1);
      if (!exMsg) {
        await db.insert(messages).values({
          conversationId: convId,
          direction: msg.direction,
          content: msg.content,
          senderHandle: msg.senderHandle,
          sentiment: msg.sentiment,
          status: msg.status,
          detectedLocale: "en",
          aiSuggestedReply: msg.direction === "inbound" ? "Thank you for reaching out! We'll get back to you shortly." : null,
          aiConfidence: msg.direction === "inbound" ? 82 : null,
          createdAt: msg.createdAt,
        });

        // Add internal note if present
        if (msg.note && msg.direction === "inbound") {
          await db.insert(conversationNotes).values({
            conversationId: convId,
            userId: samId,
            content: msg.note,
          });
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 2: Sunrise Cafe — strategist review
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Sunrise Cafe (strategist_review) ──");

  let [sunrise] = await db.select().from(clients).where(and(eq(clients.orgId, org!.id), eq(clients.slug, "sunrise-cafe"))).limit(1);
  if (!sunrise) {
    [sunrise] = await db.insert(clients).values({
      orgId: org!.id,
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
          doSay: ["Use casual, friendly language", "Highlight community events"],
          dontSay: ["Use corporate tone", "Mention competitors by name"],
          examplePost: "Your favourite corner just got a little cozier ☕ New autumn menu drops this Friday. #SunriseCafe",
        }
      },
    }).returning();
    console.log(`  ✓ Client created`);
  } else {
    console.log(`  ✓ Client exists`);
  }

  // Assignments — Sunrise
  const [exSunriseAssign] = await db.select().from(clientAssignments)
    .where(and(eq(clientAssignments.clientId, sunrise!.id), eq(clientAssignments.userId, samId))).limit(1);
  if (!exSunriseAssign) {
    await db.insert(clientAssignments).values({ orgId: org!.id, clientId: sunrise!.id, userId: samId, role: "strategist" });
  }

  // Intake — Sunrise
  const [sunriseIntake] = await db.select().from(clientIntakeSubmissions).where(eq(clientIntakeSubmissions.clientId, sunrise!.id)).limit(1);
  if (!sunriseIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: sunrise!.id,
      rawPayload: SUNRISE_INTAKE as unknown as Record<string, unknown>,
      isDraft: false,
      submittedAt: daysAgo(2),
    });
    console.log(`  ✓ Intake created`);
  }

  // Strategy — strategist_pending
  const [sunriseStrategy] = await db.select().from(clientBrandStrategies).where(eq(clientBrandStrategies.clientId, sunrise!.id)).limit(1);
  if (!sunriseStrategy) {
    await db.insert(clientBrandStrategies).values({
      clientId: sunrise!.id,
      orgId: org!.id,
      versionInt: 1,
      status: "strategist_pending",
      draftPayload: SUNRISE_STRATEGY_DRAFT as unknown as Record<string, unknown>,
      editedPayload: SUNRISE_STRATEGY_DRAFT as unknown as Record<string, unknown>,
      aiMetadata: { generatedAt: daysAgo(1).toISOString(), model: "gpt-4o" },
      strategistComments: [],
      clientComments: [],
    });
    console.log(`  ✓ Strategy created (strategist_pending — needs your review!)`);
  }

  // Brand Kit — Sunrise
  const [sunriseBrandKit] = await db.select().from(brandKits).where(eq(brandKits.clientId, sunrise!.id)).limit(1);
  if (!sunriseBrandKit) {
    await db.insert(brandKits).values({
      clientId: sunrise!.id,
      logos: { png: "https://picsum.photos/seed/sunrise-logo/200/200", svg: "" },
      colors: { primary: "#F4A832", secondary: "#fff8ee", accent: "#2F5D62" },
      typography: { headingFont: "Recoleta", bodyFont: "DM Sans" },
      styleGuide: "Warm golden tones with pops of deep green. Photography should feel bright, natural light. Morning aesthetic.",
      voiceTone: "Casual, friendly, community-first. Celebrate regulars. Short punchy sentences.",
      dosAndDonts: {
        dos: ["Celebrate regulars by name", "Highlight seasonal menu changes", "Post behind-the-scenes barista content"],
        donts: ["Use corporate tone", "Mention competitors", "Post low-quality images"]
      },
    });
    console.log(`  ✓ Brand Kit created`);
  }

  // Content Templates — Sunrise
  const sunriseTemplates = [
    { title: "Morning Coffee Post", contentType: "post", body: "Good morning, {{neighbourhood}}! ☕ Start your day right with our {{drink_name}}. Made with {{origin}} beans, available all day. First {{count}} orders get a free {{bonus}}.\n\n#SunriseCafe #{{hashtag}}", tags: ["morning", "product"] },
    { title: "Event Announcement", contentType: "post", body: "Join us for {{event_name}}! 📅 {{date}} · {{time}}\n\n{{event_description}}\n\nSpots are limited — DM us to reserve yours! #SunriseCafe #{{event_tag}}", tags: ["event", "community"] },
  ];

  for (const tpl of sunriseTemplates) {
    const [ex] = await db.select().from(contentTemplates)
      .where(and(eq(contentTemplates.clientId, sunrise!.id), eq(contentTemplates.title, tpl.title))).limit(1);
    if (!ex) {
      await db.insert(contentTemplates).values({
        clientId: sunrise!.id,
        orgId: org!.id,
        title: tpl.title,
        contentType: tpl.contentType,
        body: tpl.body,
        tags: tpl.tags,
        variables: (tpl.body.match(/\{\{(\w+)\}\}/g) ?? []).map((m: string) => m.replace(/[{}]/g, "")),
      });
    }
  }
  console.log(`  ✓ 2 content templates created`);

  // Content — Sunrise (6 items)
  const sunriseContentItems = [
    { title: "Morning Ritual: The Perfect Pour-Over", platform: "instagram", status: "draft" as const, daysOffset: 0, body: "There's something meditative about a perfect pour-over. 🍵 Starting your day with intention — one careful pour at a time.\n\n#SunriseCafe #PourOver #CoffeeCulture" },
    { title: "Community Corner: Meet Our Regulars", platform: "instagram", status: "draft" as const, daysOffset: 2, body: "Every great cafe is really just a great community. 🤗 Meet Sarah — she's been working from that corner table every Tuesday for 3 years.\n\n#SunriseCafe #Community" },
    { title: "New Fall Menu Launch", platform: "facebook", status: "scheduled" as const, daysOffset: 4, body: "🍂 Fall menu is HERE! Salted Caramel Latte, Pumpkin Cold Brew, Maple Cinnamon Flat White. All made with organic ingredients. Available October 1.\n\n#FallMenu #SunriseCafe" },
    { title: "Barista Tip: Get More from Your Espresso", platform: "tiktok", status: "scheduled" as const, daysOffset: 6, body: "Your espresso shot is speaking to you — are you listening? 👂 Runs fast: grind finer. Too slow: grind coarser. Sweet spot is 25-30 seconds for a double shot.\n\n#CoffeeTips #BaristaLife" },
    { title: "Dog-Friendly Patio is Back for Fall", platform: "instagram", status: "draft" as const, daysOffset: 0, body: "Your furry friend is officially invited! 🐾 Our heated patio re-opens this weekend — blankets, dog water bowls, and puppy treats included.\n\n#DogFriendly #SunriseCafe" },
    { title: "Weekly Loyalty Rewards: Here's How It Works", platform: "linkedin", status: "draft" as const, daysOffset: 0, body: "Building community loyalty is about more than just a stamp card. At Sunrise Cafe, our loyalty program gives back in 3 ways: free drink after 10 visits, birthday month upgrade, and early access to seasonal menus." },
  ];

  for (const item of sunriseContentItems) {
    const [ex] = await db.select({ id: contentItems.id }).from(contentItems)
      .where(and(eq(contentItems.clientId, sunrise!.id), eq(contentItems.title, item.title))).limit(1);
    if (!ex) {
      const schedDate = item.daysOffset > 0 ? daysFromNow(item.daysOffset) : new Date();
      const [ci] = await db.insert(contentItems).values({
        clientId: sunrise!.id,
        orgId: org!.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: schedDate,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: ["ai-generated"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci!.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
    }
  }
  console.log(`  ✓ 6 content items created`);

  // Analytics — Sunrise 14 days
  for (let i = 1; i <= 14; i++) {
    const dateStr = daysAgo(14 - i).toISOString().substring(0, 10);
    for (const platform of ["instagram", "facebook"]) {
      const [ex] = await db.select({ id: analyticsAggregates.id }).from(analyticsAggregates)
        .where(and(eq(analyticsAggregates.clientId, sunrise!.id), eq(analyticsAggregates.date, dateStr), eq(analyticsAggregates.platform, platform))).limit(1);
      if (!ex) {
        const base = platform === "instagram" ? 1200 : 600;
        const growth = 1 + (i / 14) * 0.15;
        const rand = 0.85 + Math.random() * 0.3;
        await db.insert(analyticsAggregates).values({
          clientId: sunrise!.id,
          date: dateStr,
          platform,
          metrics: {
            impressions: Math.round(base * growth * rand),
            reach: Math.round(base * 0.72 * growth * rand),
            engagement: Math.round(base * 0.045 * growth * rand),
            clicks: Math.round(base * 0.018 * growth * rand),
            shares: Math.round(base * 0.006 * growth * rand),
            comments: Math.round(base * 0.009 * growth * rand),
            saves: Math.round(base * 0.015 * growth * rand),
          },
        });
      }
    }
  }
  console.log(`  ✓ Analytics: 14 days × 2 platforms`);

  // Report — Sunrise
  const [sunriseReportEx] = await db.select({ id: reports.id }).from(reports).where(eq(reports.clientId, sunrise!.id)).limit(1);
  if (!sunriseReportEx) {
    const now = new Date();
    await db.insert(reports).values({
      clientId: sunrise!.id,
      orgId: org!.id,
      type: "monthly",
      periodStart: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}-01`,
      periodEnd: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}-28`,
      status: "ready",
      summaryPayload: {},
    });
  }

  // Report schedule — Sunrise
  const [sunriseSched] = await db.select({ id: reportSchedules.id }).from(reportSchedules).where(eq(reportSchedules.clientId, sunrise!.id)).limit(1);
  if (!sunriseSched) {
    await db.insert(reportSchedules).values({
      clientId: sunrise!.id,
      orgId: org!.id,
      frequency: "monthly",
      dayValue: 28,
      recipientEmails: ["maria@sunrisecafe.com"],
      isActive: true,
    });
  }
  console.log(`  ✓ 1 report + schedule created`);

  // Conversations — Sunrise (3)
  const sunriseConvs: ConvSeed[] = [
    {
      platformConversationId: "ig_conv_sunrise_001",
      platform: "instagram", participantHandle: "@coffee_curious",
      status: "open", priority: "normal", sentimentSummary: "positive", lastMessageAt: minsAgo(45),
      messages: [
        { direction: "inbound", content: "Are you open on Christmas Day? We'd love to grab coffee before family dinner!", senderHandle: "@coffee_curious", sentiment: "positive", status: "unread", createdAt: minsAgo(47) },
      ],
    },
    {
      platformConversationId: "ig_conv_sunrise_002",
      platform: "instagram", participantHandle: "@remote_worker_vibes",
      status: "open", priority: "low", sentimentSummary: "positive", lastMessageAt: daysAgo(2),
      messages: [
        { direction: "inbound", content: "Do you have fast wifi? Looking for a new regular spot to work from!", senderHandle: "@remote_worker_vibes", sentiment: "positive", status: "unread", createdAt: daysAgo(2) },
        { direction: "outbound", content: "Yes! We have 300 Mbps fibre wifi, plenty of outlets, and great natural light. First coffee is on us for new regulars! ☕", senderHandle: "sunrisecafe", sentiment: "positive", status: "replied", createdAt: daysAgo(2) },
      ],
    },
    {
      platformConversationId: "fb_conv_sunrise_001",
      platform: "facebook", participantHandle: "David Park",
      status: "pending", priority: "high", sentimentSummary: "negative", lastMessageAt: minsAgo(30),
      messages: [
        { direction: "inbound", content: "I waited 20 minutes for my order this morning and then was told you were out of my item. No apology, nothing. Very disappointed.", senderHandle: "David Park", sentiment: "negative", status: "unread", createdAt: minsAgo(30), note: "Complaint during rush hour. Offer a free drink voucher to resolve." },
      ],
    },
  ];

  for (const conv of sunriseConvs) {
    const [exConv] = await db.select({ id: conversations.id }).from(conversations)
      .where(and(eq(conversations.clientId, sunrise!.id), eq(conversations.platformConversationId, conv.platformConversationId))).limit(1);
    let convId: string;
    if (!exConv) {
      const [ins] = await db.insert(conversations).values({
        clientId: sunrise!.id,
        platform: conv.platform,
        platformConversationId: conv.platformConversationId,
        participantHandle: conv.participantHandle,
        status: conv.status,
        priority: conv.priority,
        sentimentSummary: conv.sentimentSummary,
        lastMessageAt: conv.lastMessageAt,
        detectedLocale: "en",
      }).returning();
      convId = ins!.id;
      console.log(`  ✓ Conversation: ${conv.participantHandle}`);
    } else {
      convId = exConv.id;
    }

    for (const msg of conv.messages) {
      const [exMsg] = await db.select({ id: messages.id }).from(messages)
        .where(and(eq(messages.conversationId, convId), eq(messages.content, msg.content))).limit(1);
      if (!exMsg) {
        await db.insert(messages).values({
          conversationId: convId,
          direction: msg.direction,
          content: msg.content,
          senderHandle: msg.senderHandle,
          sentiment: msg.sentiment,
          status: msg.status,
          detectedLocale: "en",
          createdAt: msg.createdAt,
        });
        if (msg.note) {
          await db.insert(conversationNotes).values({ conversationId: convId, userId: samId, content: msg.note });
        }
      }
    }
  }

  // Portal token — Sunrise
  const sunriseTokenHash = makePortalToken(sunrise!.id, "maria@sunrisecafe.com");
  const [exSunriseToken] = await db.select().from(portalTokens).where(eq(portalTokens.tokenHash, sunriseTokenHash)).limit(1);
  if (!exSunriseToken) {
    await db.insert(portalTokens).values({ clientId: sunrise!.id, tokenHash: sunriseTokenHash, email: "maria@sunrisecafe.com", expiresAt: daysFromNow(90) });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT 3: Northwind Studio — intake pending
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Northwind Studio (intake_pending) ──");

  let [northwind] = await db.select().from(clients).where(and(eq(clients.orgId, org!.id), eq(clients.slug, "northwind-studio"))).limit(1);
  if (!northwind) {
    [northwind] = await db.insert(clients).values({
      orgId: org!.id,
      name: "Northwind Studio",
      slug: "northwind-studio",
      status: "intake_pending",
      industry: "Creative & Design",
      primaryContactName: "Sam Northwind",
      primaryContactEmail: "sam@northwindstudio.co",
      targetLocales: ["en"],
      primaryLocale: "en",
      permissions: { brandVoice: { tone: "professional, creative", audience: "small businesses and startups", pillars: [], package: "Starter" } },
    }).returning();
    console.log(`  ✓ Client created`);
  } else {
    console.log(`  ✓ Client exists`);
  }

  // Intake draft — 50% complete
  const [northwindIntake] = await db.select().from(clientIntakeSubmissions)
    .where(and(eq(clientIntakeSubmissions.clientId, northwind!.id), eq(clientIntakeSubmissions.isDraft, true))).limit(1);
  if (!northwindIntake) {
    await db.insert(clientIntakeSubmissions).values({
      clientId: northwind!.id,
      rawPayload: {
        businessName: "Northwind Studio",
        website: "https://northwindstudio.co",
        industry: "Creative & Design",
        targetAudience: "Small businesses and startups looking for brand identity and design services.",
        _completionPercent: 50,
        _draftNote: "Client completed basic info but not yet filled brand voice or goals sections.",
      } as unknown as Record<string, unknown>,
      isDraft: true,
    });
    console.log(`  ✓ Intake draft created (50%)`);
  }

  // 2 draft content items
  const northwindContent = [
    { title: "Introducing Northwind Studio: Brand Identity Reimagined", platform: "linkedin", body: "Great brands aren't designed — they're discovered. 🎨 At Northwind Studio, we help small businesses uncover the visual language that's authentically theirs.\n\n#BrandDesign #NorthwindStudio #StartupBranding" },
    { title: "Why Small Businesses Need a Brand Strategy First", platform: "instagram", body: "A logo isn't a brand. A color palette isn't a brand. A brand is a feeling — and feelings need a strategy.\n\n#BrandStrategy #SmallBusiness #DesignProcess" },
  ];

  for (const item of northwindContent) {
    const [ex] = await db.select({ id: contentItems.id }).from(contentItems)
      .where(and(eq(contentItems.clientId, northwind!.id), eq(contentItems.title, item.title))).limit(1);
    if (!ex) {
      const [ci] = await db.insert(contentItems).values({
        clientId: northwind!.id,
        orgId: org!.id,
        title: item.title,
        platform: item.platform,
        status: "draft",
        scheduledFor: daysFromNow(7),
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: ["draft"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci!.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
    }
  }
  console.log(`  ✓ 2 draft content items created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TASKS (8 tasks)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Tasks ──");

  const taskSeeds = [
    { title: "Review Sunrise Cafe brand strategy", description: "AI strategy is ready for strategist review. Check positioning and tone.", clientId: sunrise!.id, assigneeId: samId, status: "todo" as const, priority: "high" as const, dueDate: daysFromNow(2) },
    { title: "Draft Acme Bakery May content calendar", description: "Create 8–12 posts for the May calendar across IG, FB, TikTok.", clientId: acme!.id, assigneeId: taylorId, status: "in_progress" as const, priority: "medium" as const, dueDate: daysFromNow(7) },
    { title: "Send Northwind intake reminder", description: "Client has not completed their intake form after 3 days.", clientId: northwind!.id, assigneeId: alexId, status: "todo" as const, priority: "low" as const, dueDate: daysFromNow(2) },
    { title: "Approve Acme sourdough draft post", description: "Review and approve the Monday Morning Sourdough Drop post.", clientId: acme!.id, assigneeId: samId, status: "todo" as const, priority: "high" as const, dueDate: daysFromNow(1) },
    { title: "Schedule Sunrise fall menu content", description: "Move the Fall Menu Launch post to published schedule.", clientId: sunrise!.id, assigneeId: taylorId, status: "todo" as const, priority: "medium" as const, dueDate: daysFromNow(4) },
    { title: "Reply to Acme wholesale inquiry", description: "Corporate catering company is waiting on bulk pricing information.", clientId: acme!.id, assigneeId: jordanId, status: "in_progress" as const, priority: "high" as const, dueDate: daysFromNow(1) },
    { title: "Generate Acme monthly report", description: "Generate and send October performance report to Jane.", clientId: acme!.id, assigneeId: alexId, status: "done" as const, priority: "low" as const, dueDate: daysAgo(5), completedAt: daysAgo(5) },
    { title: "Set up Northwind brand kit", description: "Once intake is complete, populate brand kit with client assets.", clientId: northwind!.id, assigneeId: samId, status: "todo" as const, priority: "medium" as const, dueDate: daysFromNow(10) },
  ];

  for (const t of taskSeeds) {
    const [ex] = await db.select({ id: tasks.id }).from(tasks)
      .where(and(eq(tasks.title, t.title), eq(tasks.clientId, t.clientId!))).limit(1);
    if (!ex) {
      await db.insert(tasks).values({
        title: t.title,
        description: t.description,
        clientId: t.clientId,
        assigneeId: t.assigneeId,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        completedAt: "completedAt" in t ? t.completedAt as Date : null,
      });
      console.log(`  ✓ Task: ${t.title.substring(0, 50)}`);
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  const acmePortalLink = `${APP_URL}/portal/${PROD_ORG_CLERK_ID}/${acme!.slug}?token=${acmeTokenHash}`;
  const sunrisePortalLink = `${APP_URL}/portal/${PROD_ORG_CLERK_ID}/${sunrise!.slug}?token=${sunriseTokenHash}`;

  console.log(`
✅  Comprehensive demo seed complete!

┌─────────────────────────────────────────────────────────────────────────────┐
│  DEMO USERS                                                                   │
│  Alex Rivera (admin)      user_demo_admin_1                                   │
│  Jordan Kim (admin)       user_demo_admin_2                                   │
│  Sam Chen (strategist)    user_demo_strategist_1                              │
│  Taylor Brooks (CM)       user_demo_cm_1                                      │
│                                                                               │
│  ACME BAKERY (active)                                                         │
│  Dashboard:  ${APP_URL}/dashboard/clients/${acme!.id}
│  Portal:     ${acmePortalLink}
│                                                                               │
│  SUNRISE CAFE (strategist_review — needs review!)                             │
│  Dashboard:  ${APP_URL}/dashboard/clients/${sunrise!.id}
│  Portal:     ${sunrisePortalLink}
│                                                                               │
│  NORTHWIND STUDIO (intake_pending)                                            │
│  Dashboard:  ${APP_URL}/dashboard/clients/${northwind!.id}
└─────────────────────────────────────────────────────────────────────────────┘
`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
