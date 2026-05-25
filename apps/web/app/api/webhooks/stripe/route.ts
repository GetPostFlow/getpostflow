import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createDb, orgSubscriptions, clients } from "@getpostflow/db";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const db = createDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.orgId;

    if (orgId) {
      // Create or update subscription record
      await db
        .insert(orgSubscriptions)
        .values({
          orgId,
          planCode: session.metadata?.planCode || "starter",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        })
        .onConflictDoUpdate({
          target: orgSubscriptions.orgId,
          set: {
            status: "active",
            planCode: session.metadata?.planCode || "starter",
          },
        });

      // Update client status to trigger onboarding flow
      await db
        .update(clients)
        .set({ status: "intake_pending" })
        .where(eq(clients.orgId, orgId));
    }
  }

  return NextResponse.json({ received: true });
}
