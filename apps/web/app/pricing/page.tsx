"use client";

import { useState } from "react";
import { PLANS, PLAN_ORDER } from "@getpostflow/billing";
import { Badge } from "@getpostflow/ui/badge";

const FEATURE_COMPARISON = [
  { label: "Connected social accounts", values: ["4", "8", "15", "30", "Unlimited"] },
  { label: "Client seats", values: ["2", "4", "8", "15", "Unlimited"] },
  { label: "Locales", values: ["2", "3", "5", "Unlimited", "Unlimited"] },
  { label: "AI text credits / mo", values: ["120", "350", "800", "1,800", "Custom"] },
  { label: "AI image credits / mo", values: ["18", "50", "110", "220", "Custom"] },
  { label: "AI video credits / mo", values: ["1", "4", "8", "15", "Custom"] },
  { label: "AI engagement credits / mo", values: ["100", "450", "1,500", "4,000", "Custom"] },
  { label: "14-day free trial", values: ["✓", "✓", "—", "—", "—"] },
  { label: "Approval workflows", values: ["✓", "✓", "✓", "✓", "✓"] },
  { label: "Direct client publishing", values: ["✓", "✓", "✓", "✓", "✓"] },
  { label: "Advanced analytics", values: ["—", "—", "✓", "✓", "✓"] },
  { label: "Scheduled email reports", values: ["—", "✓", "✓", "✓", "✓"] },
  { label: "Community management AI", values: ["—", "✓", "✓", "✓", "✓"] },
  { label: "API access", values: ["—", "—", "—", "✓", "✓"] },
  { label: "SSO / SAML", values: ["—", "—", "—", "—", "Roadmap"] },
];

const PLAN_LABELS = ["Starter", "Growth", "Scale", "Performance", "Enterprise"];

