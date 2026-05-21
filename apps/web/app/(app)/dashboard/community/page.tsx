import type { Metadata } from "next";
import CommunityManagementClient from "./_community-client";

export const metadata: Metadata = {
  title: "Community — GetPostFlow",
  description: "Moderation queue, saved reply templates, and follow-up reminders for managing client community engagement.",
};

interface Props {
  searchParams: Promise<{ client?: string }>;
}

export default async function CommunityPage({ searchParams }: Props) {
  const { client } = await searchParams;
  return (
    <div className="px-6 py-6">
      {client && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs"
          style={{ background: "rgba(47,93,98,0.07)", border: "1px solid rgba(47,93,98,0.15)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M5 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm-3 8c0-2.76 2.24-5 5-5 .34 0 .67.03 1 .09V15H2zm7 2v-5a5 5 0 0 1 4 4.9V15h-4z" fill="var(--brand-primary)" />
          </svg>
          <span style={{ color: "var(--brand-primary)", fontWeight: 500 }}>
            Showing moderation queue for selected client.
          </span>
          <a href="/dashboard/community" className="ml-auto text-xs underline" style={{ color: "var(--text-muted)" }}>
            Clear filter
          </a>
        </div>
      )}
      <CommunityManagementClient />
    </div>
  );
}
