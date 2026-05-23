#!/usr/bin/env npx ts-node --esm
/**
 * seed:demo-content
 *
 * Seeds 10 content items for "Acme Bakery" across 4 platforms with mixed statuses.
 * Requires the demo client to already exist (run seed:demo-client first).
 *
 * Usage:
 *   pnpm seed:demo-content
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  clientBrandStrategies,
  contentItems,
  contentVersions,
  assets,
} from "@getpostflow/db";
import {
  getBrandStrategyFixture,
  buildContentFixture,
  type BrandStrategyDraft,
  type IntakeData,
} from "@getpostflow/ai";
import { eq, and } from "drizzle-orm";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "client_published"
  | "failed";

type ContentType =
  | "post"
  | "carousel"
  | "reel"
  | "story"
  | "thread"
  | "ad"
  | "video_script";

// ─── Demo content specs ───────────────────────────────────────────────────────

interface ContentSpec {
  title: string;
  platform: string;
  contentType: ContentType;
  status: ContentStatus;
  daysFromNow: number; // negative = past, positive = future, 0 = today
  topic: string;
}

const CONTENT_SPECS: ContentSpec[] = [
  // Instagram posts
  {
    title: "Introducing our new autumn sourdough collection",
    platform: "instagram",
    contentType: "post",
    status: "published",
    daysFromNow: -5,
    topic: "Product Launch",
  },
  {
    title: "Behind the scenes: Our 100-year-old starter",
    platform: "instagram",
    contentType: "reel",
    status: "published",
    daysFromNow: -2,
    topic: "Brand Story",
  },
  {
    title: "Weekend special — Cinnamon rolls are BACK",
    platform: "instagram",
    contentType: "story",
    status: "scheduled",
    daysFromNow: 1,
    topic: "Product Promotion",
  },
  {
    title: "How we source our organic flour",
    platform: "instagram",
    contentType: "carousel",
    status: "approved",
    daysFromNow: 3,
    topic: "Brand Transparency",
  },
  // Facebook posts
  {
    title: "Join us this Saturday for our Community Bread Day",
    platform: "facebook",
    contentType: "post",
    status: "pending_review",
    daysFromNow: 5,
    topic: "Community Event",
  },
  {
    title: "New: Gluten-free options now available in-store",
    platform: "facebook",
    contentType: "post",
    status: "draft",
    daysFromNow: 7,
    topic: "Product Announcement",
  },
  // TikTok
  {
    title: "Watch us bake 200 loaves before 6am",
    platform: "tiktok",
    contentType: "reel",
    status: "client_published",
    daysFromNow: -3,
    topic: "Process Video",
  },
  {
    title: "POV: You found the best sourdough in the city",
    platform: "tiktok",
    contentType: "video_script",
    status: "scheduled",
    daysFromNow: 2,
    topic: "Viral Hook",
  },
  // LinkedIn
  {
    title: "How Acme Bakery grew from 1 to 12 employees in 3 years",
    platform: "linkedin",
    contentType: "post",
    status: "approved",
    daysFromNow: 6,
    topic: "Brand Growth Story",
  },
  // Failed example
  {
    title: "Summer sale ad — 20% off all pastries",
    platform: "instagram",
    contentType: "ad",
    status: "failed",
    daysFromNow: -1,
    topic: "Paid Promotion",
  },
];

// ─── Demo assets ──────────────────────────────────────────────────────────────

const DEMO_ASSETS = [
  { filename: "sourdough-hero.jpg", mimeType: "image/jpeg", type: "image" as const, aiTags: ["bread", "sourdough", "food", "artisan"], sizeBytes: 1024 * 450 },
  { filename: "bakery-interior.jpg", mimeType: "image/jpeg", type: "image" as const, aiTags: ["bakery", "interior", "warm", "lifestyle"], sizeBytes: 1024 * 820 },
  { filename: "cinnamon-rolls.jpg", mimeType: "image/jpeg", type: "image" as const, aiTags: ["pastry", "sweet", "cinnamon", "baked-goods"], sizeBytes: 1024 * 310 },
  { filename: "baker-at-work.mp4", mimeType: "video/mp4", type: "video" as const, aiTags: ["process", "baking", "behind-the-scenes"], sizeBytes: 1024 * 1024 * 12 },
  { filename: "brand-logo.svg", mimeType: "image/svg+xml", type: "image" as const, aiTags: ["logo", "brand", "identity"], sizeBytes: 4800 },
  { filename: "autumn-collection-brief.pdf", mimeType: "application/pdf", type: "document" as const, aiTags: ["brief", "campaign", "autumn"], sizeBytes: 1024 * 120 },
  { filename: "holiday-promo-banner.jpg", mimeType: "image/jpeg", type: "image" as const, aiTags: ["holiday", "banner", "promotion"], sizeBytes: 1024 * 560 },
  { filename: "customer-testimonial.mp4", mimeType: "video/mp4", type: "video" as const, aiTags: ["testimonial", "social-proof", "customer"], sizeBytes: 1024 * 1024 * 8 },
  { filename: "brand-colors-palette.png", mimeType: "image/png", type: "image" as const, aiTags: ["brand", "colors", "palette", "identity"], sizeBytes: 1024 * 45 },
  { filename: "storefront-photo.jpg", mimeType: "image/jpeg", type: "image" as const, aiTags: ["storefront", "exterior", "location"], sizeBytes: 1024 * 680 },
];

// ─── Intake data ──────────────────────────────────────────────────────────────

const ACME_INTAKE: IntakeData = {
  businessName: "Acme Bakery",
  website: "https://acmebakery.com",
  industry: "Food & Beverage",
  targetAudience:
    "Health-conscious millennials and Gen Z in urban areas, aged 22–38, who value artisan quality, local sourcing, and Instagram-worthy food experiences.",
  brandVoice: { formalCasual: 7, seriousPlayful: 6, conservativeBold: 7 },
  uniqueSellingProps:
    "Sourdough bread baked with 100-year-old starter. Zero artificial preservatives. Same-day local delivery. Custom celebration cakes.",
  productsServices:
    "Artisan sourdough loaves, pastries, custom cakes, seasonal specials, wholesale to local cafes.",
  competitors: "Big chain bakeries, small local bakeries, grocery store bakery sections.",
  contentGoals: ["Brand awareness", "Community building", "Product promotion"],
  targetLocales: ["en"],
  preferredCadence: { instagram: "Daily", facebook: "3x per week", linkedin: "Weekly", tiktok: "3x per week" },
  existingAssets: { colorHex: "#c2825a", fonts: "Playfair Display, Lato", sampleContentUrls: [] },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const db = createDb(DATABASE_URL!);
  console.log("🌱 Seeding demo content: Acme Bakery...\n");

  // 1. Find org + client
  const orgClerkId = process.env.SEED_ORG_CLERK_ID ?? "demo-org-clerk-id";
  const [org] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgClerkId))
    .limit(1);
  if (!org) {
    console.error(`ERROR: Org with clerk_org_id "${orgClerkId}" not found. Run \`pnpm seed:demo-client\` first.`);
    process.exit(1);
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.orgId, org.id), eq(clients.slug, "acme-bakery")))
    .limit(1);
  if (!client) {
    console.error("ERROR: Acme Bakery client not found. Run `pnpm seed:demo-client` first.");
    process.exit(1);
  }

  console.log(`✓ Found: ${client.name} (${client.id})\n`);

  // 2. Get or generate brand strategy
  const [strategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .limit(1);

  const brandStrategy: BrandStrategyDraft =
    ((strategy?.editedPayload ?? strategy?.draftPayload) as BrandStrategyDraft | null) ??
    getBrandStrategyFixture(ACME_INTAKE);

  // 3. Seed content items
  let created = 0;
  let skipped = 0;

  for (const spec of CONTENT_SPECS) {
    // Skip if a content item with this title already exists
    const [existing] = await db
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(and(eq(contentItems.clientId, client.id), eq(contentItems.title, spec.title)))
      .limit(1);

    if (existing) {
      console.log(`  → Skip (exists): ${spec.title}`);
      skipped++;
      continue;
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + spec.daysFromNow);

    // Generate content using stub mode
    const draft = buildContentFixture(
      brandStrategy,
      spec.platform as Parameters<typeof buildContentFixture>[1],
      spec.contentType,
      { topic: spec.topic }
    );

    const isPublished = spec.status === "published" || spec.status === "client_published";
    const historyTags: string[] = ["ai-generated", "seed-data"];
    if (isPublished) historyTags.push(spec.status === "client_published" ? "client-published" : "published");

    const [item] = await db
      .insert(contentItems)
      .values({
        clientId: client.id,
        orgId: org.id,
        title: spec.title,
        platform: spec.platform,
        contentType: spec.contentType,
        locale: "en",
        status: spec.status,
        scheduledFor,
        publishedAt: isPublished ? scheduledFor : null,
        publishedUrl: isPublished ? `https://www.instagram.com/p/demo-${Math.random().toString(36).slice(2, 8)}/` : null,
        draftPayload: draft as unknown as Record<string, unknown>,
        historyTags,
      })
      .returning();

    // Create initial version
    await db.insert(contentVersions).values({
      contentItemId: item!.id,
      versionInt: 1,
      body: (draft.body as string) ?? "",
      platformVariants: {},
      draftPayload: draft as unknown as Record<string, unknown>,
      changeSummary: "Initial AI-generated draft",
    });

    console.log(`  ✓ Created [${spec.status.padEnd(17)}] [${spec.platform.padEnd(9)}] ${spec.title}`);
    created++;
  }

  console.log(`\n✓ Content: ${created} created, ${skipped} skipped\n`);

  // 4. Seed demo assets
  let assetCreated = 0;
  for (const assetSpec of DEMO_ASSETS) {
    const [existing] = await db
      .select({ id: assets.id })
      .from(assets)
      .where(and(eq(assets.orgId, org.id), eq(assets.storageKey, `assets/${org.id}/demo/${assetSpec.filename}`)))
      .limit(1);

    if (existing) {
      continue;
    }

    const storageKey = `assets/${org.id}/demo/${assetSpec.filename}`;
    await db.insert(assets).values({
      orgId: org.id,
      clientId: client.id,
      type: assetSpec.type,
      kind: assetSpec.type,
      filename: assetSpec.filename,
      mimeType: assetSpec.mimeType,
      sizeBytes: assetSpec.sizeBytes,
      storageKey,
      publicUrl: `https://cdn.getpostflow.dev/${storageKey}`,
      aiTags: assetSpec.aiTags,
      tags: [],
    });
    assetCreated++;
    console.log(`  ✓ Asset: ${assetSpec.filename}`);
  }
  if (assetCreated) console.log(`\n✓ Assets: ${assetCreated} created\n`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  console.log(`\n✅ Demo content seeded successfully!\n`);
  console.log(`  Content Calendar: ${appUrl}/dashboard/clients/${client.id}/content`);
  console.log(`  Asset Library:    ${appUrl}/dashboard/clients/${client.id}/assets`);
  console.log(`\n  Demo Path:`);
  console.log(`  1. Sign in → /dashboard/clients`);
  console.log(`  2. Open Acme Bakery → Content Calendar`);
  console.log(`  3. New Post (IG) → AI generates draft → Edit → Submit for Review`);
  console.log(`  4. Strategist approves → Schedule for tomorrow`);
  console.log(`  5. Dashboard shows scheduled item in calendar`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