export default function PricingPage() {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--canvas)", color: "var(--text-primary)" }}
    >
      {/* Nav */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
      >
        <a
          href="/"
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif", color: "var(--brand-primary)" }}
        >
          GetPostFlow
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/sign-in"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}
          >
            Start free trial
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1
            className="text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg" style={{ color: "var(--text-secondary)" }}>
            Everything your agency needs to manage social communities, create multilingual content, and deliver results.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            No hidden fees. Cancel anytime. Reddit monitoring included (no automated responses per platform policy).
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-2xl border p-1" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
            <button
              onClick={() => setInterval("monthly")}
              className="rounded-xl px-5 py-2 text-sm font-medium transition"
              style={
                interval === "monthly"
                  ? { background: "var(--surface)", color: "var(--brand-primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("annual")}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition"
              style={
                interval === "annual"
                  ? { background: "var(--surface)", color: "var(--brand-primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              Annual
              <Badge variant="success" className="text-[10px]">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-16">
          {PLAN_ORDER.map((code, idx) => {
            const plan = PLANS[code];
            const isEnterprise = plan.enterprise;
            const price = isEnterprise
              ? "Contact sales"
              : interval === "monthly"
              ? plan.monthlyDisplay
              : plan.annualDisplay;

            return (
              <div
                key={code}
                className="flex flex-col rounded-2xl border"
                style={{
                  background: "var(--surface)",
                  borderColor: code === "growth" ? "var(--brand-primary)" : "var(--border-soft)",
                  boxShadow: code === "growth" ? "0 4px 24px rgba(47,93,98,0.12)" : "0 2px 8px rgba(31,36,48,0.05)",
                }}
              >
                {/* Popular badge */}
                {code === "growth" && (
                  <div
                    className="rounded-t-2xl px-4 py-1.5 text-center text-xs font-semibold text-white"
                    style={{ background: "var(--brand-primary)" }}
                  >
                    Most popular
                  </div>
                )}

                <div className="flex flex-col gap-4 p-5 flex-1">
                  <div>
                    <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                      {plan.name}
                    </h2>
                    {plan.trialDays > 0 && (
                      <Badge variant="success" className="mt-1 text-[10px]">
                        {plan.trialDays}-day free trial
                      </Badge>
                    )}
                  </div>

                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: isEnterprise ? "var(--text-secondary)" : "var(--brand-primary)" }}
                    >
                      {price}
                    </p>
                    {!isEnterprise && (
                      <>
                        {interval === "annual" && (
                          <p className="text-xs font-medium" style={{ color: "var(--brand-success)" }}>
                            Save {plan.savePerYear}/year
                          </p>
                        )}
                        {interval === "monthly" && (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>per month</p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="flex flex-col gap-1.5 text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                          <path d="M3 8l4 4 6-7" stroke="var(--brand-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isEnterprise ? (
                    <a
                      href="mailto:sales@getpostflow.com?subject=Enterprise%20inquiry"
                      className="block w-full rounded-xl border py-2.5 text-center text-sm font-medium transition hover:bg-[var(--subtle)]"
                      style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
                    >
                      Contact Sales
                    </a>
                  ) : plan.trialDays > 0 ? (
                    <a
                      href={`/sign-up?plan=${code}`}
                      className="block w-full rounded-xl py-2.5 text-center text-sm font-medium text-white transition hover:opacity-90"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      Start free trial
                    </a>
                  ) : (
                    <a
                      href={`/sign-up?plan=${code}`}
                      className="block w-full rounded-xl py-2.5 text-center text-sm font-medium transition hover:bg-[var(--subtle)]"
                      style={{ borderColor: "var(--border-soft)", border: "1px solid", color: "var(--brand-primary)" }}
                    >
                      Get started
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div>
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif" }}
          >
            Full feature comparison
          </h2>

          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                  <th className="text-left px-5 py-3 font-semibold w-48" style={{ color: "var(--text-primary)" }}>
                    Feature
                  </th>
                  {PLAN_LABELS.map((l) => (
                    <th key={l} className="text-center px-3 py-3 font-semibold" style={{ color: "var(--brand-primary)" }}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, i) => (
                  <tr
                    key={row.label}
                    className="border-b"
                    style={{
                      borderColor: "var(--border-soft)",
                      background: i % 2 === 0 ? "transparent" : "rgba(239,231,218,0.3)",
                    }}
                  >
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      {row.label}
                    </td>
                    {row.values.map((val, vi) => (
                      <td key={vi} className="text-center px-3 py-3" style={{ color: val === "—" ? "var(--text-muted)" : "var(--text-primary)" }}>
                        {val === "✓" ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
                            <path d="M3 8l4 4 6-7" stroke="var(--brand-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : val === "—" ? (
                          <span className="text-base">—</span>
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ notes */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Starter & Growth — 14-day trial
            </h3>
            <p className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
              No credit card required to start. You can explore all features of your chosen plan during the trial period. A card is required to continue after trial.
            </p>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Reddit — monitoring only
            </h3>
            <p className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
              Reddit does not permit automated responses. GetPostFlow includes Reddit for content monitoring and alert workflows only. Replies are always manual.
            </p>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
          >
            <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Connected social accounts
            </h3>
            <p className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
              One "connected social account" = one platform profile per client brand. e.g. one Instagram page counts as one account toward your plan limit.
            </p>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div
          className="mt-12 rounded-2xl px-8 py-10 text-center"
          style={{ background: "var(--brand-primary)", color: "white" }}
        >
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif" }}
          >
            Need more? Talk to us.
          </h2>
          <p className="mt-2 text-sm opacity-90">
            Enterprise plans include custom limits, dedicated onboarding, and SLA guarantees.
          </p>
          <a
            href="mailto:sales@getpostflow.com?subject=Enterprise%20inquiry"
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ color: "var(--brand-primary)" }}
          >
            Contact Sales
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-6 py-8 text-center text-xs"
        style={{ borderColor: "var(--border-soft)", color: "var(--text-muted)" }}
      >
        © 2025 GetPostFlow. All prices in USD. Prices may vary by region.
      </footer>
    </div>
  );
}
