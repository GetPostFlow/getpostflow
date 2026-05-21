"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Button } from "@getpostflow/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@getpostflow/ui/select";
import { getAllowedFrequencies, calculateNextSendDate, type ReportFrequency } from "@getpostflow/reporting";

interface Props {
  clientId: string;
  clientName: string;
  planCode?: string;
}

export default function ReportScheduleClient({ clientId, clientName, planCode = "starter" }: Props) {
  const allowed = getAllowedFrequencies(planCode);
  const [frequency, setFrequency] = useState<ReportFrequency>(allowed[0]!);
  const [dayValue, setDayValue] = useState(1);
  const [recipients, setRecipients] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  const nextSend = calculateNextSendDate(frequency, dayValue);

  async function handleSave() {
    // In production: POST to /api/report-schedules
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <Link
          href={`/dashboard/clients/${clientId}/reports`}
          className="flex items-center gap-1 text-sm mb-4 transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reports
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand-primary)" }}>
          Schedule
        </p>
        <h1 className="mt-1 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Scheduled Reports
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Configure automatic report delivery for {clientName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Delivery Schedule
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Frequency */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {(["monthly", "biweekly", "weekly"] as ReportFrequency[]).map((f) => {
                const available = allowed.includes(f);
                return (
                  <button
                    key={f}
                    disabled={!available}
                    onClick={() => available && setFrequency(f)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition"
                    style={{
                      borderColor: frequency === f ? "var(--brand-primary)" : "var(--border-soft)",
                      background: frequency === f ? "rgba(47,93,98,0.06)" : "transparent",
                      color: frequency === f ? "var(--brand-primary)" : available ? "var(--text-secondary)" : "var(--text-muted)",
                      opacity: available ? 1 : 0.5,
                      cursor: available ? "pointer" : "not-allowed",
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {!available && (
                      <Badge variant="muted" className="text-[10px]">Upgrade</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day */}
          {frequency === "monthly" && (
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Send on day of month
              </label>
              <Select value={String(dayValue)} onValueChange={(v) => setDayValue(Number(v))}>
                <SelectTrigger className="w-[160px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Last day of month</SelectItem>
                  {Array.from({ length: 28 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>Day {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "weekly" && (
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Send on day of week
              </label>
              <Select value={String(dayValue)} onValueChange={(v) => setDayValue(Number(v))}>
                <SelectTrigger className="w-[160px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                    <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recipients */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Recipient Emails (comma-separated)
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="client@example.com, manager@agency.com"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--border-soft)",
                background: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="isActive" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Schedule is active
            </label>
          </div>

          {/* Next send preview */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "var(--subtle)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--brand-primary)" }}>
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3zM7.5 5v3.5l2.5 1.5-.5.87L6.5 9V5h1z" />
            </svg>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Next report will be sent on{" "}
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {nextSend.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>
              {saved ? "Saved!" : "Save Schedule"}
            </Button>
            {saved && <Badge variant="success">Schedule saved</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
