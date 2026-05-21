#!/usr/bin/env npx ts-node --esm
/**
 * seed:demo-inbox
 *
 * Creates 5 demo conversations across 3 platforms (Instagram, Facebook, Discord)
 * plus one Reddit monitoring conversation for the Acme Bakery demo client.
 *
 * Requires DATABASE_URL to be set.
 *
 * Usage:
 *   pnpm seed:demo-inbox
 */

import { createDb } from "@getpostflow/db";
import {
  orgs,
  clients,
  conversations,
  messages,
  inboxAssignments,
} from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { classifySentiment, generateSuggestedReply, shouldEscalate } from "@getpostflow/social";

dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

// ─── Demo data ─────────────────────────────────────────────────────────────────

interface DemoMessage {
  handle: string;
  content: string;
  minsAgo: number;
}

interface DemoConversation {
  platform: string;
  platformConversationId: string;
  participantHandle: string;
  messages: DemoMessage[];
}

const DEMO_CONVS: DemoConversation[] = [
  {
    platform: "instagram",
    platformConversationId: "ig-seed-001",
    participantHandle: "@sarah.bakery",
    messages: [
      {
        handle: "@sarah.bakery",
        content: "Hi! I just discovered your bakery on Instagram and I'm obsessed! 😍",
        minsAgo: 35,
      },
      {
        handle: "@sarah.bakery",
        content: "Love your new sourdough collection! Do you deliver to Brooklyn?",
        minsAgo: 5,
      },
    ],
  },
  {
    platform: "facebook",
    platformConversationId: "fb-seed-002",
    participantHandle: "Mike T.",
    messages: [
      {
        handle: "Mike T.",
        content: "I ordered a birthday cake for yesterday and it arrived completely wrong.",
        minsAgo: 50,
      },
      {
        handle: "Mike T.",
        content: "My order was wrong and nobody has responded. This is terrible service.",
        minsAgo: 12,
      },
    ],
  },
  {
    platform: "discord",
    platformConversationId: "dc-seed-003",
    participantHandle: "breadlover42",
    messages: [
      {
        handle: "breadlover42",
        content: "What are your hours on Sunday? Are you open for brunch?",
        minsAgo: 28,
      },
    ],
  },
  {
    platform: "reddit",
    platformConversationId: "reddit-seed-004",
    participantHandle: "u/sourdough_fan",
    messages: [
      {
        handle: "u/sourdough_fan",
        content: "Just tried their croissants — absolutely amazing! r/FoodNYC",
        minsAgo: 60,
      },
    ],
  },
  {
    platform: "facebook",
    platformConversationId: "fb-seed-005",
    participantHandle: "Emily R.",
    messages: [
      {
        handle: "Emily R.",
        content: "URGENT: Found a foreign object in my pastry. Need to speak to a manager ASAP.",
        minsAgo: 15,
      },
      {
        handle: "Emily R.",
        content: "Hello? Is anyone there? This is an emergency situation.",
        minsAgo: 8,
      },
      {
        handle: "Emily R.",
        content: "I will be calling the health department if I don't hear back immediately.",
        minsAgo: 3,
      },
    ],
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const db = createDb(DATABASE_URL!);

  // Find or create demo org
  let orgId: string;
  const [existingOrg] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.slug, "acme-bakery"))
    .limit(1);

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log(`✓ Found existing org: ${existingOrg.name} (${orgId})`);
  } else {
    const [newOrg] = await db
      .insert(orgs)
      .values({
        name: "Acme Bakery",
        slug: "acme-bakery",
        planId: "starter",
      })
      .returning({ id: orgs.id });
    orgId = newOrg!.id;
    console.log(`✓ Created org: Acme Bakery (${orgId})`);
  }

  // Find or create demo client
  let clientId: string;
  const [existingClient] = await db
    .select()
    .from(clients)
    .where(eq(clients.orgId, orgId))
    .limit(1);

  if (existingClient) {
    clientId = existingClient.id;
    console.log(`✓ Found existing client: ${existingClient.name} (${clientId})`);
  } else {
    const [newClient] = await db
      .insert(clients)
      .values({
        orgId,
        name: "Acme Bakery",
        contactEmail: "demo@acmebakery.com",
        status: "active",
      })
      .returning({ id: clients.id });
    clientId = newClient!.id;
    console.log(`✓ Created client: Acme Bakery (${clientId})`);
  }

  // Remove existing seed conversations to allow re-running
  const existingSeedConvIds = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.clientId, clientId));

  if (existingSeedConvIds.length > 0) {
    for (const { id } of existingSeedConvIds) {
      await db.delete(messages).where(eq(messages.conversationId, id));
      await db.delete(inboxAssignments).where(eq(inboxAssignments.conversationId, id));
    }
    // Delete conversations
    for (const { id } of existingSeedConvIds) {
      await db.delete(conversations).where(eq(conversations.id, id));
    }
    console.log(`✓ Cleared ${existingSeedConvIds.length} existing seed conversations`);
  }

  // Insert demo conversations + messages
  let convCount = 0;
  let msgCount = 0;

  for (const demo of DEMO_CONVS) {
    const isReddit = demo.platform === "reddit";
    const lastMsg = demo.messages[demo.messages.length - 1]!;
    const lastMsgAt = new Date(Date.now() - lastMsg.minsAgo * 60 * 1000);

    // Determine overall priority from last message
    const { sentiment: lastSentiment } = classifySentiment(lastMsg.content);
    const priority =
      lastSentiment === "urgent" ? "urgent"
      : lastSentiment === "negative" ? "high"
      : "normal";

    const [conv] = await db
      .insert(conversations)
      .values({
        clientId,
        platform: demo.platform,
        platformConversationId: demo.platformConversationId,
        participantHandle: demo.participantHandle,
        status: "open",
        priority,
        sentimentSummary: lastSentiment,
        lastMessageAt: lastMsgAt,
      })
      .returning({ id: conversations.id });

    const convId = conv!.id;
    convCount++;

    for (const msg of demo.messages) {
      const { sentiment, confidence } = classifySentiment(msg.content);
      const suggestedReply = generateSuggestedReply(
        msg.content,
        sentiment,
        demo.platform,
        "Acme Bakery"
      );
      const escalate = shouldEscalate(sentiment);
      const msgStatus = escalate ? "escalated" : "unread";

      await db.insert(messages).values({
        conversationId: convId,
        platformMessageId: `seed-${demo.platformConversationId}-${crypto.randomUUID().slice(0, 8)}`,
        direction: "inbound",
        content: msg.content,
        senderHandle: msg.handle,
        sentiment,
        aiSuggestedReply: isReddit ? "Manual response required — community guidelines" : suggestedReply,
        aiConfidence: isReddit ? 0 : confidence,
        status: msgStatus,
        createdAt: new Date(Date.now() - msg.minsAgo * 60 * 1000),
      });

      msgCount++;
    }

    console.log(
      `  ✓ ${demo.platform.padEnd(12)} | ${demo.participantHandle.padEnd(24)} | ${demo.messages.length} message(s) | priority=${priority}`
    );
  }

  console.log(`\n✅ Seeded ${convCount} conversations with ${msgCount} messages`);
  console.log(`   Demo path: /dashboard/inbox`);
  console.log(`   Platforms: Instagram, Facebook, Discord, Reddit (monitoring only)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
