"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

type TopBarProps = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function TopBar({ title, left, right, className }: TopBarProps) {
  return (
    <header
      className={clsx(
        "flex h-14 items-center justify-between gap-4 border-b px-6",
        className
      )}
      style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
    >
      <div className="flex items-center gap-3">
        {left}
        {title && (
          <h1 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
