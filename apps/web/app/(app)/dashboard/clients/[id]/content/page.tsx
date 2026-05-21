import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, contentItems } from "@getpostflow/db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@getpostflow/ui/badge";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#000000",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  pinterest: "#E60023",
  reddit: "#FF4500",
  discord: "#5865F2",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  reddit: "Reddit",
  discord: "Discord",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  draft: "muted",
  pending_review: "warning",
  approved: "default",
  scheduled: "default",
  publishing: "warning",
  published: "success",
  client_published: "success",
  failed: "danger",
  archived: "muted",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  client_published: "Client Published",
  failed: "Failed",
  archived: "Archived",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; view?: string }>;
}

export default async function ContentCalendarPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { month, view = "list" } = await searchParams;

  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);
  if (!org) notFound();

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.orgId, org.id)))
    .limit(1);
  if (!client) notFound();

  // Determine calendar window
  const now = new Date();
  const targetMonth = month ? new Date(month + "-01") : new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

  const prevMonthDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
  const nextMonthDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const currentMonth = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, "0")}`;

  const monthLabel = targetMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Fetch content items for this client
  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.clientId, client.id))
    .orderBy(desc(contentItems.createdAt))
    .limit(100);

  // Scheduled items in this month window
  const scheduledInWindow = items.filter((item) => {
    if (!item.scheduledFor) return false;
    const d = new Date(item.scheduledFor);
    return d >= monthStart && d <= monthEnd;
  });

  // Status counts
  const counts = {
    draft: items.filter((i) => i.status === "draft").length,
    pending_review: items.filter((i) => i.status === "pending_review").length,
    approved: items.filter((i) => i.status === "approved").length,
    scheduled: items.filter((i) => i.status === "scheduled").length,
    published: items.filter((i) => i.status === "published" || i.status === "client_published").length,
    failed: items.filter((i) => i.status === "failed").length,
  };

  // Build calendar grid
  const daysInMonth = monthEnd.getDate();
  const firstDayOfWeek = monthStart.getDay(); // 0=Sun
  const calendarDays: Array<{ day: number | null; items: typeof items }> = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: null, items: [] });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayItems = scheduledInWindow.filter((item) => {
      const itemDay = item.scheduledFor ? new Date(item.scheduledFor).getDate() : null;
      return itemDay === d;
    });
    calendarDays.push({ day: d, items: dayItems });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/clients/${id}`}
            className="flex items-center gap-1 text-sm transition hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {client.name}
          </Link>
          <span style={{ color: "var(--border-soft)" }}>/</span>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Content Calendar
          </h1>
        </div>
        <Link
          href={`/dashboard/clients/${id}/content/new`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "var(--brand-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Content
        </Link>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {(
          [
            { key: "draft", label: "Draft" },
            { key: "pending_review", label: "In Review" },
            { key: "approved", label: "Approved" },
            { key: "scheduled", label: "Scheduled" },
            { key: "published", label: "Published" },
            { key: "failed", label: "Failed" },
          ] as const
        ).map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl p-3 text-center"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-soft)" }}
          >
            <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {counts[key]}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/clients/${id}/content?month=${prevMonth}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-70"
                style={{ border: "1px solid var(--border-soft)", color: "var(--text-muted)" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {monthLabel}
              </h2>
              <Link
                href={`/dashboard/clients/${id}/content?month=${nextMonth}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-70"
                style={{ border: "1px solid var(--border-soft)", color: "var(--text-muted)" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <Link
              href={`/dashboard/clients/${id}/content?month=${`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}`}
              className="rounded-lg px-3 py-1 text-xs font-medium transition hover:opacity-80"
              style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
            >
              Today
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium py-1" style={{ color: "var(--text-muted)" }}>
                {d}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, i) => {
              const isToday =
                cell.day !== null &&
                targetMonth.getMonth() === now.getMonth() &&
                targetMonth.getFullYear() === now.getFullYear() &&
                cell.day === now.getDate();

              return (
                <div
                  key={i}
                  className="min-h-[80px] rounded-lg p-1.5"
                  style={{
                    background: cell.day ? "var(--bg-surface)" : "transparent",
                    border: cell.day ? `1px solid ${isToday ? "var(--brand-primary)" : "var(--border-soft)"}` : "none",
                  }}
                >
                  {cell.day && (
                    <>
                      <div
                        className="text-xs font-medium mb-1"
                        style={{
                          color: isToday ? "var(--brand-primary)" : "var(--text-muted)",
                          fontWeight: isToday ? 700 : 400,
                        }}
                      >
                        {cell.day}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {cell.items.slice(0, 3).map((item) => (
                          <Link
                            key={item.id}
                            href={`/dashboard/clients/${id}/content/${item.id}`}
                            className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate transition hover:opacity-80"
                            style={{
                              background: `${PLATFORM_COLORS[item.platform ?? "instagram"]}20`,
                              color: PLATFORM_COLORS[item.platform ?? "instagram"],
                            }}
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: PLATFORM_COLORS[item.platform ?? "instagram"] }}
                            />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        ))}
                        {cell.items.length > 3 && (
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            +{cell.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Platform legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: PLATFORM_COLORS[key] }}
            />
            {label}
          </div>
        ))}
      </div>

      {/* All content list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              All Content ({items.length})
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No content yet.{" "}
                <Link
                  href={`/dashboard/clients/${id}/content/new`}
                  style={{ color: "var(--brand-primary)" }}
                >
                  Create your first post
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-soft)" }}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/clients/${id}/content/${item.id}`}
                  className="flex items-center gap-4 py-3 px-1 transition hover:opacity-80"
                >
                  {/* Platform dot */}
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: PLATFORM_COLORS[item.platform ?? "instagram"] }}
                  />
                  {/* Platform pill */}
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0"
                    style={{
                      background: `${PLATFORM_COLORS[item.platform ?? "instagram"]}18`,
                      color: PLATFORM_COLORS[item.platform ?? "instagram"],
                    }}
                  >
                    {PLATFORM_LABELS[item.platform ?? "instagram"] ?? item.platform}
                  </span>
                  {/* Title */}
                  <span
                    className="flex-1 text-sm truncate font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </span>
                  {/* Status */}
                  <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                  {/* Scheduled date */}
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {item.scheduledFor
                      ? new Date(item.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Unscheduled"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
