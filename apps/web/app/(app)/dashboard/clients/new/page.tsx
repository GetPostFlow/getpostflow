"use client";

import { useState } from "react";
import { createClient } from "../actions";

const INDUSTRIES = [
  "Food & Beverage",
  "Retail",
  "Health & Wellness",
  "Technology",
  "Professional Services",
  "Real Estate",
  "Education",
  "Entertainment",
  "Non-profit",
  "E-commerce",
  "Hospitality",
  "Other",
];

export default function NewClientPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    await createClient(new FormData(e.currentTarget));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          New Client
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Create a new client account. You&apos;ll complete the full intake form next.
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Business name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Business Name <span style={{ color: "var(--brand-danger)" }}>*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Acme Bakery"
              className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: "var(--border-soft)",
                background: "var(--canvas)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Industry
            </label>
            <select
              name="industry"
              className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: "var(--border-soft)",
                background: "var(--canvas)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Select an industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Primary contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Primary Contact Name
              </label>
              <input
                name="primaryContactName"
                type="text"
                placeholder="Jane Smith"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: "var(--border-soft)",
                  background: "var(--canvas)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Primary Contact Email
              </label>
              <input
                name="primaryContactEmail"
                type="email"
                placeholder="jane@acmebakery.com"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: "var(--border-soft)",
                  background: "var(--canvas)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border-soft)" }}>
            <a
              href="/dashboard/clients"
              className="rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-[var(--subtle)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--brand-primary)" }}
            >
              {isLoading ? "Creating…" : "Create & Start Intake"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
