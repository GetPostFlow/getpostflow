#!/usr/bin/env npx ts-node --esm
/**
 * fix-org-subscription
 *
 * Sets an org's subscription to active/enterprise, removing any trial state.
 * Use this for internal team orgs that should never show the trial banner.
 *
 * Usage:
 *   pnpm fix-org-subscription -- --email a.rgittens87@gmail.com
 *   pnpm fix-org-subscription -- --clerk-org-id org_xxxxxxxx
 */

import { createDb } from "@getpostflow/db";
import { users, orgMemberships, orgs, orgSubscriptions } from "@getpostflow/db";
import { eq } from "drizzle-orm";
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

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith("--email="))?.split("=")[1]
    ?? args[args.indexOf("--email") + 1];
  const clerkOrgArg = args.find((a) => a.startsWith("--clerk-org-id="))?.split("=")[1]
    ?? args[args.indexOf("--clerk-org-id") + 1];

  if (!emailArg && !clerkOrgArg) {
    console.error("Usage: pnpm fix-org-subscription -- --email <email>");
    console.error("   or: pnpm fix-org-subscription -- --clerk-org-id <clerk_org_id>");
    process.exit(1);
  }

  const db = createDb(DATABASE_URL!);
  let orgId: string | undefined;

  if (clerkOrgArg) {
    const [org] = await db
      .select({ id: orgs.id, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.clerkOrgId, clerkOrgArg))
      .limit(1);
    if (!org) {
      console.error(`ERROR: No org found with clerk_org_id "${clerkOrgArg}"`);
      process.exit(1);
    }
    console.log(`✓ Found org: ${org.name} (${org.id})`);
    orgId = org.id;
  } else {
    const email = emailArg!.trim().toLowerCase();
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      console.error(`ERROR: No user found with email "${email}"`);
      process.exit(1);
    }
    const [membership] = await db
      .select({ orgId: orgMemberships.orgId })
      .from(orgMemberships)
      .where(eq(orgMemberships.userId, user.id))
      .limit(1);
    if (!membership) {
      console.error(`ERROR: User has no org membership`);
      process.exit(1);
    }
    const [org] = await db
      .select({ id: orgs.id, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.id, membership.orgId))
      .limit(1);
    console.log(`✓ Found org: ${org?.name ?? "(unknown)"} (${membership.orgId})`);
    orgId = membership.orgId;
  }

  // Upsert subscription row
  const [existing] = await db
    .select({ id: orgSubscriptions.id, status: orgSubscriptions.status })
    .from(orgSubscriptions)
    .where(eq(orgSubscriptions.orgId, orgId))
    .limit(1);

  if (existing) {
    await db
      .update(orgSubscriptions)
      .set({ status: "active", planCode: "enterprise", updatedAt: new Date() })
      .where(eq(orgSubscriptions.orgId, orgId));
    console.log(`✓ Updated subscription: ${existing.status} → active (plan: enterprise)`);
  } else {
    await db.insert(orgSubscriptions).values({
      orgId,
      planCode: "enterprise",
      status: "active",
      billingInterval: "monthly",
    });
    console.log(`✓ Created subscription: active (plan: enterprise)`);
  }

  console.log(`\n✅ Done! Trial banner will no longer show for this org.\n`);
  console.log(`  Next: redeploy or wait for the next page render.`);
}

main().catch((err) => {
  console.error("fix-org-subscription failed:", err);
  process.exit(1);
});
