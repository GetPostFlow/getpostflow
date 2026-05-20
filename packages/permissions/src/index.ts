export const internalRoles = [
  "org_owner",
  "org_admin",
  "strategist",
  "content_manager",
  "community_manager",
  "analyst",
  "support"
] as const;

export const clientRoles = [
  "client_owner",
  "client_admin",
  "client_reviewer",
  "client_viewer"
] as const;

export const roleGroups = [
  {
    label: "Internal roles",
    roles: [...internalRoles]
  },
  {
    label: "Client roles",
    roles: [...clientRoles]
  }
] as const;

export const featureFlags = [
  "community_management_enabled",
  "video_generation_enabled",
  "advanced_analytics_enabled",
  "direct_client_publishing_enabled",
  "scheduled_email_reports_enabled",
  "multilingual_enabled"
] as const;
