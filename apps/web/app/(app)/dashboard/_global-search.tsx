"use client";

import { useState } from "react";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="flex-1 max-w-md">
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">🔍</span>
        <input
          type="text"
          placeholder="Search clients, content, messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-9 pr-4 py-2 bg-secondary rounded-lg border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
