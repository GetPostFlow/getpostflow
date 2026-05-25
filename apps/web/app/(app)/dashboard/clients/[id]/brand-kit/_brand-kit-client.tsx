"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@getpostflow/ui/card";
import { Button } from "@getpostflow/ui/button";

interface BrandKit {
  logos: Record<string, string>;
  colors: Record<string, string>;
  typography: Record<string, string>;
  styleGuide?: string;
  voiceTone?: string;
  dosAndDonts: { dos: string[]; donts: string[] };
}

export default function BrandKitPage({ params }: { params: Promise<{ id: string }> }) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setClientId(p.id);
      fetchKit(p.id);
    });
  }, [params]);

  async function fetchKit(id: string) {
    setLoading(true);
    const res = await fetch(`/api/clients/${id}/brand-kit`);
    if (res.ok) {
      const data = await res.json();
      setKit(data.kit ?? { logos: {}, colors: {}, typography: {}, styleGuide: "", voiceTone: "", dosAndDonts: { dos: [], donts: [] } });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!clientId || !kit) return;
    setSaving(true);
    const res = await fetch(`/api/clients/${clientId}/brand-kit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kit),
    });
    if (res.ok) {
      const data = await res.json();
      setKit(data.kit);
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Brand Kit</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Manage logos, colors, typography, voice/tone, and guidelines.</p>
        </div>
        <Button variant="primary" size="sm" disabled={saving} onClick={handleSave}>{saving ? "Saving…" : "Save"}</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Logos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["png", "svg", "jpg"] as const).map((fmt) => (
              <div key={fmt} className="flex flex-col gap-1">
                <label className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{fmt} URL</label>
                <input
                  type="text"
                  value={kit?.logos?.[fmt] ?? ""}
                  onChange={(e) => setKit((prev) => prev ? { ...prev, logos: { ...prev.logos, [fmt]: e.target.value } } : prev)}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
                  placeholder={`https://cdn.example.com/logo.${fmt}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Colors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["primary", "secondary", "accent"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{key}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={kit?.colors?.[key] ?? "#2F5D62"}
                    onChange={(e) => setKit((prev) => prev ? { ...prev, colors: { ...prev.colors, [key]: e.target.value } } : prev)}
                    className="h-9 w-9 rounded border p-0"
                    style={{ borderColor: "var(--border-soft)" }}
                  />
                  <input
                    type="text"
                    value={kit?.colors?.[key] ?? ""}
                    onChange={(e) => setKit((prev) => prev ? { ...prev, colors: { ...prev.colors, [key]: e.target.value } } : prev)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
                    placeholder="#2F5D62"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Typography</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["headingFont", "bodyFont"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{key === "headingFont" ? "Heading font" : "Body font"}</label>
                <select
                  value={kit?.typography?.[key] ?? ""}
                  onChange={(e) => setKit((prev) => prev ? { ...prev, typography: { ...prev.typography, [key]: e.target.value } } : prev)}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
                >
                  <option value="">Select…</option>
                  {["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display", "Merriweather", "Poppins"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Style Guide</h3>
          <textarea
            value={kit?.styleGuide ?? ""}
            onChange={(e) => setKit((prev) => prev ? { ...prev, styleGuide: e.target.value } : prev)}
            className="rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)", minHeight: "120px" }}
            placeholder="Freeform markdown style guide…"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Voice / Tone</h3>
          <textarea
            value={kit?.voiceTone ?? ""}
            onChange={(e) => setKit((prev) => prev ? { ...prev, voiceTone: e.target.value } : prev)}
            className="rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)", minHeight: "80px" }}
            placeholder="How should the brand sound?"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Do&apos;s and Don&apos;ts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium" style={{ color: "var(--brand-success)" }}>Do&apos;s</p>
              {(kit?.dosAndDonts?.dos ?? []).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const next = [...(kit?.dosAndDonts?.dos ?? [])];
                      next[i] = e.target.value;
                      setKit((prev) => prev ? { ...prev, dosAndDonts: { ...prev.dosAndDonts, dos: next } } : prev);
                    }}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none"
                    style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
                  />
                  <button onClick={() => {
                    const next = (kit?.dosAndDonts?.dos ?? []).filter((_, idx) => idx !== i);
                    setKit((prev) => prev ? { ...prev, dosAndDonts: { ...prev.dosAndDonts, dos: next } } : prev);
                  }} className="text-xs" style={{ color: "var(--text-muted)" }}>✕</button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setKit((prev) => prev ? { ...prev, dosAndDonts: { ...prev.dosAndDonts, dos: [...(prev.dosAndDonts?.dos ?? []), ""] } } : prev)}>+ Add</Button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium" style={{ color: "var(--brand-danger)" }}>Don&apos;ts</p>
              {(kit?.dosAndDonts?.donts ?? []).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const next = [...(kit?.dosAndDonts?.donts ?? [])];
                      next[i] = e.target.value;
                      setKit((prev) => prev ? { ...prev, dosAndDonts: { ...prev.dosAndDonts, donts: next } } : prev);
                    }}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none"
                    style={{ borderColor: "var(--border-soft)", background: "var(--surface)", color: "var(--text-primary)" }}
                  />
                  <button onClick={() => {
                    const next = (kit?.dosAndDonts?.donts ?? []).filter((_, idx) => idx !== i);
                    setKit((prev) => prev ? { ...prev, dosAndDonts: { ...prev.dosAndDonts, donts: next } } : prev);
                  }} className="text-xs" style={{ color: "var(--text-muted)" }}>✕</button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setKit((prev) => prev ? { ...prev, dosAndDonts: { ...prev.dosAndDonts, donts: [...(prev.dosAndDonts?.donts ?? []), ""] } } : prev)}>+ Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
