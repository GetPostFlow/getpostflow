"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: string | number;
};

type NavRailProps = {
  items: NavItem[];
  activeId?: string;
  orgName?: string;
  orgLogoUrl?: string | null;
  footer?: ReactNode;
};

export function NavRail({ items, activeId, orgName, footer }: NavRailProps) {
  return (
    <nav
      className="flex h-full w-56 flex-col gap-1 py-4 px-3"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border-soft)" }}
    >
      {/* Logo / Org */}
      <div className="mb-4 px-3 py-2">
        <span className="text-sm font-bold" style={{ color: "var(--brand-primary)" }}>
          {orgName ?? "GetPostFlow"}
        </span>
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-0.5">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "text-white"
                  : "hover:bg-[var(--subtle)]"
              )}
              style={
                isActive
                  ? { background: "var(--brand-primary)", color: "white" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className="ml-auto rounded-full px-1.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "var(--subtle)",
                    color: isActive ? "white" : "var(--text-secondary)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </nav>
  );
}
