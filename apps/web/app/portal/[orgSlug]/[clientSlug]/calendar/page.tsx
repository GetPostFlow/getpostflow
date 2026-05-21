import { createDb, contentItems } from "@getpostflow/db";
import { eq, and, inArray, gte } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", facebook: "#1877F2", tiktok: "#000000",
  youtube: "#FF0000", linkedin: "#0A66C2", pinterest: "#E60023",
};
const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok",
  youtube: "YouTube", linkedin: "LinkedIn", pinterest: "Pinterest",
};

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default async function PortalCalendarPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid." />;

  const { client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  // Fetch upcoming 2 months of content
  const now = new Date();
  const twoMonthsOut = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  const items = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.clientId, client.id),
        gte(contentItems.scheduledFor, new Date(now.getFullYear(), now.getMonth(), 1)),
        inArray(contentItems.status, ["approved", "scheduled", "published", "client_published", "pending_review"])
      )
    )
    .limit(60);

  // Group by date
  const byDate: Record<string, typeof items> = {};
  for (const item of items) {
    if (!item.scheduledFor) continue;
    const key = item.scheduledFor.toISOString().substring(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(item);
  }

  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="calendar" />

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
          Content Calendar
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Scheduled and approved posts for <strong>{client.name}</strong>.
        </p>
      </div>

      {/* Calendar */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>{monthName}</h2>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{items.length} post{items.length !== 1 ? "s" : ""} scheduled</span>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#9ca3af", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ minHeight: "80px" }} />;

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayItems = byDate[dateKey] ?? [];
            const isToday = day === now.getDate();

            return (
              <div
                key={dateKey}
                style={{
                  minHeight: "80px",
                  padding: "6px",
                  borderRadius: "8px",
                  background: isToday ? "#f0fdf4" : "#fafafa",
                  border: `1px solid ${isToday ? "#bbf7d0" : "#f3f4f6"}`,
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "#16a34a" : "#374151",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {day}
                </span>
                {dayItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    title={item.title}
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      padding: "2px 5px",
                      borderRadius: "4px",
                      marginBottom: "2px",
                      background: `${PLATFORM_COLORS[item.platform ?? "instagram"] ?? "#6b7280"}18`,
                      color: PLATFORM_COLORS[item.platform ?? "instagram"] ?? "#6b7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "default",
                    }}
                  >
                    {PLATFORM_LABELS[item.platform ?? "instagram"] ?? item.platform} · {item.title.substring(0, 18)}{item.title.length > 18 ? "…" : ""}
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>+{dayItems.length - 3} more</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>Upcoming Posts</h3>
        </div>
        {items.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No posts scheduled yet. Check back soon.
          </div>
        ) : (
          items
            .filter((i) => i.scheduledFor)
            .sort((a, b) => (a.scheduledFor! > b.scheduledFor! ? 1 : -1))
            .map((item, idx, arr) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  borderBottom: idx < arr.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: PLATFORM_COLORS[item.platform ?? "instagram"] ?? "#6b7280",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: `${PLATFORM_COLORS[item.platform ?? "instagram"]}18`,
                    color: PLATFORM_COLORS[item.platform ?? "instagram"] ?? "#6b7280",
                    flexShrink: 0,
                  }}
                >
                  {PLATFORM_LABELS[item.platform ?? "instagram"] ?? item.platform}
                </span>
                <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#1a1a1a" }}>{item.title}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: item.status === "published" ? "#d1fae5" : item.status === "pending_review" ? "#fef3c7" : "#dbeafe",
                    color: item.status === "published" ? "#065f46" : item.status === "pending_review" ? "#92400e" : "#1e40af",
                    flexShrink: 0,
                  }}
                >
                  {item.status === "pending_review" ? "Needs Approval" : item.status === "scheduled" ? "Scheduled" : item.status === "published" ? "Published" : "Approved"}
                </span>
                <span style={{ fontSize: "12px", color: "#9ca3af", flexShrink: 0 }}>
                  {item.scheduledFor!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
