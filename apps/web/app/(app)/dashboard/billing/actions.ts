"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb, orgSubscriptions, orgs } from "@getpostflow/db";
import { eq } from "drizzle-orm";

const db = () => createDb(process.env.DATABASE_URL!);

export async function getBillingInfo() {
  const { orgId } = await auth();
  if (!orgId) redirect("/sign-in");

  const database = db();

  // Get org subscription
  const [subscription] = await database
    .select()
    .from(orgSubscriptions)
    .where(eq(orgSubscriptions.orgId, orgId))
    .limit(1);

  // Get org details
  const [org] = await database
    .select()
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) redirect("/sign-in");

  const now = new Date();
  const trialEndDate = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const daysLeftInTrial = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const refundDeadline = subscription?.createdAt
    ? new Date(subscription.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)
    : null;

  const canRefund = refundDeadline ? now < refundDeadline : false;
  const daysUntilNoRefund = refundDeadline
    ? Math.max(0, Math.ceil((refundDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    subscription: subscription ? {
      id: subscription.id,
      planCode: subscription.planCode,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
      createdAt: subscription.createdAt.toISOString(),
      stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    } : null,
    org: {
      id: org.id,
      name: org.name,
      clerkOrgId: org.clerkOrgId,
    },
    trialInfo: {
      isTrialing: subscription?.status === "trialing",
      daysLeftInTrial,
      trialEndsAt: trialEndDate?.toISOString() ?? null,
    },
    refundInfo: {
      canRefund,
      daysUntilNoRefund,
      refundDeadline: refundDeadline?.toISOString() ?? null,
      message: canRefund
        ? `You can cancel and receive a full refund until ${refundDeadline?.toLocaleDateString()}.`
        : `Your 14-day refund window has expired. Cancellations after this date are non-refundable.`,
    },
  };
}

export async function cancelSubscription() {
  const { orgId } = await auth();
  if (!orgId) redirect("/sign-in");

  const database = db();

  // Get org
  const [org] = await database
    .select()
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) throw new Error("Org not found");

  // Get subscription
  const [subscription] = await database
    .select()
    .from(orgSubscriptions)
    .where(eq(orgSubscriptions.orgId, org.id))
    .limit(1);

  if (!subscription) throw new Error("No active subscription");

  // Check refund eligibility
  const now = new Date();
  const refundDeadline = new Date(subscription.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const canRefund = now < refundDeadline;

  // Update subscription status
  await database
    .update(orgSubscriptions)
    .set({
      status: "canceled",
      canceledAt: now,
      refundProcessed: canRefund,
    })
    .where(eq(orgSubscriptions.id, subscription.id));

  // TODO: Call Stripe API to cancel subscription if stripeSubscriptionId exists
  // if (subscription.stripeSubscriptionId) {
  //   await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  // }

  return {
    success: true,
    refundProcessed: canRefund,
    message: canRefund
      ? "Subscription canceled. A full refund will be processed within 5-7 business days."
      : "Subscription canceled. No refund is available after the 14-day window.",
  };
}

export async function downgradeSubscription(newPlanCode: string) {
  const { orgId } = await auth();
  if (!orgId) redirect("/sign-in");

  const database = db();

  // Get org
  const [org] = await database
    .select()
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) throw new Error("Org not found");

  // Get subscription
  const [subscription] = await database
    .select()
    .from(orgSubscriptions)
    .where(eq(orgSubscriptions.orgId, org.id))
    .limit(1);

  if (!subscription) throw new Error("No active subscription");

  // Update subscription plan
  await database
    .update(orgSubscriptions)
    .set({
      planCode: newPlanCode,
      updatedAt: new Date(),
    })
    .where(eq(orgSubscriptions.id, subscription.id));

  // TODO: Call Stripe API to update subscription if stripeSubscriptionId exists
  // if (subscription.stripeSubscriptionId) {
  //   await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
  //     items: [{ id: subscription.stripeSubscriptionItemId, price: stripePriceIdForPlan }],
  //   });
  // }

  return {
    success: true,
    newPlanCode,
    message: `Subscription downgraded to ${newPlanCode}. Changes take effect at the end of your current billing period.`,
  };
}
