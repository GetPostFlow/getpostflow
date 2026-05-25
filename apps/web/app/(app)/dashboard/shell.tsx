"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { NavRail } from "@getpostflow/ui/nav-rail";
import { TopBar } from "@getpostflow/ui/top-bar";
import type { NavItem } from "@getpostflow/ui/nav-rail";
import { ClientSwitcher } from "./_client-switcher";
import type { ClientOption } from "./_client-switcher";


const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "clients",
    label: "Clients",
    href: "/dashboard/clients",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.5 4a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm-3.5 9c0-3.31 2.69-6 6-6s6 2.69 6 6H2z" />
      </svg>
    ),
  },
  {
    id: "approvals",
    label: "Approvals",
    href: "/dashboard/approvals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.7 5.3L7.5 10.5 4.3 7.3l1.4-1.4 1.8 1.8 2.8-2.8 1.4 1.4z" />
      </svg>
    ),
  },
  {
    id: "content-calendar",
    label: "Content Calendar",
    href: "/dashboard/content-calendar",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2h1v1H3V2zm0 3h1v1H3V5zm0 3h1v1H3V8zm0 3h1v1H3v-1zm3-6h1v1H6V2zm0 3h1v1H6V5zm0 3h1v1H6V8zm0 3h1v1H6v-1zm3-6h1v1H9V2zm0 3h1v1H9V5zm0 3h1v1H9V8zm0 3h1v1H9v-1zm3-6h1v1h-1V2zm0 3h1v1h-1V5zm0 3h1v1h-1V8zm0 3h1v1h-1v-1zM2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    id: "content-library",
    label: "Content Library",
    href: "/dashboard/content-library",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v8h10V4H3z" />
      </svg>
    ),
  },
  {
    id: "content-queue",
    label: "Content Queue",
    href: "/dashboard/content-queue",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 3v1h8V5H4zm0 3v1h8V8H4zm0 3v1h5v-1H4z" />
      </svg>
    ),
  },
  {
    id: "client-approvals",
    label: "Client Approvals",
    href: "/dashboard/client-approvals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.7 5.3L7.5 10.5 4.3 7.3l1.4-1.4 1.8 1.8 2.8-2.8 1.4 1.4z" />
      </svg>
    ),
  },
  {
    id: "inbox",
    label: "Inbox",
    href: "/dashboard/inbox",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9.5l-1.5 2-1.5-2H3a1 1 0 0 1-1-1V3zm1 0v7h3.17l.83 1.1.83-1.1H13V3H3z" />
      </svg>
    ),
  },
  {
    id: "tasks",
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 3h10v2H3V3zm0 4h7v2H3V7zm0 4h5v2H3v-2zm9-2l2 2 3-3-1.4-1.4L13 11.2l-.6-.6L11 12z" />
      </svg>
    ),
  },
  {
    id: "community",
    label: "Community",
    href: "/dashboard/community",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm-3 8c0-2.76 2.24-5 5-5 .34 0 .67.03 1 .09V15H2zm7 2v-5a5 5 0 0 1 4 4.9V15h-4z" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 13V8h2v5H2zm4 0V5h2v8H6zm4 0V3h2v10h-2zm4 0v-3h-2v3h2z" />
      </svg>
    ),
  },
  {
    id: "accounts",
    label: "Accounts",
    href: "/dashboard/accounts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a3 3 0 1 0 0 6A3 3 0 0 0 8 1zM4 9a4 4 0 0 0-4 4v1h16v-1a4 4 0 0 0-4-4H4z" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings/org",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 5a3 3 0 1 0 0 6A3 3 0 0 0 8 5zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5.44-1.5.56.04A1.5 1.5 0 0 1 14.5 8a1.5 1.5 0 0 1-1.5 1.5l-.56.04A5.5 5.5 0 0 1 11.5 11l.28.48a1.5 1.5 0 0 1-2.6 1.5l-.27-.47A5.5 5.5 0 0 1 8 12.5a5.5 5.5 0 0 1-1.5-.08l-.28.47a1.5 1.5 0 0 1-2.59-1.5L3.92 11a5.5 5.5 0 0 1-.42-1.5L3 9.5A1.5 1.5 0 0 1 1.5 8 1.5 1.5 0 0 1 3 6.5l.5-.04A5.5 5.5 0 0 1 4 5l-.27-.47a1.5 1.5 0 0 1 2.59-1.5l.27.47A5.5 5.5 0 0 1 8 3.5c.53 0 1.03.07 1.5.2l.27-.47a1.5 1.5 0 0 1 2.6 1.5L12.09 5c.17.31.3.65.38 1z" />
      </svg>
    ),
  },
];

