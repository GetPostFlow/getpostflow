/**
 * Ably realtime stub for GetPostFlow Phase 5.
 *
 * When NEXT_PUBLIC_ABLY_PUBLISHABLE_KEY is set, this attempts a real Ably
 * connection (Ably SDK must be installed: pnpm add ably --filter @getpostflow/web).
 * When not set (stub mode), operations are no-ops that log a warning once.
 *
 * Channel naming convention: `inbox:{orgId}` per org.
 * Events:
 *   - new_conversation   { conversationId, platform, participantHandle, ... }
 *   - new_message        { conversationId, messageId, direction, content, ... }
 *   - conversation_updated { conversationId, status, priority, ... }
 *   - typing_indicator   { userId, conversationId, isTyping }
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

export type AblyInboxEvent =
  | "new_conversation"
  | "new_message"
  | "conversation_updated"
  | "typing_indicator";

export interface AblyMessagePayload {
  conversationId: string;
  [key: string]: unknown;
}

type EventHandler = (payload: AblyMessagePayload) => void;

interface InboxChannelHandle {
  unsubscribe: () => void;
}

// ── React hook ────────────────────────────────────────────────────────────────

export interface UseInboxChannelOptions {
  orgId: string;
  onNewConversation?: EventHandler;
  onNewMessage?: EventHandler;
  onConversationUpdated?: EventHandler;
  onTypingIndicator?: EventHandler;
}

/**
 * Subscribe to inbox realtime events for an org.
 *
 * Falls back to stub (no-op) when NEXT_PUBLIC_ABLY_PUBLISHABLE_KEY is not set.
 * If Ably SDK is installed and a key is present, uses a real Ably connection.
 */
export function useInboxChannel({
  orgId,
  onNewConversation,
  onNewMessage,
  onConversationUpdated,
  onTypingIndicator,
}: UseInboxChannelOptions) {
  const channelRef = useRef<InboxChannelHandle | null>(null);
  const warnedRef = useRef(false);

  const connect = useCallback(async () => {
    const publishableKey =
      typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_ABLY_PUBLISHABLE_KEY
        : undefined;

    if (!publishableKey) {
      // Stub mode — no Ably key configured
      if (!warnedRef.current) {
        console.warn(
          "[Ably] NEXT_PUBLIC_ABLY_PUBLISHABLE_KEY not set — running in stub mode. Realtime updates disabled."
        );
        warnedRef.current = true;
      }
      channelRef.current = { unsubscribe: () => {} };
      return;
    }

    // Attempt real Ably connection — SDK optional
    try {
      // Dynamic require keeps the build working even when ably is not installed.
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const AblyLib = require("ably") as {
        Realtime: new (opts: { key: string }) => {
          channels: {
            get: (name: string) => {
              subscribe: (event: string, cb: (msg: { data: unknown }) => void) => void;
              unsubscribe: () => void;
            };
          };
        };
      };

      const client = new AblyLib.Realtime({ key: publishableKey });
      const channel = client.channels.get(`inbox:${orgId}`);

      if (onNewConversation) {
        channel.subscribe("new_conversation", (msg) => {
          onNewConversation(msg.data as AblyMessagePayload);
        });
      }
      if (onNewMessage) {
        channel.subscribe("new_message", (msg) => {
          onNewMessage(msg.data as AblyMessagePayload);
        });
      }
      if (onConversationUpdated) {
        channel.subscribe("conversation_updated", (msg) => {
          onConversationUpdated(msg.data as AblyMessagePayload);
        });
      }
      if (onTypingIndicator) {
        channel.subscribe("typing_indicator", (msg) => {
          onTypingIndicator(msg.data as AblyMessagePayload);
        });
      }

      channelRef.current = {
        unsubscribe: () => channel.unsubscribe(),
      };
    } catch {
      // Ably SDK not installed or connection failed — degrade silently
      if (!warnedRef.current) {
        console.warn("[Ably] SDK not installed or connection failed. Realtime disabled.");
        warnedRef.current = true;
      }
      channelRef.current = { unsubscribe: () => {} };
    }
  }, [orgId, onNewConversation, onNewMessage, onConversationUpdated, onTypingIndicator]);

  useEffect(() => {
    void connect();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [connect]);
}
