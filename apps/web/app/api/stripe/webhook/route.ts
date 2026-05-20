import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const body = await req.text();
  const headerPayload = await headers();
  const sig = headerPayload.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpserted(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error processing event ${event.type}:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function getDb() {
  const { createDb } = await import("@getpostflow/db");
  return createDb();
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId;
  if (!orgId || !session.subscription || !session.customer) return;

  const db = await getDb();
  const { orgSubscriptions } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  await db
    .update(orgSubscriptions)
    .set({
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(orgSubscriptions.orgId, orgId));
}

async function handleSubscriptionUpserted(sub: Stripe.Subscription) {
  const orgId = sub.metadata?.orgId;
  if (!orgId) return;

  const db = await getDb();
  const { orgSubscriptions } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  const item = sub.items.data[0];
  const planCode = item?.price?.metadata?.planCode ?? "starter";
  const interval =
    item?.price?.recurring?.interval === "year" ? "annual" : "monthly";

  const statusMap: Record<string, "active" | "trialing" | "past_due" | "canceled" | "incomplete"> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
  };
  const mappedStatus = statusMap[sub.status] ?? "active";

  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  await db
    .update(orgSubscriptions)
    .set({
      planCode,
      billingInterval: interval,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: item?.price?.id,
      status: mappedStatus,
      trialEndsAt: trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(orgSubscriptions.orgId, orgId));
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const orgId = sub.metadata?.orgId;
  if (!orgId) return;

  const db = await getDb();
  const { orgSubscriptions } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  await db
    .update(orgSubscriptions)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(eq(orgSubscriptions.orgId, orgId));
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const db = await getDb();
  const { orgSubscriptions } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  await db
    .update(orgSubscriptions)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(eq(orgSubscriptions.stripeCustomerId, customerId));
}