function getActiveId(pathname: string): string {
  if (pathname === "/dashboard") return "overview";
  if (pathname.startsWith("/dashboard/clients")) return "clients";
  if (pathname.startsWith("/dashboard/approvals")) return "approvals";
  if (pathname.startsWith("/dashboard/content-calendar")) return "content-calendar";
  if (pathname.startsWith("/dashboard/content-library")) return "content-library";
  if (pathname.startsWith("/dashboard/content-queue")) return "content-queue";
  if (pathname.startsWith("/dashboard/client-approvals")) return "client-approvals";
  if (pathname.startsWith("/dashboard/inbox")) return "inbox";
  if (pathname.startsWith("/dashboard/tasks")) return "tasks";
  if (pathname.startsWith("/dashboard/community")) return "community";
  if (pathname.startsWith("/dashboard/analytics")) return "analytics";
  if (pathname.startsWith("/dashboard/accounts")) return "accounts";
  if (pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/billing")) return "settings";
  return "overview";
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Overview";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+\/brand-kit/)) return "Brand Kit";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+\/assets/)) return "Asset Library";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+\/reports/)) return "Reports";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+\/content/)) return "Content Calendar";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+\/intake/)) return "Brand Intake";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+\/strategy/)) return "Strategy Review";
  if (pathname.match(/^\/dashboard\/clients\/[^/]+/) && !pathname.includes("/content") && !pathname.includes("/intake") && !pathname.includes("/strategy") && !pathname.includes("/assets") && !pathname.includes("/reports") && !pathname.includes("/brand-kit")) {
    return "Client Workspace";
  }
  if (pathname.startsWith("/dashboard/clients/new")) return "New Client";
  if (pathname.startsWith("/dashboard/clients")) return "Clients";
  if (pathname.startsWith("/dashboard/approvals")) return "Approvals";
  if (pathname.startsWith("/dashboard/content-calendar")) return "Content Calendar";
  if (pathname.startsWith("/dashboard/content-library")) return "Content Library";
  if (pathname.startsWith("/dashboard/content-queue")) return "Content Queue";
  if (pathname.startsWith("/dashboard/client-approvals")) return "Client Approvals";
  if (pathname.startsWith("/dashboard/tasks")) return "Tasks";
  if (pathname.startsWith("/dashboard/inbox")) return "Inbox";
  if (pathname.startsWith("/dashboard/community")) return "Community Management";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/billing")) return "Billing";
  if (pathname.startsWith("/dashboard/accounts")) return "Connected Accounts";
  if (pathname.startsWith("/dashboard/settings/team")) return "Team";
  if (pathname.startsWith("/dashboard/settings/org")) return "Organization";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
}

// ─── Notification bell stub ───────────────────────────────────────────────────

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
}

const STUB_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "1",
    title: "New client: Northwind Studio",
    body: "Assign a team member to get started.",
    href: "/dashboard/clients",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    title: "Strategy awaiting review",
    body: "Acme Bakery — Brand strategy is ready for your review.",
    href: "/dashboard/strategy-reviews",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "3",
    title: "Client approved strategy",
    body: "Demo Client approved the brand strategy.",
    href: "/dashboard/client-approvals",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "4",
    title: "New intake form submitted",
    body: "Fresh Roast Coffee submitted their brand intake form.",
    href: "/dashboard/intake-reviews",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>(STUB_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-[var(--subtle)]"
        style={{ color: "var(--text-secondary)" }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a5.5 5.5 0 0 0-5.5 5.5v2L1 10v1h14v-1l-1.5-1.5v-2A5.5 5.5 0 0 0 8 1zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "var(--brand-danger)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-80 rounded-2xl border shadow-lg overflow-hidden"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs transition hover:opacity-70"
                style={{ color: "var(--brand-primary)" }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y" style={{ borderColor: "var(--border-soft)" }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.href}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                    );
                    setOpen(false);
                  }}
                  className="flex gap-3 px-4 py-3 transition hover:bg-[var(--subtle)]"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: n.read ? "transparent" : "var(--brand-primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {n.body}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function DashboardShell({
  children,
  clients = [],
}: {
  children: React.ReactNode;
  clients?: ClientOption[];
}) {
  const pathname = usePathname();
  const activeId = getActiveId(pathname);
  const title = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--canvas)" }}>
      {/* Left NavRail */}
      <NavRail
        items={NAV_ITEMS}
        activeId={activeId}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          title={title}
          right={
            <div className="flex items-center gap-3">
              {clients.length > 0 && (
                <ClientSwitcher clients={clients} />
              )}

              <button
                className="hidden md:flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition hover:bg-[var(--subtle)]"
                style={{ borderColor: "var(--border-soft)", color: "var(--text-muted)" }}
                onClick={() => {}}
                aria-label="Open command palette (⌘K)"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.4 10H10V7a2 2 0 0 0-2-2H5.5A2.5 2.5 0 1 0 5.5 8H8v3H6.6a2.5 2.5 0 1 0 0 1H9a1 1 0 0 0 1-1v-1h1.4a2.5 2.5 0 1 0 0-1zM3 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zM5.5 13A1.5 1.5 0 1 1 5.5 10a1.5 1.5 0 0 1 0 3zm7-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
                <span>⌘K</span>
              </button>

              <NotificationBell />

              <UserButton
                appearance={{
                  variables: { colorPrimary: "#2F5D62", borderRadius: "10px" },
                }}
              />
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
