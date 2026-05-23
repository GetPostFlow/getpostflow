"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface Props {
  clientFilter?: string;
  clients: Client[];
}

export function CreateContentButton({ clientFilter, clients }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // If a client is already filtered, navigate directly
  function handleClick() {
    if (clientFilter) {
      router.push(`/dashboard/clients/${clientFilter}/content/new`);
      return;
    }
    if (clients.length === 1) {
      router.push(`/dashboard/clients/${clients[0].id}/content/new`);
      return;
    }
    setOpen((prev) => !prev);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        style={{ background: "var(--brand-primary)" }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Create Content
      </button>

      {open && clients.length > 1 && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border shadow-lg py-1"
          style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
        >
          <p
            className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Select a client
          </p>
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setOpen(false);
                router.push(`/dashboard/clients/${c.id}/content/new`);
              }}
              className="w-full text-left px-3 py-2 text-sm transition hover:bg-[var(--subtle)]"
              style={{ color: "var(--text-primary)" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {open && clients.length === 0 && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border shadow-lg p-3 text-xs"
          style={{ background: "var(--surface)", borderColor: "var(--border-soft)", color: "var(--text-muted)" }}
        >
          No clients yet.{" "}
          <a href="/dashboard/clients/new" style={{ color: "var(--brand-primary)" }}>
            Create a client first.
          </a>
        </div>
      )}
    </div>
  );
}
