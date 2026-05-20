"use client";

import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { NavRail } from "@getpostflow/ui/nav-rail";
import { TopBar } from "@getpostflow/ui/top-bar";
import type { NavItem } from "@getpostflow/ui/nav-rail";

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
    id: "onboarding",
    label: "Onboarding",
    href: "/dashboard/onboarding",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-.75 2v3.5l2.5 1.5.5-.87-2-1.2V5h-1z" />
      </svg>
    ),
  },
  {
    id: "content",
    label: "Content",
    href: "/dashboard/content",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 3v1h8V5H4zm0 3v1h8V8H4zm0 3v1h5v-1H4z" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 1v1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2V1h-1v1H6V1H5zm-2 4h10v8H3V5zm2 2v1h1V7H5zm3 0v1h1V7H8zm3 0v1h1V7h-1zM5 9v1h1V9H5zm3 0v1h1V9H8zm3 0v1h1V9h-1zm-6 2v1h1v-1H5zm3 0v1h1v-1H8z" />
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
    label: "Connected Accounts",
    href: "/dashboard/accounts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a3 3 0 1 0 0 6A3 3 0 0 0 8 1zM3 8a5 5 0 0 1 10 0v.5c0 .83-.67 1.5-1.5 1.5h-7C3.67 10 3 9.33 3 8.5V8z" />
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
  if (pathname.startsWith("/dashboard/onboarding")) return "onboarding";
  if (pathname.startsWith("/dashboard/content") || pathname.startsWith("/dashboard/calendar")) return "content";
  if (pathname.startsWith("/dashboard/calendar")) return "calendar";
  if (pathname.startsWith("/dashboard/inbox")) return "inbox";
  if (pathname.startsWith("/dashboard/analytics")) return "analytics";
  if (pathname.startsWith("/dashboard/accounts")) return "accounts";
  if (pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/billing")) return "settings";
  return "overview";
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Overview";
  if (pathname.startsWith("/dashboard/onboarding")) return "Onboarding";
  if (pathname.startsWith("/dashboard/content")) return "Content";
  if (pathname.startsWith("/dashboard/calendar")) return "Calendar";
  if (pathname.startsWith("/dashboard/inbox")) return "Inbox";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/accounts")) return "Connected Accounts";
  if (pathname.startsWith("/dashboard/billing")) return "Billing";
  if (pathname.startsWith("/dashboard/settings/team")) return "Team";
  if (pathname.startsWith("/dashboard/settings/org")) return "Organization";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
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
        footer={
          <div className="flex flex-col gap-2 px-1 pb-2">
            {/* Billing shortcut */}
            <a
              href="/dashboard/billing"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition hover:bg-[var(--subtle)]"
              style={{ color: pathname.startsWith("/dashboard/billing") ? "var(--brand-primary)" : "var(--text-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 4a1 1 0 0 0-1 1v1h12V5a1 1 0 0 0-1-1H3zm-1 4v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8H2zm3 2h6v1H5v-1z" />
              </svg>
              Billing
            </a>
          </div>
        }
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          title={title}
          left={
            <OrganizationSwitcher
              appearance={{
                variables: {
                  colorPrimary: "#2F5D62",
                  borderRadius: "10px",
                  fontFamily: "Inter, ui-sans-serif",
                },
                elements: {
                  organizationSwitcherTrigger: "rounded-xl border border-[var(--border-soft)] px-3 py-1.5 text-sm hover:bg-[var(--subtle)]",
                },
              }}
            />
          }
          right={
            <div className="flex items-center gap-3">
              {/* Command palette stub */}
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

              {/* Notification bell stub */}
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-[var(--subtle)]"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Notifications"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a5.5 5.5 0 0 0-5.5 5.5v2L1 10v1h14v-1l-1.5-1.5v-2A5.5 5.5 0 0 0 8 1zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" />
                </svg>
              </button>

              <UserButton
                appearance={{
                  variables: { colorPrimary: "#2F5D62", borderRadius: "10px" },
                }}
              />
            </div>
          }
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
