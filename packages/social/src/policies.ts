export const autoEngagementDefaults = [
  {
    category: "faq",
    defaultHandling: "auto-allowed",
    notes: "Requires high brand confidence and moderation pass"
  },
  {
    category: "positive-engagement",
    defaultHandling: "auto-allowed",
    notes: "Short appreciation and simple replies allowed"
  },
  {
    category: "lead-qualification",
    defaultHandling: "suggest-and-approve",
    notes: "Human approval required before send"
  },
  {
    category: "negative-sentiment",
    defaultHandling: "hard-block",
    notes: "Escalate to human immediately"
  },
  {
    category: "complaints-refunds",
    defaultHandling: "hard-block",
    notes: "Never auto-respond"
  },
  {
    category: "billing-dispute",
    defaultHandling: "hard-block",
    notes: "Never auto-respond"
  },
  {
    category: "legal-regulatory",
    defaultHandling: "hard-block",
    notes: "Never auto-respond"
  },
  {
    category: "medical-financial",
    defaultHandling: "hard-block",
    notes: "Off by default in v1"
  },
  {
    category: "unclear-edge-case",
    defaultHandling: "suggest-and-approve",
    notes: "Fallback when confidence is low"
  },
  {
    category: "reddit-override",
    defaultHandling: "suggest-and-approve",
    notes: "All Reddit interactions require human approval in v1"
  }
] as const;
