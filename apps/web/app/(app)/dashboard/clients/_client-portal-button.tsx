"use client";

import { useState } from "react";

interface Props {
  clientId: string;
}

export function ClientPortalButton({ clientId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const url = `/api/portal/test-token?clientId=${encodeURIComponent(clientId)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="View Client Portal"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition hover:opacity-90 disabled:opacity-60"
      style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)", background: "var(--surface)" }}
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Portal
    </button>
  );
}
