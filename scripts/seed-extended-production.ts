#!/usr/bin/env node
/**
 * seed:extended-production
 *
 * Extends the base seed with:
 *  - 3 assets per client (Acme already has 6, will upsert; add for Sunrise + Northwind)
 *  - Conversations + messages for Acme (5-10 DMs) and Sunrise (2-3)
 *  - Community moderation items (flagged comments) for Acme
 *  - More content for Sunrise (6 items) and Northwind (2 draft items)
 *  - Analytics for Sunrise (2 weeks)
 *  - 1 social account stub per client
 *
 * Usage:
 *   dotenv -e apps/web/.env.production -- npx tsx scripts/seed-extended-production.ts
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  assets,
  conversations,
  messages,
  socialAccounts,
  contentItems,
  contentVersions,
  analyticsAggregates,
} from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.production") });
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set.");
  process.exit(1);
}

const PROD_ORG_CLERK_ID = "org_3E2xnW8XoT1Be86AuqqmL443gQm";
const CLIENT_IDS = {
  acme: "b5935f7c-d866-4910-93fc-58d47b495c6e",
  sunrise: "9d7bfea2-38b0-4c6d-96e3-352a9625e19a",
  northwind: "13724de0-054c-448d-8be5-fc82b4ff3b25",
};

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}
function minsAgo(n: number) {
  return new Date(Date.now() - n * 60 * 1000);
}

async function main() {
  const db = createDb(DATABASE_URL!);
  console.log("🌱 Extended seed starting...\n");

  const [org] = await db.select().from(orgs).where(eq(orgs.clerkOrgId, PROD_ORG_CLERK_ID)).limit(1);
  if (!org) { console.error("Org not found!"); process.exit(1); }
  console.log(`✓ Org: ${org.name} (${org.id})\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS — 3 per client
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("── Assets ──");

  const assetSeeds = [
    // Acme Bakery
    { clientId: CLIENT_IDS.acme, orgId: org.id, storageKey: "acme/hero-sourdough.jpg", publicUrl: "https://picsum.photos/seed/acme1/800/800", filename: "hero-sourdough.jpg", type: "image" as const, kind: "brand_photo", aiTags: ["sourdough", "bread", "bakery"], tags: ["hero", "product"] },
    { clientId: CLIENT_IDS.acme, orgId: org.id, storageKey: "acme/team-baking.jpg", publicUrl: "https://picsum.photos/seed/acme2/800/800", filename: "team-baking.jpg", type: "image" as const, kind: "behind_the_scenes", aiTags: ["baking", "team", "kitchen"], tags: ["bts", "team"] },
    { clientId: CLIENT_IDS.acme, orgId: org.id, storageKey: "acme/logo-primary.png", publicUrl: "https://picsum.photos/seed/acme3/400/400", filename: "logo-primary.png", type: "image" as const, kind: "logo", aiTags: ["logo", "brand"], tags: ["logo", "brand-asset"] },
    // Sunrise Cafe
    { clientId: CLIENT_IDS.sunrise, orgId: org.id, storageKey: "sunrise/espresso-pour.jpg", publicUrl: "https://picsum.photos/seed/sunrise1/800/800", filename: "espresso-pour.jpg", type: "image" as const, kind: "brand_photo", aiTags: ["coffee", "espresso", "cafe"], tags: ["hero", "product"] },
    { clientId: CLIENT_IDS.sunrise, orgId: org.id, storageKey: "sunrise/cozy-interior.jpg", publicUrl: "https://picsum.photos/seed/sunrise2/800/800", filename: "cozy-interior.jpg", type: "image" as const, kind: "brand_photo", aiTags: ["cafe", "interior", "cozy", "workspace"], tags: ["interior", "ambiance"] },
    { clientId: CLIENT_IDS.sunrise, orgId: org.id, storageKey: "sunrise/logo.png", publicUrl: "https://picsum.photos/seed/sunrise3/400/400", filename: "sunrise-logo.png", type: "image" as const, kind: "logo", aiTags: ["logo", "brand"], tags: ["logo", "brand-asset"] },
    // Northwind Studio
    { clientId: CLIENT_IDS.northwind, orgId: org.id, storageKey: "northwind/design-work.jpg", publicUrl: "https://picsum.photos/seed/northwind1/800/800", filename: "design-portfolio.jpg", type: "image" as const, kind: "portfolio", aiTags: ["design", "branding", "creative"], tags: ["portfolio", "work"] },
    { clientId: CLIENT_IDS.northwind, orgId: org.id, storageKey: "northwind/team-photo.jpg", publicUrl: "https://picsum.photos/seed/northwind2/800/800", filename: "team-photo.jpg", type: "image" as const, kind: "brand_photo", aiTags: ["team", "studio", "creative"], tags: ["team"] },
    { clientId: CLIENT_IDS.northwind, orgId: org.id, storageKey: "northwind/logo.png", publicUrl: "https://picsum.photos/seed/northwind3/400/400", filename: "northwind-logo.png", type: "image" as const, kind: "logo", aiTags: ["logo", "brand"], tags: ["logo"] },
  ];

  for (const a of assetSeeds) {
    const [existing] = await db.select({ id: assets.id }).from(assets)
      .where(and(eq(assets.clientId, a.clientId), eq(assets.storageKey, a.storageKey))).limit(1);
    if (!existing) {
      await db.insert(assets).values({
        orgId: a.orgId,
        clientId: a.clientId,
        type: a.type,
        kind: a.kind,
        filename: a.filename,
        mimeType: "image/jpeg",
        sizeBytes: Math.floor(Math.random() * 2000000) + 500000,
        storageKey: a.storageKey,
        publicUrl: a.publicUrl,
        aiTags: a.aiTags,
        tags: a.tags,
        dimensions: { width: 800, height: 800 },
        metadata: {},
      });
      console.log(`  ✓ Asset: ${a.filename}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL ACCOUNT STUBS — 1 per client
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Social Accounts (stubs) ──");

  const socialSeeds = [
    { clientId: CLIENT_IDS.acme, platform: "instagram_business", accountName: "@acmebakery", externalAccountId: "ig_acme_stub_001" },
    { clientId: CLIENT_IDS.sunrise, platform: "instagram_business", accountName: "@sunrisecafe", externalAccountId: "ig_sunrise_stub_001" },
    { clientId: CLIENT_IDS.northwind, platform: "instagram_business", accountName: "@northwindstudio", externalAccountId: "ig_northwind_stub_001" },
  ];

  for (const s of socialSeeds) {
    const [existing] = await db.select({ id: socialAccounts.id }).from(socialAccounts)
      .where(and(eq(socialAccounts.clientId, s.clientId), eq(socialAccounts.platform, s.platform))).limit(1);
    if (!existing) {
      await db.insert(socialAccounts).values({
        orgId: org.id,
        clientId: s.clientId,
        platform: s.platform,
        accountName: s.accountName,
        externalAccountId: s.externalAccountId,
        isActive: true,
      });
      console.log(`  ✓ Social: ${s.accountName} (${s.platform})`);
    } else {
      console.log(`  ✓ Social exists: ${s.accountName}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSATIONS + MESSAGES — Acme (5 DMs) + Sunrise (3)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Conversations & Messages ──");

  const acmeConversationSeeds = [
    {
      platform: "instagram",
      platformConversationId: "ig_conv_acme_001",
      participantHandle: "@bread_lover_local",
      status: "open" as const,
      priority: "high" as const,
      sentimentSummary: "positive" as const,
      lastMessageAt: minsAgo(15),
      messages: [
        { direction: "inbound" as const, content: "Hi! Do you do custom orders for wedding cakes? We're getting married in June!", senderHandle: "@bread_lover_local", sentiment: "positive" as const, status: "unread" as const, createdAt: minsAgo(15) },
        { direction: "inbound" as const, content: "We'd need a 3-tier cake for around 80 guests, gluten-free options if possible!", senderHandle: "@bread_lover_local", sentiment: "positive" as const, status: "unread" as const, createdAt: minsAgo(14) },
      ],
    },
    {
      platform: "instagram",
      platformConversationId: "ig_conv_acme_002",
      participantHandle: "@healthyeats_mama",
      status: "open" as const,
      priority: "normal" as const,
      sentimentSummary: "positive" as const,
      lastMessageAt: minsAgo(60),
      messages: [
        { direction: "inbound" as const, content: "What time do you open on Sundays? Your sourdough loaves are the BEST 🙌", senderHandle: "@healthyeats_mama", sentiment: "positive" as const, status: "unread" as const, createdAt: minsAgo(62) },
        { direction: "outbound" as const, content: "Hi! We open at 7am on Sundays and the sourdough is usually ready by 8am. Thank you for the love! ❤️", senderHandle: "acmebakery", sentiment: "positive" as const, status: "replied" as const, createdAt: minsAgo(60) },
        { direction: "inbound" as const, content: "Perfect! I'll be there 🎉", senderHandle: "@healthyeats_mama", sentiment: "positive" as const, status: "read" as const, createdAt: minsAgo(55) },
      ],
    },
    {
      platform: "tiktok",
      platformConversationId: "tt_conv_acme_001",
      participantHandle: "@tiktokfoodie99",
      status: "open" as const,
      priority: "normal" as const,
      sentimentSummary: "positive" as const,
      lastMessageAt: minsAgo(180),
      messages: [
        { direction: "inbound" as const, content: "Just saw your sourdough video omg!! Do you ship nationwide?", senderHandle: "@tiktokfoodie99", sentiment: "positive" as const, status: "unread" as const, createdAt: minsAgo(185) },
        { direction: "outbound" as const, content: "We love the support! Unfortunately we're local-only right now, but we do offer wholesale to nearby cafes. DM for details!", senderHandle: "acmebakery", sentiment: "positive" as const, status: "replied" as const, createdAt: minsAgo(180) },
      ],
    },
    {
      platform: "instagram",
      platformConversationId: "ig_conv_acme_003",
      participantHandle: "@corporate_catering_co",
      status: "pending" as const,
      priority: "high" as const,
      sentimentSummary: "neutral" as const,
      lastMessageAt: daysAgo(1),
      messages: [
        { direction: "inbound" as const, content: "Good morning! We run a corporate catering service and are looking for a regular bread supplier for our events. Could we discuss bulk pricing?", senderHandle: "@corporate_catering_co", sentiment: "neutral" as const, status: "read" as const, createdAt: daysAgo(1) },
      ],
    },
    {
      platform: "facebook",
      platformConversationId: "fb_conv_acme_001",
      participantHandle: "Sarah Mitchell",
      status: "resolved" as const,
      priority: "normal" as const,
      sentimentSummary: "negative" as const,
      lastMessageAt: daysAgo(3),
      messages: [
        { direction: "inbound" as const, content: "Hi, I ordered a custom birthday cake last week and it wasn't quite what I expected. The frosting color was different from what we discussed.", senderHandle: "Sarah Mitchell", sentiment: "negative" as const, status: "read" as const, createdAt: daysAgo(3) },
        { direction: "outbound" as const, content: "Hi Sarah, I'm so sorry about that! We take pride in matching your vision exactly. Could we offer you a complimentary replacement or a 50% refund? Please let us know what works best for you.", senderHandle: "acmebakery", sentiment: "neutral" as const, status: "replied" as const, createdAt: daysAgo(3) },
        { direction: "inbound" as const, content: "The 50% refund would be great. Thank you for responding so quickly!", senderHandle: "Sarah Mitchell", sentiment: "positive" as const, status: "read" as const, createdAt: daysAgo(2) },
      ],
    },
  ];

  for (const conv of acmeConversationSeeds) {
    const [existing] = await db.select({ id: conversations.id }).from(conversations)
      .where(and(eq(conversations.clientId, CLIENT_IDS.acme), eq(conversations.platformConversationId, conv.platformConversationId))).limit(1);

    let convId: string;
    if (!existing) {
      const [ins] = await db.insert(conversations).values({
        clientId: CLIENT_IDS.acme,
        platform: conv.platform,
        platformConversationId: conv.platformConversationId,
        participantHandle: conv.participantHandle,
        status: conv.status,
        priority: conv.priority,
        sentimentSummary: conv.sentimentSummary,
        lastMessageAt: conv.lastMessageAt,
        detectedLocale: "en",
      }).returning();
      convId = ins.id;
      console.log(`  ✓ Conversation: ${conv.participantHandle} (${conv.platform})`);
    } else {
      convId = existing.id;
    }

    // Add messages
    for (const msg of conv.messages) {
      const [existingMsg] = await db.select({ id: messages.id }).from(messages)
        .where(and(eq(messages.conversationId, convId), eq(messages.content, msg.content))).limit(1);
      if (!existingMsg) {
        await db.insert(messages).values({
          conversationId: convId,
          direction: msg.direction,
          content: msg.content,
          senderHandle: msg.senderHandle,
          sentiment: msg.sentiment,
          status: msg.status,
          detectedLocale: "en",
          aiSuggestedReply: msg.direction === "inbound" ? "Thank you for reaching out! We'll get back to you shortly." : null,
          aiConfidence: msg.direction === "inbound" ? 85 : null,
          createdAt: msg.createdAt,
        });
      }
    }
  }

  // Sunrise conversations (2)
  const sunriseConvSeeds = [
    {
      platform: "instagram",
      platformConversationId: "ig_conv_sunrise_001",
      participantHandle: "@coffee_curious",
      status: "open" as const,
      priority: "normal" as const,
      sentimentSummary: "positive" as const,
      lastMessageAt: minsAgo(45),
      messages: [
        { direction: "inbound" as const, content: "Are you open on Christmas Day? We'd love to grab coffee before family dinner!", senderHandle: "@coffee_curious", sentiment: "positive" as const, status: "unread" as const, createdAt: minsAgo(47) },
      ],
    },
    {
      platform: "instagram",
      platformConversationId: "ig_conv_sunrise_002",
      participantHandle: "@remote_worker_vibes",
      status: "open" as const,
      priority: "low" as const,
      sentimentSummary: "positive" as const,
      lastMessageAt: daysAgo(2),
      messages: [
        { direction: "inbound" as const, content: "Do you have fast wifi? Looking for a new regular spot to work from!", senderHandle: "@remote_worker_vibes", sentiment: "positive" as const, status: "unread" as const, createdAt: daysAgo(2) },
        { direction: "outbound" as const, content: "Yes! We have 300 Mbps fibre wifi, plenty of outlets, and great natural light. Come check us out — first coffee is on us for new regulars! ☕", senderHandle: "sunrisecafe", sentiment: "positive" as const, status: "replied" as const, createdAt: daysAgo(2) },
      ],
    },
  ];

  for (const conv of sunriseConvSeeds) {
    const [existing] = await db.select({ id: conversations.id }).from(conversations)
      .where(and(eq(conversations.clientId, CLIENT_IDS.sunrise), eq(conversations.platformConversationId, conv.platformConversationId))).limit(1);
    let convId: string;
    if (!existing) {
      const [ins] = await db.insert(conversations).values({
        clientId: CLIENT_IDS.sunrise,
        platform: conv.platform,
        platformConversationId: conv.platformConversationId,
        participantHandle: conv.participantHandle,
        status: conv.status,
        priority: conv.priority,
        sentimentSummary: conv.sentimentSummary,
        lastMessageAt: conv.lastMessageAt,
        detectedLocale: "en",
      }).returning();
      convId = ins.id;
      console.log(`  ✓ Conversation: ${conv.participantHandle} (Sunrise)`);
    } else {
      convId = existing.id;
    }
    for (const msg of conv.messages) {
      const [existingMsg] = await db.select({ id: messages.id }).from(messages)
        .where(and(eq(messages.conversationId, convId), eq(messages.content, msg.content))).limit(1);
      if (!existingMsg) {
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
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT — Sunrise (6 items) + Northwind (2 drafts)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Content for Sunrise & Northwind ──");

  const sunriseContentSeeds = [
    { title: "Morning Ritual: The Perfect Pour-Over", platform: "instagram", status: "draft" as const, daysOffset: 0, body: "There's something meditative about a perfect pour-over. 🍵 Starting your day with intention — one careful pour at a time.\n\nOur baristas use single-origin beans from our partner farm in Ethiopia. Naturally sweet, zero bitterness.\n\n#SunriseCafe #PourOver #CoffeeCulture #SpecialtyCoffee" },
    { title: "Community Corner: Meet Our Regulars", platform: "instagram", status: "draft" as const, daysOffset: 2, body: "Every great cafe is really just a great community. 🤗 Meet Sarah — she's been working from that corner table every Tuesday for 3 years. We save it for her.\n\nYour corner is waiting. Come in. ☕\n\n#SunriseCafe #Community #CoffeeShop #WorkFromCafe" },
    { title: "New Fall Menu Launch", platform: "facebook", status: "scheduled" as const, daysOffset: 4, body: "🍂 Fall menu is HERE! Introducing:\n\n→ Salted Caramel Latte\n→ Pumpkin Cold Brew\n→ Maple Cinnamon Flat White\n→ Apple Walnut Scone\n\nAll made with organic ingredients. Available October 1 — come try them before they're gone!\n\n#FallMenu #SunriseCafe #SeasonalDrinks" },
    { title: "Barista Tip: Get More from Your Espresso", platform: "tiktok", status: "scheduled" as const, daysOffset: 6, body: "Your espresso shot is speaking to you — are you listening? 👂\n\nIf it runs fast: grind finer. Too slow: grind coarser. The sweet spot is 25-30 seconds for a double shot.\n\nTag a coffee nerd who needs to see this! ☕\n\n#CoffeeTips #BaristaLife #EspressoTips #CoffeeTok" },
    { title: "Dog-Friendly Patio is Back for Fall", platform: "instagram", status: "draft" as const, daysOffset: 0, body: "Your furry friend is officially invited! 🐾 Our heated patio re-opens this weekend — blankets, dog water bowls, and puppy treats included.\n\nBring your best bud. We'll bring the lattes. 🧡\n\n#DogFriendly #SunriseCafe #DogCafe #PatioCoffee" },
    { title: "Weekly Loyalty Rewards: Here's How It Works", platform: "linkedin", status: "draft" as const, daysOffset: 0, body: "Building community loyalty is about more than just a stamp card. At Sunrise Cafe, our loyalty program gives back in 3 ways:\n\n1. Free drink after every 10 visits\n2. Birthday month upgrade on every order\n3. Early access to seasonal menus for top-tier members\n\nHow is your business building community loyalty?" },
  ];

  for (const item of sunriseContentSeeds) {
    const [existing] = await db.select({ id: contentItems.id }).from(contentItems)
      .where(and(eq(contentItems.clientId, CLIENT_IDS.sunrise), eq(contentItems.title, item.title))).limit(1);
    if (!existing) {
      const schedDate = item.daysOffset > 0 ? daysFromNow(item.daysOffset) : new Date();
      const [ci] = await db.insert(contentItems).values({
        clientId: CLIENT_IDS.sunrise,
        orgId: org.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: schedDate,
        publishedAt: item.status === "published" ? schedDate : null,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: ["ai-generated"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
      console.log(`  ✓ Sunrise content: "${item.title.substring(0, 40)}"`);
    }
  }

  const northwindContentSeeds = [
    { title: "Introducing Northwind Studio: Brand Identity Reimagined", platform: "linkedin", status: "draft" as const, body: "Great brands aren't designed — they're discovered. 🎨\n\nAt Northwind Studio, we help small businesses and startups uncover the visual language that's authentically theirs. From logos to full brand systems.\n\nDM us to start a conversation about your brand identity.\n\n#BrandDesign #NorthwindStudio #StartupBranding #DesignStudio" },
    { title: "Why Small Businesses Need a Brand Strategy First", platform: "instagram", status: "draft" as const, body: "A logo isn't a brand. A color palette isn't a brand. A brand is a feeling — and feelings need a strategy.\n\nWe walk every client through our Brand Discovery process before touching design tools. The result? Designs that LAST.\n\n#BrandStrategy #SmallBusiness #DesignProcess #BrandingTips" },
  ];

  for (const item of northwindContentSeeds) {
    const [existing] = await db.select({ id: contentItems.id }).from(contentItems)
      .where(and(eq(contentItems.clientId, CLIENT_IDS.northwind), eq(contentItems.title, item.title))).limit(1);
    if (!existing) {
      const [ci] = await db.insert(contentItems).values({
        clientId: CLIENT_IDS.northwind,
        orgId: org.id,
        title: item.title,
        platform: item.platform,
        status: item.status,
        scheduledFor: daysFromNow(7),
        publishedAt: null,
        draftPayload: { captionBody: item.body },
        targetPlatforms: [item.platform],
        historyTags: ["draft"],
      }).returning();
      await db.insert(contentVersions).values({ contentItemId: ci.id, versionInt: 1, body: item.body, draftPayload: { captionBody: item.body } });
      console.log(`  ✓ Northwind content: "${item.title.substring(0, 40)}"`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS — Sunrise (14 days)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n── Analytics for Sunrise ──");

  const sunrisePlatforms = ["instagram", "facebook"];
  for (let i = 1; i <= 14; i++) {
    const date = daysAgo(14 - i);
    const dateStr = date.toISOString().substring(0, 10);
    for (const platform of sunrisePlatforms) {
      const [existing] = await db.select({ id: analyticsAggregates.id }).from(analyticsAggregates)
        .where(and(eq(analyticsAggregates.clientId, CLIENT_IDS.sunrise), eq(analyticsAggregates.date, dateStr), eq(analyticsAggregates.platform, platform))).limit(1);
      if (!existing) {
        const base = platform === "instagram" ? 1200 : 600;
        const growth = 1 + (i / 14) * 0.15;
        const rand = 0.85 + Math.random() * 0.3;
        await db.insert(analyticsAggregates).values({
          clientId: CLIENT_IDS.sunrise,
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
  console.log(`  ✓ Analytics: 14 days × 2 platforms for Sunrise`);

  // ═══════════════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n✅ Extended seed complete!\n");
  console.log("Entity counts added:");
  console.log("  Assets: 9 (3 per client)");
  console.log("  Social accounts: 3 stubs");
  console.log("  Conversations: 7 (5 Acme, 2 Sunrise)");
  console.log("  Messages: ~15+");
  console.log("  Content items: 8 (6 Sunrise, 2 Northwind)");
  console.log("  Analytics rows: up to 28 (14d × 2 platforms for Sunrise)");
}

main().catch((err) => {
  console.error("Extended seed failed:", err);
  process.exit(1);
});
