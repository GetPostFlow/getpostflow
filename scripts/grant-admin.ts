#!/usr/bin/env npx ts-node --esm
/**
 * grant-admin
 *
 * Grants org_admin role to an existing user by email address.
 * If the user has no org membership, it assigns them to the first org in the DB.
 * If they already have a membership, it upgrades their role to org_admin.
 *
 * Usage:
 *   pnpm grant-admin -- --email a.rgittens87@gmail.com
 */

import { createDb } from "@getpostflow/db";
import { users, orgs, orgMemberships } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  // Parse --email argument
  const emailArg = process.argv.find((a) => a.startsWith("--email="))?.split("=")[1]
    ?? process.argv[process.argv.indexOf("--email") + 1];

  if (!emailArg) {
    console.error("Usage: pnpm grant-admin -- --email <email>");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  console.log(`\nGranting org_admin to: ${email}\n`);

  const db = createDb(DATABASE_URL!);

  // 1. Find the user
  const [user] = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    console.error(`ERROR: No user found with email "${email}"`);
    console.error("Make sure the user has signed up first (Clerk webhook must have fired).");
    process.exit(1);
  }

  console.log(`✓ Found user: ${user.fullName ?? "(no name)"} (${user.id})`);

  // 2. Find or create org membership
  const [existingMembership] = await db
    .select({ id: orgMemberships.id, orgId: orgMemberships.orgId, role: orgMemberships.role })
    .from(orgMemberships)
    .where(eq(orgMemberships.userId, user.id))
    .limit(1);

  if (existingMembership) {
    if (existingMembership.role === "org_admin" || existingMembership.role === "org_owner") {
      console.log(`✓ User already has role "${existingMembership.role}" — no change needed.`);
      process.exit(0);
    }

    // Upgrade existing membership to org_admin
    await db
      .update(orgMemberships)
      .set({ role: "org_admin" })
      .where(eq(orgMemberships.id, existingMembership.id));

    console.log(`✓ Upgraded role from "${existingMembership.role}" → org_admin`);
  } else {
    // No membership — find first org and create one
    const [firstOrg] = await db
      .select({ id: orgs.id, name: orgs.name })
      .from(orgs)
      .limit(1);

    if (!firstOrg) {
      // Create a default org on the fly
      const defaultOrgName = user.fullName ? `${user.fullName}'s Agency` : email.split("@")[0] + "'s Agency";
      const [newOrg] = await db
        .insert(orgs)
        .values({ clerkOrgId: `manual-${user.id}`, name: defaultOrgName })
        .returning();

      if (!newOrg) {
        console.error("ERROR: Failed to create org");
        process.exit(1);
      }

      await db
        .insert(orgMemberships)
        .values({ orgId: newOrg.id, userId: user.id, role: "org_admin" })
        .onConflictDoNothing();

      console.log(`✓ Created org "${defaultOrgName}" and assigned org_admin`);
    } else {
      await db
        .insert(orgMemberships)
        .values({ orgId: firstOrg.id, userId: user.id, role: "org_admin" })
        .onConflictDoNothing();

      console.log(`✓ Joined org "${firstOrg.name}" (${firstOrg.id}) as org_admin`);
    }
  }

  console.log(`\n✅ Done! ${email} now has org_admin access.\n`);
  console.log(`  Next: ask the user to sign out and sign back in, then visit /dashboard`);
}

main().catch((err) => {
  console.error("grant-admin failed:", err);
  process.exit(1);
});
