"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@getpostflow/ui/tabs";
import { PLANS, PLAN_ORDER } from "@getpostflow/billing";
import { getBillingInfo, cancelSubscription, downgradeSubscription } from "./actions";

const FEATURE_ROWS = [
  { label: "Connected social accounts", key: "connectedSocialAccountsLimit" as const },
  { label: "Client seats", key: "clientSeatsLimit" as const },
  { label: "Locales", key: "localeLimit" as const },
  { label: "AI text credits / mo", key: "aiTextCredits" as const },
  { label: "AI image credits / mo", key: "aiImageCredits" as const },
  { label: "AI video credits / mo", key: "aiVideoCredits" as const },
  { label: "AI engagement credits / mo", key: "aiEngagementCredits" as const },
  { label: "14-day free trial", special: "trial" },
];

export default function BillingPage() {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    async function loadBillingInfo() {
      try {
        const info = await getBillingInfo();
        setBillingInfo(info);
      } catch (err) {
        console.error("Failed to load billing info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBillingInfo();
  }, []);

  const currentPlanCode = billingInfo?.subscription?.planCode ?? "starter";
  const isTrialing = billingInfo?.trialInfo?.isTrialing ?? false;
  const daysLeftInTrial = billingInfo?.trialInfo?.daysLeftInTrial ?? 0;
  const refundInfo = billingInfo?.refundInfo ?? {};

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel? " + refundInfo.message)) return;
    setCanceling(true);
    try {
      const result = await cancelSubscription();
      alert(result.message);
      // Reload billing info
      const info = await getBillingInfo();
      setBillingInfo(info);
    } catch (err) {
      alert("Failed to cancel subscription: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setCanceling(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading billing information...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          Billing
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your plan and payment information.
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Current Plan
            </h3>
            {isTrialing && (
              <Badge variant="success">Trialing - {daysLeftInTrial} days left</Badge>
            )}
            {!isTrialing && billingInfo?.subscription?.status === "active" && (
              <Badge variant="success">Active</Badge>
            )}
            {billingInfo?.subscription?.status === "canceled" && (
              <Badge variant="danger">Canceled</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
                {PLANS[currentPlanCode]?.name ?? "Unknown Plan"}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {PLANS[currentPlanCode]?.monthlyDisplay}/month
              </p>
              {billingInfo?.subscription?.currentPeriodEnd && (
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  Billing period ends: {new Date(billingInfo.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <a
                href="/dashboard/billing/upgrade"
                className="inline-flex rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 text-center"
                style={{ background: "var(--brand-primary)" }}
              >
                Upgrade plan
              </a>
              <button
                className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-[var(--subtle)]"
                style={{ borderColor: "var(--border-soft)", color: "var(--text-secondary)" }}
                disabled={canceling}
                onClick={handleCancel}
              >
                {canceling ? "Canceling..." : "Cancel subscription"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund Policy Info */}
      <Card style={{ borderColor: "var(--brand-warning)", borderWidth: "1px" }}>
        <CardHeader>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Refund Policy
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {refundInfo.message}
          </p>
          {refundInfo.refundDeadline && (
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Refund deadline: {new Date(refundInfo.refundDeadline).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Available Plans
          </h3>
          <Tabs value={interval} onValueChange={(v) => setInterval(v as "monthly" | "annual")}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">
                Annual
                <Badge variant="success" className="ml-1.5 text-[10px]">Save 17%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.filter((c) => c !== "enterprise").map((code) => {
            const plan = PLANS[code];
            const price = interval === "monthly" ? plan.monthlyDisplay : plan.annualDisplay;
            const isCurrentPlan = code === currentPlanCode;
            return (
              <Card key={code} className={isCurrentPlan ? "ring-2 ring-[var(--brand-primary)]" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {plan.name}
                    </span>
                    {plan.trialDays > 0 && (
                      <Badge variant="success" className="text-[10px]">14-day trial</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2" style={{ color: "var(--brand-primary)" }}>
                    {price}
                  </p>
                  {interval === "annual" && (
                    <p className="text-xs" style={{ color: "var(--brand-success)" }}>
                      Save {plan.savePerYear}/year
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                          <path d="M3 8l4 4 6-7" stroke="var(--brand-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <div
                      className="mt-4 w-full rounded-xl py-2 text-center text-xs font-medium"
                      style={{ background: "var(--subtle)", color: "var(--text-muted)" }}
                    >
                      Current plan
                    </div>
                  ) : (
                    <button
                      className="mt-4 w-full rounded-xl py-2 text-xs font-medium text-white transition hover:opacity-90"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise */}
        <Card className="mt-4">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Enterprise</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Custom pricing · Unlimited accounts · Dedicated support · SSO path
              </p>
            </div>
            <a
              href="mailto:sales@getpostflow.com?subject=Enterprise%20inquiry"
              className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-[var(--subtle)] shrink-0"
              style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
            >
              Contact Sales
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Invoice history placeholder */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Invoice History
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No invoices yet. Invoices will appear here once you start a paid plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
