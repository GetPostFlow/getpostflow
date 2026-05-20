import type { Entitlements } from "@getpostflow/billing";

// ── Role definitions ──────────────────────────────────────────────────────────

export const INTERNAL_ROLES = [
  "org_owner",
  "org_admin",
  "strategist",
  "content_manager",
  "community_manager",
  "analyst",
  "support",
] as const;

export const CLIENT_ROLES = [
  "client_owner",
  "client_admin",
  "client_reviewer",
  "client_viewer",
] as const;

export const ALL_ROLES = [...INTERNAL_ROLES, ...CLIENT_ROLES] as const;

export type InternalRole = (typeof INTERNAL_ROLES)[number];
export type ClientRole = (typeof CLIENT_ROLES)[number];
export type OrgRole = InternalRole | ClientRole;

// ── Role hierarchy for RBAC checks ───────────────────────────────────────────

const ROLE_WEIGHT: Record<OrgRole, number> = {
  org_owner: 100,
  org_admin: 90,
  strategist: 70,
  content_manager: 60,
  community_manager: 60,
  analyst: 50,
  support: 40,
  client_owner: 35,
  client_admin: 30,
  client_reviewer: 20,
  client_viewer: 10,
};

export function hasRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return (ROLE_WEIGHT[userRole] ?? 0) >= (ROLE_WEIGHT[requiredRole] ?? 0);
}

// ── requireRole ───────────────────────────────────────────────────────────────

export class PermissionError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "PermissionError";
  }
}

export function requireRole(
  userRole: OrgRole | string,
  requiredRole: OrgRole
): void {
  if (!hasRole(userRole as OrgRole, requiredRole)) {
    throw new PermissionError(
      `Requires role '${requiredRole}', but user has '${userRole}'.`
    );
  }
}

// ── assertEntitlement ─────────────────────────────────────────────────────────

export type EntitlementKey = keyof Entitlements;

export function assertEntitlement(
  entitlements: Entitlements,
  key: EntitlementKey,
  opts?: { current?: number }
): void {
  const value = entitlements[key];

  if (typeof value === "boolean") {
    if (!value) {
      throw new PermissionError(
        `Entitlement '${key}' is not enabled on your current plan. Please upgrade.`
      );
    }
    return;
  }

  if (typeof value === "number" && opts?.current !== undefined) {
    if (opts.current >= value) {
      throw new PermissionError(
        `Entitlement limit reached for '${key}': ${opts.current}/${value}. Please upgrade your plan.`
      );
    }
  }
}

// ── Role groups for UI ────────────────────────────────────────────────────────

export const roleGroups = [
  {
    label: "Internal roles",
    roles: [...INTERNAL_ROLES],
  },
  {
    label: "Client roles",
    roles: [...CLIENT_ROLES],
  },
] as const;

export const featureFlags = [
  "community_management_enabled",
  "video_generation_enabled",
  "advanced_analytics_enabled",
  "direct_client_publishing_enabled",
  "scheduled_email_reports_enabled",
  "multilingual_enabled",
] as const;

export type FeatureFlag = (typeof featureFlags)[number];

// ── internalRoles / clientRoles exports kept for backward compat ──────────────
export const internalRoles = INTERNAL_ROLES;
export const clientRoles = CLIENT_ROLES;
