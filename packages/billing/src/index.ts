export type PlanDefinition = {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  connectedSocialAccounts: number;
  clientSeats: number;
  locales: number | "custom";
  aiTextCredits: number | "custom";
  aiImageCredits: number | "custom";
  aiVideoCredits: number | "custom";
  aiEngagementCredits: number | "custom";
  enterprise?: boolean;
};

export const plans: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: "$249/mo billed monthly",
    annualPrice: "$207/mo billed annually ($2,484/year)",
    connectedSocialAccounts: 4,
    clientSeats: 2,
    locales: 2,
    aiTextCredits: 120,
    aiImageCredits: 18,
    aiVideoCredits: 1,
    aiEngagementCredits: 100
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: "$449/mo billed monthly",
    annualPrice: "$374/mo billed annually ($4,488/year)",
    connectedSocialAccounts: 8,
    clientSeats: 4,
    locales: 3,
    aiTextCredits: 350,
    aiImageCredits: 50,
    aiVideoCredits: 4,
    aiEngagementCredits: 450
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: "$799/mo billed monthly",
    annualPrice: "$666/mo billed annually ($7,992/year)",
    connectedSocialAccounts: 14,
    clientSeats: 8,
    locales: 5,
    aiTextCredits: 800,
    aiImageCredits: 110,
    aiVideoCredits: 8,
    aiEngagementCredits: 1500
  },
  {
    id: "performance",
    name: "Performance",
    monthlyPrice: "$1,299/mo billed monthly",
    annualPrice: "$1,082/mo billed annually ($12,984/year)",
    connectedSocialAccounts: 20,
    clientSeats: 15,
    locales: 5,
    aiTextCredits: 1800,
    aiImageCredits: 220,
    aiVideoCredits: 15,
    aiEngagementCredits: 4000
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Contact sales",
    annualPrice: "Quote only",
    connectedSocialAccounts: 0,
    clientSeats: 0,
    locales: "custom",
    aiTextCredits: "custom",
    aiImageCredits: "custom",
    aiVideoCredits: "custom",
    aiEngagementCredits: "custom",
    enterprise: true
  }
];

export * from "./add-ons";
