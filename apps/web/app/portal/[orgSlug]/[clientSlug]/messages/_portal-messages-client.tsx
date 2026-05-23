"use client";

import { useState } from "react";

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  body: string;
  createdAt: string;
}

interface Props {
  clientName: string;
  token: string;
  orgSlug: string;
  clientSlug: string;
  initialMessages: Message[];
}

export default function PortalMessagesClient({
  clientName,
  token,
  orgSlug,
  clientSlug,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(
    [...initialMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  );
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, orgSlug, clientSlug, body: body.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { message: Message };
      setMessages((prev) => [...prev, data.message]);
      setBody("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)", minHeight: "400px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>Messages</h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Chat with your agency team about <strong>{clientName}</strong>.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginTop: "40px" }}>
            No messages yet. Start the conversation below.
          </div>
        )}
        {messages.map((msg) => {
          const isClient = msg.senderType === "client";
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isClient ? "flex-end" : "flex-start",
                maxWidth: "70%",
                background: isClient ? "#2F5D62" : "#f3f4f6",
                color: isClient ? "#fff" : "#1a1a1a",
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  marginBottom: "4px",
                  opacity: 0.8,
                }}
              >
                {msg.senderName}
              </div>
              <div>{msg.body}</div>
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "6px",
                  opacity: 0.6,
                  textAlign: "right",
                }}
              >
                {new Date(msg.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "10px 12px",
        }}
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            background: "transparent",
            color: "#1a1a1a",
          }}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          style={{
            background: "#2F5D62",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: sending || !body.trim() ? "not-allowed" : "pointer",
            opacity: sending || !body.trim() ? 0.6 : 1,
          }}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
