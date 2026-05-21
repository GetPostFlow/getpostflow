"use client";

import { useState } from "react";

interface Props {
  clientId: string;
}

export function PortalLinkButton({ clientId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const appUrl = window.location.origin;
      const url = `${appUrl}/api/portal/test-token?clientId=${encodeURIComponent(clientId)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      style={{ background: "var(--brand-primary)" }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {loading ? "Opening…" : "View Client Portal"}
    </button>
  );
}
