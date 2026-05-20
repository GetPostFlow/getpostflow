export type PlanCode = "starter" | "growth" | "scale" | "performance" | "enterprise";
export type BillingInterval = "monthly" | "annual";

export type PlanDefinition = {
  code: PlanCode;
  name: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  monthlyDisplay: string;
  annualDisplay: string;
  annualTotal: string;
  savePerYear: string;
  connectedSocialAccountsLimit: number;
  clientSeatsLimit: number;
  localeLimit: number | "unlimited";
  aiTextCredits: number | "custom";
  aiImageCredits: number | "custom";
  aiVideoCredits: number | "custom";
  aiEngagementCredits: number | "custom";
  trialDays: number;
  enterprise?: boolean;
  features: string[];
};

export type Entitlements = {
  connectedSocialAccountsLimit: number;
  clientSeatsLimit: number;
  localeLimit: number;
  aiTextCredits: number;
  aiImageCredits: number;
  aiVideoCredits: number;
  aiEngagementCredits: number;
  trialDays: number;
  canUseCommunityManagement: boolean;
  canUseVideoGeneration: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseDirectClientPublishing: boolean;
  canUseScheduledEmailReports: boolean;
  canUseMultilingual: boolean;
};

// Monthly * 12 * 0.83 ≈ 17% annual discount
export const PLANS: Record<PlanCode, PlanDefinition> = {
  starter: {
    code: "starter",
    name: "Starter",
    monthlyPriceCents: 24900,
    annualPriceCents: 20700,
    monthlyDisplay: "$249/mo",
    annualDisplay: "$207/mo",
    annualTotal: "$2,484/year",
    savePerYear: "$504",
    connectedSocialAccountsLimit: 4,
    clientSeatsLimit: 2,
    localeLimit: 2,
    aiTextCredits: 120,
    aiImageCredits: 18,
    aiVideoCredits: 1,
    aiEngagementCredits: 100,
    trialDays: 14,
    features: [
      "Up to 4 connected social accounts",
      "2 client seats",
      "120 AI text credits / month",
      "18 AI image credits / month",
      "1 AI video credit / month",
      "100 AI engagement credits / month",
      "2 locales",
      "Approval workflows",
      "Direct client publishing",
      "Basic analytics",
      "CSV export",
    ],
  },
  growth: {
    code: "growth",
    name: "Growth",
    monthlyPriceCents: 44900,
    annualPriceCents: 37400,
    monthlyDisplay: "$449/mo",
    annualDisplay: "$374/mo",
    annualTotal: "$4,488/year",
    savePerYear: "$900",
    connectedSocialAccountsLimit: 8,
    clientSeatsLimit: 4,
    localeLimit: 3,
    aiTextCredits: 350,
    aiImageCredits: 50,
    aiVideoCredits: 4,
    aiEngagementCredits: 450,
    trialDays: 14,
    features: [
      "Up to 8 connected social accounts",
      "4 client seats",
      "350 AI text credits / month",
      "50 AI image credits / month",
      "4 AI video credits / month",
      "450 AI engagement credits / month",
      "3 locales",
      "Client portal analytics",
      "CSV + branded PDF export",
      "Scheduled email reports",
      "Moderate automation",
    ],
  },
  scale: {
    code: "scale",
    name: "Scale",
    monthlyPriceCents: 79900,
    annualPriceCents: 66600,
    monthlyDisplay: "$799/mo",
    annualDisplay: "$666/mo",
    annualTotal: "$7,992/year",
    savePerYear: "$1,596",
    connectedSocialAccountsLimit: 15,
    clientSeatsLimit: 8,
    localeLimit: 5,
    aiTextCredits: 800,
    aiImageCredits: 110,
    aiVideoCredits: 8,
    aiEngagementCredits: 1500,
    trialDays: 0,
    features: [
      "Up to 15 connected social accounts",
      "8 client seats",
      "800 AI text credits / month",
      "110 AI image credits / month",
      "8 AI video credits / month",
      "1,500 AI engagement credits / month",
      "5 locales",
      "Advanced analytics",
      "Scheduled reports",
      "Approval automation rules",
    ],
  },
  performance: {
    code: "performance",
    name: "Performance",
    monthlyPriceCents: 129900,
    annualPriceCents: 108200,
    monthlyDisplay: "$1,299/mo",
    annualDisplay: "$1,082/mo",
    annualTotal: "$12,984/year",
    savePerYear: "$2,604",
    connectedSocialAccountsLimit: 30,
    clientSeatsLimit: 15,
    localeLimit: 999,
    aiTextCredits: 1800,
    aiImageCredits: 220,
    aiVideoCredits: 15,
    aiEngagementCredits: 4000,
    trialDays: 0,
    features: [
      "Up to 30 connected social accounts",
      "15 client seats",
      "1,800 AI text credits / month",
      "220 AI image credits / month",
      "15 AI video credits / month",
      "4,000 AI engagement credits / month",
      "All launch locales",
      "Advanced dashboards",
      "Stronger automation controls",
      "Account-level policy customization",
    ],
  },
  enterprise: {
    code: "enterprise",
    name: "Enterprise",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    monthlyDisplay: "Contact sales",
    annualDisplay: "Quote only",
    annualTotal: "Custom",
    savePerYear: "Custom",
    connectedSocialAccountsLimit: 999999,
    clientSeatsLimit: 999999,
    localeLimit: "unlimited",
    aiTextCredits: 999999,
    aiImageCredits: 999999,
    aiVideoCredits: 999999,
    aiEngagementCredits: 999999,
    trialDays: 0,
    enterprise: true,
    features: [
      "Custom connected social accounts",
      "Custom seats",
      "Custom AI / video bundles",
      "Negotiated support and automation policies",
      "Future SSO / SAML path",
    ],
  },
};

export const PLAN_ORDER: PlanCode[] = [
  "starter",
  "growth",
  "scale",
  "performance",
  "enterprise",
];

export function getEntitlements(planCode: string): Entitlements {
  const plan = PLANS[planCode as PlanCode] ?? PLANS.starter;
  const localeLimit =
    plan.localeLimit === "unlimited" ? 999 : (plan.localeLimit as number);

  return {
    connectedSocialAccountsLimit: plan.connectedSocialAccountsLimit,
    clientSeatsLimit: plan.clientSeatsLimit,
    localeLimit,
    aiTextCredits:
      plan.aiTextCredits === "custom" ? 999999 : (plan.aiTextCredits as number),
    aiImageCredits:
      plan.aiImageCredits === "custom"
        ? 999999
        : (plan.aiImageCredits as number),
    aiVideoCredits:
      plan.aiVideoCredits === "custom"
        ? 999999
        : (plan.aiVideoCredits as number),
    aiEngagementCredits:
      plan.aiEngagementCredits === "custom"
        ? 999999
        : (plan.aiEngagementCredits as number),
    trialDays: plan.trialDays,
    canUseCommunityManagement: planCode !== "starter",
    canUseVideoGeneration: true,
    canUseAdvancedAnalytics:
      planCode === "scale" ||
      planCode === "performance" ||
      planCode === "enterprise",
    canUseDirectClientPublishing: true,
    canUseScheduledEmailReports:
      planCode !== "starter",
    canUseMultilingual: true,
  };
}

export function checkConnectedAccountsLimit(
  planCode: string,
  currentCount: number
): { allowed: boolean; limit: number; current: number } {
  const entitlements = getEntitlements(planCode);
  return {
    allowed: currentCount < entitlements.connectedSocialAccountsLimit,
    limit: entitlements.connectedSocialAccountsLimit,
    current: currentCount,
  };
}

export * from "./add-ons";
