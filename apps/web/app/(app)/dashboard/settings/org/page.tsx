"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Input } from "@getpostflow/ui/input";

export default function OrgSettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const [orgName, setOrgName] = useState(organization?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!organization) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await organization.update({ name: orgName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) return <div className="animate-pulse h-8 rounded-lg w-64" style={{ background: "var(--subtle)" }} />;

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          Organization
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your organization's profile and branding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            General
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <Input
              label="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Agency"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Organization logo
              </label>
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed text-sm"
                style={{ borderColor: "var(--border-soft)", color: "var(--text-muted)" }}
              >
                {organization?.imageUrl ? (
                  <img src={organization.imageUrl} alt="Logo" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-xs text-center px-2">Upload logo<br />(coming soon)</span>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Logo upload via Clerk organization update — available when Clerk image upload is configured.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Brand color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue="#2F5D62"
                  className="h-10 w-20 rounded-lg border cursor-pointer"
                  style={{ borderColor: "var(--border-soft)" }}
                  disabled
                />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  White-label brand colors — Phase 2 feature
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--brand-primary)" }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saved && (
                <span className="text-xs font-medium" style={{ color: "var(--brand-success)" }}>
                  Saved!
                </span>
              )}
              {error && (
                <span className="text-xs" style={{ color: "var(--brand-danger)" }}>
                  {error}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Org details */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Organization Details
          </h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <div className="flex justify-between">
            <span>Org ID</span>
            <code className="text-xs" style={{ color: "var(--text-muted)" }}>{organization?.id ?? "—"}</code>
          </div>
          <div className="flex justify-between">
            <span>Created</span>
            <span>{organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Members</span>
            <span>{organization?.membersCount ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Plan info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Plan &amp; Billing
            </h3>
            <a
              href="/dashboard/billing"
              className="text-xs font-medium transition hover:opacity-70"
              style={{ color: "var(--brand-primary)" }}
            >
              Manage plan →
            </a>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center justify-between">
            <span>Current plan</span>
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-semibold"
              style={{ background: "rgba(47,93,98,0.1)", color: "var(--brand-primary)" }}
            >
              Growth (Trial)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Connected social accounts</span>
            <span>Up to 10</span>
          </div>
          <div className="flex justify-between">
            <span>Client seats</span>
            <span>Up to 5</span>
          </div>
          <div className="flex justify-between">
            <span>AI text credits / mo</span>
            <span>500</span>
          </div>
          <p className="text-xs pt-1" style={{ color: "var(--text-muted)" }}>
            Full billing management and plan upgrades are available via the Billing page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
