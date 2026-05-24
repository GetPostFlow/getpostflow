import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";

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
  const { orgSubscriptions, clients, clientIntakeSubmissions, portalTokens, orgs } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");

  // 1. Update org subscription
  await db
    .update(orgSubscriptions)
    .set({
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(orgSubscriptions.orgId, orgId));

  // 2. Payment-first onboarding: create client from checkout metadata
  const clientEmail = session.metadata?.clientEmail;
  const clientName = session.metadata?.clientName;
  if (clientEmail && clientName) {
    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (org) {
      const slug = clientName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const [client] = await db
        .insert(clients)
        .values({
          orgId: org.id,
          name: clientName.trim(),
          slug,
          status: "intake_pending",
          primaryContactName: clientName.trim(),
          primaryContactEmail: clientEmail,
          targetLocales: ["en"],
        })
        .returning({ id: clients.id, slug: clients.slug });

      if (client) {
        // Create blank intake draft
        await db.insert(clientIntakeSubmissions).values({
          clientId: client.id,
          rawPayload: {},
          isDraft: true,
        });

        // Create portal token for welcome email
        const raw = `${client.id}:${clientEmail}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
        const tokenHash = crypto.createHmac("sha256", process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me").update(raw).digest("hex");
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        await db.insert(portalTokens).values({
          clientId: client.id,
          tokenHash,
          email: clientEmail,
          expiresAt,
        });

        // Send welcome email with intake link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const orgSlug = org.clerkOrgId ?? org.id;
        const magicLink = `${appUrl}/portal/${orgSlug}/${client.slug}/intake?token=${tokenHash}`;

        const resendKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@getpostflow.com";
        if (resendKey && resendKey.length > 10) {
          const html = buildWelcomeEmail({ clientName: clientName.trim(), magicLink });
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: `GetPostFlow <${fromEmail}>`,
              to: [clientEmail],
              subject: "Welcome to GetPostFlow — Let's get started",
              html,
            }),
          }).catch((err) => console.error("[stripe-webhook] Welcome email failed:", err));
        } else {
          console.log(`[stripe-webhook] Welcome email stub for ${clientEmail}:\n${magicLink}`);
        }
      }
    }
  }
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

// ── Email templates ──────────────────────────────────────────────────────────

function buildWelcomeEmail({ clientName, magicLink }: { clientName: string; magicLink: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#f8f9fa;color:#1a1a1a">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2F5D62 0%,#52b788 100%);padding:28px 32px">
      <p style="color:white;font-size:20px;font-weight:700;margin:0">GetPostFlow</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">Social Media Management</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">Welcome, ${clientName}!</h1>
      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px">
        Thank you for joining GetPostFlow. Your payment has been confirmed and your dedicated client portal is ready.
        Please complete your intake form so our team can begin crafting your social media strategy.
      </p>
      <a href="${magicLink}" style="display:inline-block;background:#2F5D62;color:white;text-decoration:none;border-radius:12px;padding:14px 28px;font-size:14px;font-weight:600;margin-bottom:20px">
        Complete Intake Form →
      </a>
      <p style="font-size:12px;color:#9ca3af;margin:0">
        This link is valid for 72 hours.<br>
        If you did not expect this email, you can safely ignore it.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="font-size:11px;color:#9ca3af;margin:0">
        Having trouble? Copy and paste this URL into your browser:<br>
        <span style="word-break:break-all">${magicLink}</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
