import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

/**
 * POST /api/stripe/checkout-session
 * Body: { planCode: string; interval?: "monthly" | "annual"; orgId: string; clientEmail: string; clientName: string }
 *
 * Creates a Stripe Checkout session and returns the checkout URL.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planCode, interval = "monthly", orgId, clientEmail, clientName } = body;

    if (!planCode || !orgId || !clientEmail || !clientName) {
      return NextResponse.json(
        { error: "planCode, orgId, clientEmail, and clientName are required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Resolve price ID from plan metadata (stored in Stripe price metadata)
    // Fallback: look up by metadata since we don't have a direct mapping table
    const prices = await stripe.prices.list({
      lookup_keys: [`${planCode}_${interval}`],
      limit: 1,
    });

    let priceId: string | undefined = prices.data[0]?.id;

    // If no lookup key match, try metadata search fallback
    if (!priceId) {
      const allPrices = await stripe.prices.list({ limit: 100, active: true });
      const matched = allPrices.data.find(
        (p) =>
          p.metadata?.planCode === planCode &&
          p.recurring?.interval === (interval === "annual" ? "year" : "month")
      );
      priceId = matched?.id;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price found for plan ${planCode} (${interval})` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: clientEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/portal/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        orgId,
        planCode,
        interval,
        clientEmail,
        clientName,
      },
      subscription_data: {
        metadata: {
          orgId,
          planCode,
          interval,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout-session] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
