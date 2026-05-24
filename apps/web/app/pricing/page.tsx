"use client";

import { useState } from "react";
import { PLANS, PLAN_ORDER } from "@getpostflow/billing";
import { Badge } from "@getpostflow/ui/badge";

// Content counts per plan (replaces AI credits language)
const CONTENT_COUNTS: Record<string, { posts: string; videos: string }> = {
  starter:     { posts: "10 posts/mo",       videos: "2 videos/mo" },
  growth:      { posts: "20 posts/mo",       videos: "5 videos/mo" },
  scale:       { posts: "40 posts/mo",       videos: "10 videos/mo" },
  performance: { posts: "80 posts/mo",       videos: "20 videos/mo" },
  enterprise:  { posts: "Unlimited posts",   videos: "Unlimited videos" },
};

const VIDEO_CAPABILITIES = [
  "Short-form video creation & editing (TikTok, YT Shorts, IG Reels)",
  "Viral video optimization: hooks, captions, trending audio suggestions",
  "Video scheduling across all platforms",
  "Repurpose long videos into short clips",
];

const INCLUDED_EVERY_PLAN = [
  "Dedicated strategist who learns your brand",
  "Content calendar planned and executed for you",
  "Community management: replies, DMs, comments handled",
  "Monthly performance reports you actually understand",
  "Client approval workflow: nothing goes live without your okay",
  "14-day free trial (Starter & Growth plans)",
];

const FEATURE_COMPARISON = [
  { label: "Connected social accounts", values: ["4", "8", "15", "30", "Unlimited"] },
  { label: "Client seats", values: ["2", "4", "8", "15", "Unlimited"] },
  { label: "Pieces of content / mo", values: ["10 posts + 2 videos", "20 posts + 5 videos", "40 posts + 10 videos", "80 posts + 20 videos", "Unlimited"] },
  { label: "Locales", values: ["2", "3", "5", "Unlimited", "Unlimited"] },
  { label: "14-day free trial", values: ["✓", "✓", "—", "—", "—"] },
  { label: "Approval workflows", values: ["✓", "✓", "✓", "✓", "✓"] },
  { label: "Direct client publishing", values: ["✓", "✓", "✓", "✓", "✓"] },
  { label: "Community management", values: ["—", "✓", "✓", "✓", "✓"] },
  { label: "Advanced analytics", values: ["—", "—", "✓", "✓", "✓"] },
  { label: "Scheduled email reports", values: ["—", "✓", "✓", "✓", "✓"] },
  { label: "Short-form video creation", values: ["✓", "✓", "✓", "✓", "✓"] },
  { label: "Video scheduling", values: ["✓", "✓", "✓", "✓", "✓"] },
  { label: "API access", values: ["—", "—", "—", "✓", "✓"] },
];

