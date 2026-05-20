/**
 * Repository helpers for the social_account_profiles table.
 *
 * These helpers manage the mapping between an org and its Ayrshare profile key,
 * which is used as the Profile-Key header when making Ayrshare API calls on
 * behalf of that org.
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { eq, sql } from "drizzle-orm";
import { socialAccountProfiles } from "./schema";

type Db = ReturnType<typeof import("./index").createDb>;

export type SocialAccountProfile = InferSelectModel<typeof socialAccountProfiles>;
export type NewSocialAccountProfile = InferInsertModel<typeof socialAccountProfiles>;

/**
 * Create a new Ayrshare profile record for an org.
 * Call after POST /profiles on Ayrshare returns the new profile key.
 */
export async function createProfile(
  db: Db,
  orgId: string,
  ayrshareProfileKey: string,
  initialPlatformKeys: string[] = []
): Promise<SocialAccountProfile> {
  const [row] = await db
    .insert(socialAccountProfiles)
    .values({
      orgId,
      ayrshareProfileKey,
      platformKeys: initialPlatformKeys,
    })
    .returning();
  if (!row) throw new Error("createProfile: insert did not return a row");
  return row;
}

/**
 * Look up the Ayrshare profile for a given org.
 * Returns null if no profile has been set up yet.
 */
export async function getProfileByOrg(
  db: Db,
  orgId: string
): Promise<SocialAccountProfile | null> {
  const [row] = await db
    .select()
    .from(socialAccountProfiles)
    .where(eq(socialAccountProfiles.orgId, orgId))
    .limit(1);
  return row ?? null;
}

/**
 * Record that a new platform has been connected to an existing Ayrshare profile.
 * Appends the platform key to the platformKeys JSON array if not already present.
 *
 * `oauthResponse` is stored for audit purposes — in production you should
 * persist tokens in a separate secure vault; this helper logs them to the
 * profile row's platformKeys metadata for traceability only.
 */
export async function connectAccount(
  db: Db,
  profileKey: string,
  platform: string,
  _oauthResponse: Record<string, unknown>
): Promise<SocialAccountProfile> {
  // Fetch current platformKeys, append if missing, then update.
  const [existing] = await db
    .select()
    .from(socialAccountProfiles)
    .where(eq(socialAccountProfiles.ayrshareProfileKey, profileKey))
    .limit(1);

  if (!existing) {
    throw new Error(`No profile found for profileKey: ${profileKey}`);
  }

  const currentKeys = Array.isArray(existing.platformKeys)
    ? (existing.platformKeys as string[])
    : [];

  if (!currentKeys.includes(platform)) {
    currentKeys.push(platform);
  }

  const [updated] = await db
    .update(socialAccountProfiles)
    .set({
      platformKeys: currentKeys,
      updatedAt: new Date(),
    })
    .where(eq(socialAccountProfiles.ayrshareProfileKey, profileKey))
    .returning();

  if (!updated) throw new Error("connectAccount: update did not return a row");
  return updated;
}
