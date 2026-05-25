import { stripe } from "@getpostflow/billing";
import { createDb } from "@getpostflow/db";
import { subscriptionTable, clientTable } from "@getpostflow/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  const db = createDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(db, event.data.object as any);
        break;
      }

      case "customer.subscription.created": {
        await handleSubscriptionCreated(db, event.data.object as any);
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(db, event.data.object as any);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(db, event.data.object as any);
        break;
      }

      case "invoice.payment_succeeded": {
        await handleInvoicePaymentSucceeded(event.data.object as any);
        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(event.data.object as any);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("[stripe-webhook] Error processing webhook:", err);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(db: any, session: any) {
  console.log("[stripe-webhook] Checkout session completed:", session.id);

  const clientId = session.metadata?.clientId;
  if (!clientId) {
    console.warn("[stripe-webhook] No clientId in session metadata");
    return;
  }

  // Update client status to active
  await db
    .update(clientTable)
    .set({ status: "active" })
    .where(eq(clientTable.id, clientId));

  // Create subscription record
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await db.insert(subscriptionTable).values({
      id: `sub_${Date.now()}`,
      clientId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      plan: session.metadata?.plan || "standard",
      status: "active",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log("[stripe-webhook] Client activated and subscription created");
}

async function handleSubscriptionCreated(db: any, subscription: any) {
  console.log("[stripe-webhook] Subscription created:", subscription.id);

  const clientId = subscription.metadata?.clientId;
  if (!clientId) {
    console.warn("[stripe-webhook] No clientId in subscription metadata");
    return;
  }

  await db.insert(subscriptionTable).values({
    id: `sub_${Date.now()}`,
    clientId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    plan: subscription.metadata?.plan || "standard",
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function handleSubscriptionUpdated(db: any, subscription: any) {
  console.log("[stripe-webhook] Subscription updated:", subscription.id);

  await db
    .update(subscriptionTable)
    .set({
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(db: any, subscription: any) {
  console.log("[stripe-webhook] Subscription deleted:", subscription.id);

  await db
    .update(subscriptionTable)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.stripeSubscriptionId, subscription.id));
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log("[stripe-webhook] Invoice payment succeeded:", invoice.id);
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log("[stripe-webhook] Invoice payment failed:", invoice.id);
}
