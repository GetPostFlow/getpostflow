"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface ClientOption {
  id: string;
  name: string;
}

interface ClientSwitcherProps {
  clients: ClientOption[];
}

export function ClientSwitcher({ clients }: ClientSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("client") ?? "";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("client", id);
      } else {
        params.delete("client");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  if (clients.length === 0) return null;

  const selectedClient = clients.find((c) => c.id === selectedId);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        {selectedClient && (
          <div
            className="pointer-events-none absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
            style={{ background: "var(--brand-primary)" }}
          >
            {selectedClient.name.charAt(0).toUpperCase()}
          </div>
        )}
        <select
          value={selectedId}
          onChange={handleChange}
          className="h-8 rounded-xl border text-xs font-medium transition focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] appearance-none cursor-pointer"
          style={{
            borderColor: "var(--border-soft)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            paddingLeft: selectedClient ? "2rem" : "0.75rem",
            paddingRight: "1.75rem",
          }}
          aria-label="Select client"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <svg
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{ color: "var(--text-muted)" }}
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}