const PLAN_LABELS = ["Starter", "Growth", "Scale", "Performance", "Enterprise"];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function startCheckout(planCode: string) {
    setIsLoading(planCode);
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          interval: billingInterval,
          // For public pricing page we don't have an org yet; the checkout will
          // create a customer and the webhook will handle org resolution via
          // customer metadata or a post-signup flow. In practice this page is
          // visited by authenticated users who have an org.
          orgId: "pending",
          clientEmail: "",
          clientName: "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong. Please try again.");
        setIsLoading(null);
      }
    } catch {
      alert("Network error. Please try again.");
      setIsLoading(null);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F6F2EA", color: "#1A1A1A" }}
    >
      {/* Nav */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "#F6F2EA", borderColor: "#D8CCBA" }}
      >
        <a
          href="/"
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#2F5D62" }}
        >
          GetPostFlow
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/sign-in"
            className="text-sm font-medium hover:opacity-70 transition"
            style={{ color: "#3A3A3A" }}
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#2F5D62" }}
          >
            Start free trial
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            Pricing
          </p>
          <h1
            className="text-4xl font-bold sm:text-5xl mb-4"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-2" style={{ color: "#3A3A3A" }}>
            Done-for-you social media management. Real strategists, real content, real results.
          </p>
          <p className="text-sm" style={{ color: "#5E6472" }}>
            No hidden fees. Cancel anytime. Reddit monitoring included (no automated responses per platform policy).
          </p>

          {/* Billing toggle — more prominent */}
          <div className="mt-10 inline-flex flex-col items-center gap-2">
            <div
              className="inline-flex items-center gap-1 rounded-2xl border p-1.5"
              style={{ borderColor: "#D8CCBA", background: "#EFE7DA" }}
            >
              <button
                onClick={() => setBillingInterval("monthly")}
                className="rounded-xl px-7 py-2.5 text-sm font-semibold transition"
                style={
                  billingInterval === "monthly"
                    ? { background: "#FFFDF9", color: "#2F5D62", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }
                    : { color: "#5E6472" }
                }
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("annual")}
                className="flex items-center gap-2.5 rounded-xl px-7 py-2.5 text-sm font-semibold transition"
                style={
                  billingInterval === "annual"
                    ? { background: "#FFFDF9", color: "#2F5D62", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }
                    : { color: "#5E6472" }
                }
              >
                Annual
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "#2F5D62", color: "#FFFDF9" }}
                >
                  Save 17%
                </span>
              </button>
            </div>
            {billingInterval === "annual" && (
              <p className="text-xs font-medium" style={{ color: "#708B75" }}>
                You save hundreds to thousands per year on annual billing
              </p>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-16 items-start">
          {PLAN_ORDER.map((code) => {
            const plan = PLANS[code];
            const isEnterprise = plan.enterprise;
            const content = CONTENT_COUNTS[code];
            const price = isEnterprise
              ? "Contact sales"
              : billingInterval === "monthly"
              ? plan.monthlyDisplay
              : plan.annualDisplay;

            return (
              <div
                key={code}
                className="flex flex-col rounded-2xl border"
                style={
                  isEnterprise
                    ? {
                        background: "#1A2E30",
                        borderColor: "#2F5D62",
                        boxShadow: "0 4px 24px rgba(47,93,98,0.18)",
                      }
                    : {
                        background: "#FFFDF9",
                        borderColor: code === "growth" ? "#2F5D62" : "#D8CCBA",
                        boxShadow: code === "growth" ? "0 4px 24px rgba(47,93,98,0.14)" : "0 2px 8px rgba(31,36,48,0.05)",
                      }
                }
              >
                {/* Popular badge */}
                {code === "growth" && (
                  <div
                    className="rounded-t-2xl px-4 py-1.5 text-center text-xs font-bold text-white"
                    style={{ background: "#2F5D62" }}
                  >
                    Most popular
                  </div>
                )}
                {isEnterprise && (
                  <div
                    className="rounded-t-2xl px-4 py-1.5 text-center text-xs font-bold"
                    style={{ background: "#2F5D62", color: "#B9A28E" }}
                  >
                    Enterprise
                  </div>
                )}

                <div className="flex flex-col gap-3 p-5">
                  <div>
                    <h2
                      className="text-lg font-bold"
                      style={{ color: isEnterprise ? "#FFFDF9" : "#1A1A1A" }}
                    >
                      {plan.name}
                    </h2>
                    {plan.trialDays > 0 && (
                      <Badge variant="success" className="mt-1.5 text-[11px]">
                        {plan.trialDays}-day free trial
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: isEnterprise ? "#B9A28E" : "#2F5D62" }}
                    >
                      {price}
                    </p>
                    {!isEnterprise && (
                      <>
                        {billingInterval === "annual" && (
                          <p
                            className="text-sm font-semibold mt-1"
                            style={{ color: "#708B75" }}
                          >
                            Save {plan.savePerYear}/year
                          </p>
                        )}
                        {billingInterval === "monthly" && (
                          <p className="text-xs mt-1" style={{ color: "#5E6472" }}>per month</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Content counts */}
                  <div
                    className="rounded-xl p-3 flex flex-col gap-1"
                    style={{
                      background: isEnterprise ? "rgba(255,253,249,0.08)" : "#F6F2EA",
                      border: `1px solid ${isEnterprise ? "rgba(255,253,249,0.12)" : "#EFE7DA"}`,
                    }}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: isEnterprise ? "#B9A28E" : "#8C6A43" }}
                    >
                      Content included
                    </p>
                    <p className="text-sm font-semibold" style={{ color: isEnterprise ? "#FFFDF9" : "#1A1A1A" }}>
                      {content.posts}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: isEnterprise ? "#FFFDF9" : "#1A1A1A" }}>
                      {content.videos}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-1.5">
                    {plan.features.slice(0, 6).map((f) => {
                      // Strip AI/credit language for display
                      const clean = f
                        .replace(/\d+\s+AI\s+(text|image|video|engagement)\s+credits?\s*\/?\s*(month|mo)?/gi, "")
                        .replace(/\s{2,}/g, " ")
                        .trim();
                      if (!clean || clean.length < 4) return null;
                      return (
                        <li key={f} className="flex items-start gap-2.5">
                          <svg
                            width="15" height="15" viewBox="0 0 16 16" fill="none"
                            className="mt-0.5 shrink-0"
                          >
                            <path d="M3 8l4 4 6-7" stroke="#708B75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span
                            className="text-xs leading-snug"
                            style={{ color: isEnterprise ? "rgba(255,253,249,0.85)" : "#3A3A3A" }}
                          >
                            {clean}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  {isEnterprise ? (
                    <a
                      href="mailto:sales@getpostflow.com?subject=Enterprise%20inquiry"
                      className="block w-full rounded-xl border py-2.5 text-center text-sm font-semibold transition hover:bg-[rgba(255,253,249,0.1)]"
                      style={{ borderColor: "#B9A28E", color: "#B9A28E" }}
                    >
                      Contact Sales
                    </a>
                  ) : plan.trialDays > 0 ? (
                    <button
                      onClick={() => startCheckout(code)}
                      disabled={isLoading === code}
                      className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      style={{ background: "#2F5D62" }}
                    >
                      {isLoading === code ? "Redirecting…" : "Start free trial"}
                    </button>
                  ) : (
                    <button
                      onClick={() => startCheckout(code)}
                      disabled={isLoading === code}
                      className="block w-full rounded-xl border py-2.5 text-center text-sm font-semibold transition hover:bg-[#EFE7DA] disabled:opacity-50"
                      style={{ borderColor: "#2F5D62", color: "#2F5D62" }}
                    >
                      {isLoading === code ? "Redirecting…" : "Get started"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* What's included in every plan */}
        <div
          className="rounded-3xl p-8 md:p-12 mb-16"
          style={{ background: "#2F5D62", color: "#FFFDF9" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#B9A28E" }}>
            No matter which plan you choose
          </p>
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif" }}
          >
            What's included in every plan
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INCLUDED_EVERY_PLAN.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <svg
                  width="18" height="18" viewBox="0 0 18 18" fill="none"
                  className="mt-0.5 shrink-0"
                >
                  <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.12)" />
                  <path d="M5 9l3 3 5-5" stroke="#B9A28E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm leading-6" style={{ color: "rgba(255,253,249,0.9)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video capabilities */}
        <div
          className="rounded-2xl border p-8 md:p-10 mb-16"
          style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            Video content
          </p>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Short-form video, fully managed
          </h2>
          <p className="text-sm mb-8" style={{ color: "#5E6472" }}>
            Every plan includes video creation and editing for TikTok, Instagram Reels, and YouTube Shorts.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {VIDEO_CAPABILITIES.map((cap) => (
              <div key={cap} className="flex items-start gap-3">
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="mt-0.5 shrink-0"
                >
                  <path d="M3 8l4 4 6-7" stroke="#2F5D62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm leading-6" style={{ color: "#3A3A3A" }}>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Full feature comparison
          </h2>
          <div
            className="overflow-x-auto rounded-2xl border"
            style={{ borderColor: "#D8CCBA", background: "#FFFDF9" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "#D8CCBA" }}>
                  <th className="text-left px-6 py-4 font-semibold w-52" style={{ color: "#1A1A1A" }}>
                    Feature
                  </th>
                  {PLAN_LABELS.map((l) => (
                    <th key={l} className="text-center px-4 py-4 font-semibold" style={{ color: "#2F5D62" }}>
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
                      borderColor: "#EFE7DA",
                      background: i % 2 === 0 ? "transparent" : "rgba(239,231,218,0.3)",
                    }}
                  >
                    <td className="px-6 py-3.5 font-medium" style={{ color: "#1A1A1A" }}>
                      {row.label}
                    </td>
                    {row.values.map((val, vi) => (
                      <td
                        key={vi}
                        className="text-center px-4 py-3.5"
                        style={{ color: val === "—" ? "#C0B8AD" : "#1A1A1A" }}
                      >
                        {val === "✓" ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
                            <path d="M3 8l4 4 6-7" stroke="#708B75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-12">
          {[
            {
              title: "Starter & Growth: 14-day trial",
              body: "No credit card required to start. Explore all features of your chosen plan during the trial. A card is required to continue after trial.",
            },
            {
              title: "Reddit: monitoring only",
              body: "Reddit does not permit automated responses. GetPostFlow includes Reddit for content monitoring and alert workflows only. Replies are always manual.",
            },
            {
              title: "Connected social accounts",
              body: 'One "connected social account" = one platform profile per client brand. e.g. one Instagram page counts as one account toward your plan limit.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border p-6"
              style={{ borderColor: "#D8CCBA", background: "#FFFDF9" }}
            >
              <h3 className="text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                {item.title}
              </h3>
              <p className="text-xs leading-5" style={{ color: "#5E6472" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div
          className="rounded-2xl px-8 py-12 text-center"
          style={{ background: "#1A2E30", color: "#FFFDF9" }}
        >
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif" }}
          >
            Need a custom solution?
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,253,249,0.8)" }}>
            Enterprise plans include custom content volumes, dedicated onboarding, white-label reporting, and SLA guarantees.
          </p>
          <a
            href="mailto:sales@getpostflow.com?subject=Enterprise%20inquiry"
            className="inline-flex rounded-xl px-7 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ background: "#B9A28E", color: "#1A1A1A" }}
          >
            Contact Sales
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-6 py-8 text-center text-xs"
        style={{ borderColor: "#D8CCBA", color: "#5E6472", background: "#F6F2EA" }}
      >
        © 2025 GetPostFlow. All prices in USD. Prices may vary by region.
      </footer>
    </div>
  );
}
