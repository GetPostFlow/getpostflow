"use client";

import { useState } from "react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", facebook: "#1877F2", tiktok: "#000000",
  youtube: "#FF0000", linkedin: "#0A66C2", pinterest: "#E60023",
};
const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok",
  youtube: "YouTube", linkedin: "LinkedIn", pinterest: "Pinterest",
};

interface Item {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduledFor: string | null;
}

interface Props {
  clientName: string;
  items: Item[];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarClient({ clientName, items }: Props) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const byDate: Record<string, Item[]> = {};
  for (const item of items) {
    if (!item.scheduledFor) continue;
    const key = item.scheduledFor.substring(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(item);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
          Content Calendar
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Scheduled and approved posts for <strong>{clientName}</strong>. <span style={{ fontWeight: 600, color: "#2F5D62" }}>{items.length} posts scheduled</span>
        </p>
      </div>

      {/* Calendar */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={prevMonth}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              ‹
            </button>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>{monthName}</h2>
            <button
              onClick={nextMonth}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              ›
            </button>
          </div>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{items.length} post{items.length !== 1 ? "s" : ""} scheduled</span>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#9ca3af", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ height: "100px" }} />;

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayItems = byDate[dateKey] ?? [];
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={dateKey}
                style={{
                  height: "100px",
                  padding: "6px",
                  borderRadius: "8px",
                  background: isToday ? "#f0fdf4" : "#fafafa",
                  border: `1px solid ${isToday ? "#bbf7d0" : "#f3f4f6"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "#16a34a" : "#374151",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  {day}
                </span>
                {dayItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    title={item.title}
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      padding: "2px 5px",
                      borderRadius: "4px",
                      background: `${PLATFORM_COLORS[item.platform ?? "instagram"] ?? "#6b7280"}18`,
                      color: PLATFORM_COLORS[item.platform ?? "instagram"] ?? "#6b7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "default",
                    }}
                  >
                    {PLATFORM_LABELS[item.platform ?? "instagram"] ?? item.platform} · {item.title.substring(0, 14)}{item.title.length > 14 ? "…" : ""}
                  </div>
                ))}
                {dayItems.length > 2 && (
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>+{dayItems.length - 2} more</span>
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
                  {new Date(item.scheduledFor!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
