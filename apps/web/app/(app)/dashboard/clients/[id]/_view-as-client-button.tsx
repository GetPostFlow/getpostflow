"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  clientId: string;
  clientSlug: string;
  orgSlug: string;
}

const PORTAL_TABS = [
  { id: "strategy", label: "Brand Strategy", path: "strategy" },
  { id: "content", label: "Content Approval", path: "content" },
  { id: "calendar", label: "Content Calendar", path: "calendar" },
  { id: "notifications", label: "Notifications", path: "notifications" },
  { id: "report", label: "Monthly Report", path: "report" },
] as const;

export function ViewAsClientButton({ clientId, clientSlug, orgSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function openTab(path: string) {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/portal/test-token?clientId=${encodeURIComponent(clientId)}`);
      if (!res.ok) throw new Error("Failed to generate preview token");
      const data = await res.json();
      const url = `/portal/${orgSlug}/${clientSlug}/${path}?token=${data.token}&preview=1`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Could not open portal preview. Please ensure the client has a valid portal token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
        style={{
          border: "1px solid var(--border-soft)",
          background: "var(--surface)",
          color: "var(--text-secondary)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        {loading ? "Opening…" : "View as Client"}
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-soft)",
            minWidth: "180px",
          }}
        >
          <div
            className="px-3 py-2 text-xs font-semibold"
            style={{ color: "var(--text-muted)", background: "var(--subtle)", borderBottom: "1px solid var(--border-soft)" }}
          >
            Open Portal Tab
          </div>
          {PORTAL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => openTab(tab.path)}
              className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:opacity-80 transition"
              style={{ color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
