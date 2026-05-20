import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    if (type === "user.created") {
      await syncUserCreated(data as UserCreatedData);
    } else if (type === "user.updated") {
      await syncUserUpdated(data as UserUpdatedData);
    } else if (type === "organization.created") {
      await syncOrgCreated(data as OrgCreatedData);
    } else if (type === "organizationMembership.created") {
      await syncOrgMembershipCreated(data as OrgMembershipData);
    } else if (type === "organizationMembership.deleted") {
      await syncOrgMembershipDeleted(data as OrgMembershipData);
    }
  } catch (err) {
    console.error(`[clerk-webhook] Error processing event ${type}:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type UserCreatedData = {
  id: string;
  email_addresses: { email_address: string; id: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
};

type UserUpdatedData = UserCreatedData;

type OrgCreatedData = {
  id: string;
  name: string;
  created_by: string;
};

type OrgMembershipData = {
  id: string;
  organization: { id: string };
  public_user_data: { user_id: string };
  role: string;
};

// ── DB sync helpers ───────────────────────────────────────────────────────────

async function syncUserCreated(data: UserCreatedData) {
  const { createDb, users } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");
  const db = createDb();
  const primaryEmail = data.email_addresses[0]?.email_address ?? "";
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  await db
    .insert(users)
    .values({ clerkUserId: data.id, email: primaryEmail, fullName, avatarUrl: data.image_url })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email: primaryEmail, fullName, avatarUrl: data.image_url },
    });

  void eq; // imported for potential future use
}

async function syncUserUpdated(data: UserUpdatedData) {
  return syncUserCreated(data);
}

async function syncOrgCreated(data: OrgCreatedData) {
  const { createDb, orgs, orgSubscriptions } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");
  const db = createDb();

  await db
    .insert(orgs)
    .values({ clerkOrgId: data.id, name: data.name })
    .onConflictDoUpdate({ target: orgs.clerkOrgId, set: { name: data.name } });

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, data.id))
    .limit(1);

  if (org) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    await db
      .insert(orgSubscriptions)
      .values({ orgId: org.id, planCode: "starter", status: "trialing", billingInterval: "monthly", trialEndsAt })
      .onConflictDoNothing();
  }
}

async function syncOrgMembershipCreated(data: OrgMembershipData) {
  const roleMap: Record<string, string> = {
    "org:admin": "org_admin",
    "org:member": "strategist",
    org_admin: "org_admin",
    org_member: "strategist",
  };
  const mappedRole = roleMap[data.role] ?? "support";

  const { createDb, orgs, users, orgMemberships } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");
  const db = createDb();

  const [org] = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.clerkOrgId, data.organization.id)).limit(1);
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, data.public_user_data.user_id)).limit(1);

  if (org && user) {
    await db
      .insert(orgMemberships)
      .values({ orgId: org.id, userId: user.id, role: mappedRole as "org_admin" | "strategist" | "support" | "org_owner" | "content_manager" | "community_manager" | "analyst" | "client_owner" | "client_admin" | "client_reviewer" | "client_viewer" })
      .onConflictDoNothing();
  }
}

async function syncOrgMembershipDeleted(data: OrgMembershipData) {
  const { createDb, orgs, users, orgMemberships } = await import("@getpostflow/db");
  const { eq, and } = await import("drizzle-orm");
  const db = createDb();

  const [org] = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.clerkOrgId, data.organization.id)).limit(1);
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, data.public_user_data.user_id)).limit(1);

  if (org && user) {
    await db
      .delete(orgMemberships)
      .where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.userId, user.id)));
  }
}
