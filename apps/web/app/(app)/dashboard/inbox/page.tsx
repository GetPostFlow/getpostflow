import type { Metadata } from "next";
import InboxClient from "./_inbox-client";

export const metadata: Metadata = {
  title: "Inbox — GetPostFlow",
  description: "All incoming messages, comments, and DMs across your clients' connected social accounts.",
};

interface Props {
  searchParams: Promise<{ client?: string }>;
}

export default async function InboxPage({ searchParams }: Props) {
  const { client } = await searchParams;
  return (
    <div className="px-6 py-6">
      {client && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs"
          style={{ background: "rgba(47,93,98,0.07)", border: "1px solid rgba(47,93,98,0.15)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1a5.5 5.5 0 0 0-5.5 5.5v2L1 10v1h14v-1l-1.5-1.5v-2A5.5 5.5 0 0 0 8 1zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" fill="var(--brand-primary)" />
          </svg>
          <span style={{ color: "var(--brand-primary)", fontWeight: 500 }}>
            Viewing conversations for selected client. Clear client filter to see all.
          </span>
          <a href="/dashboard/inbox" className="ml-auto text-xs underline" style={{ color: "var(--text-muted)" }}>
            Clear filter
          </a>
        </div>
      )}
      <InboxClient />
    </div>
  );
}
