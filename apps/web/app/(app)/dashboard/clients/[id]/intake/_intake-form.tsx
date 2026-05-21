"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveIntakeDraft, submitIntake } from "../../actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntakeFormData {
  // Step 1: Business Basics
  businessName: string;
  website: string;
  industry: string;
  targetAudience: string;
  // Step 2: Brand Voice
  brandVoiceFormalCasual: number;
  brandVoiceSeriousPlayful: number;
  brandVoiceConservativeBold: number;
  uniqueSellingProps: string;
  productsServices: string;
  competitors: string;
  doNotMentionList: string;
  // Step 3: Content Strategy
  contentGoals: string[];
  targetLocales: string[];
  cadenceInstagram: string;
  cadenceFacebook: string;
  cadenceLinkedin: string;
  cadenceTiktok: string;
  // Step 4: Brand Assets
  colorHex: string;
  fonts: string;
  sampleContentUrls: string;
}

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

const CONTENT_GOALS = [
  "Brand awareness",
  "Lead generation",
  "Community building",
  "Product promotion",
  "Customer retention",
  "Thought leadership",
  "Event promotion",
  "Recruitment",
];

const LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
];

const CADENCE_OPTIONS = [
  "Daily",
  "3x per week",
  "2x per week",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "N/A",
];

const STEPS = [
  { number: 1, label: "Business Basics" },
  { number: 2, label: "Brand Voice" },
  { number: 3, label: "Content Strategy" },
  { number: 4, label: "Assets & Submit" },
];

const DEFAULTS: IntakeFormData = {
  businessName: "",
  website: "",
  industry: "",
  targetAudience: "",
  brandVoiceFormalCasual: 5,
  brandVoiceSeriousPlayful: 5,
  brandVoiceConservativeBold: 5,
  uniqueSellingProps: "",
  productsServices: "",
  competitors: "",
  doNotMentionList: "",
  contentGoals: [],
  targetLocales: ["en"],
  cadenceInstagram: "3x per week",
  cadenceFacebook: "3x per week",
  cadenceLinkedin: "Weekly",
  cadenceTiktok: "3x per week",
  colorHex: "",
  fonts: "",
  sampleContentUrls: "",
};

// ─── Slider Component ─────────────────────────────────────────────────────────

function VoiceSlider({
  name,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>{leftLabel}</span>
        <span className="font-medium px-2 py-0.5 rounded-lg" style={{ background: "var(--subtle)", color: "var(--text-primary)" }}>
          {value}/10
        </span>
        <span>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        name={name}
        className="w-full accent-[var(--brand-primary)]"
      />
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background:
                  step.number < current
                    ? "var(--brand-success)"
                    : step.number === current
                    ? "var(--brand-primary)"
                    : "var(--subtle)",
                color:
                  step.number <= current ? "white" : "var(--text-muted)",
              }}
            >
              {step.number < current ? (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className="text-[10px] whitespace-nowrap"
              style={{ color: step.number === current ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="h-px w-8 mx-1 mb-4"
              style={{ background: step.number < current ? "var(--brand-success)" : "var(--border-soft)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Field wrappers ───────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
      {children}{" "}
      {optional && <span className="font-normal text-xs" style={{ color: "var(--text-muted)" }}>(optional)</span>}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition w-full"
      style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition w-full resize-none"
      style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition w-full"
      style={{ borderColor: "var(--border-soft)", background: "var(--canvas)", color: "var(--text-primary)" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IntakeFormPage({ clientId, initialData }: { clientId: string; initialData?: Partial<IntakeFormData> }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [form, setForm] = useState<IntakeFormData>({ ...DEFAULTS, ...initialData });

  const set = useCallback(<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  function buildPayload() {
    return {
      businessName: form.businessName,
      website: form.website || undefined,
      industry: form.industry || undefined,
      targetAudience: form.targetAudience || undefined,
      brandVoice: {
        formalCasual: form.brandVoiceFormalCasual,
        seriousPlayful: form.brandVoiceSeriousPlayful,
        conservativeBold: form.brandVoiceConservativeBold,
      },
      uniqueSellingProps: form.uniqueSellingProps || undefined,
      productsServices: form.productsServices || undefined,
      competitors: form.competitors || undefined,
      doNotMentionList: form.doNotMentionList || undefined,
      contentGoals: form.contentGoals,
      targetLocales: form.targetLocales,
      preferredCadence: {
        instagram: form.cadenceInstagram,
        facebook: form.cadenceFacebook,
        linkedin: form.cadenceLinkedin,
        tiktok: form.cadenceTiktok,
      },
      existingAssets: {
        colorHex: form.colorHex || undefined,
        fonts: form.fonts || undefined,
        sampleContentUrls: form.sampleContentUrls
          ? form.sampleContentUrls.split("\n").map((u) => u.trim()).filter(Boolean)
          : [],
      },
    };
  }

  async function handleSaveDraft() {
    setIsSaving(true);
    try {
      await saveIntakeDraft(clientId, buildPayload());
      setSavedAt(new Date());
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!form.businessName.trim()) return;
    setIsSubmitting(true);
    try {
      await submitIntake(clientId, buildPayload());
      // submitIntake redirects, but just in case:
      router.push(`/dashboard/clients/${clientId}/strategy/review`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }

  // ── Step content ──────────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Business Name <span style={{ color: "var(--brand-danger)" }}>*</span></FieldLabel>
              <TextInput value={form.businessName} onChange={(v) => set("businessName", v)} placeholder="e.g. Acme Bakery" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Website</FieldLabel>
              <TextInput value={form.website} onChange={(v) => set("website", v)} placeholder="https://acmebakery.com" type="url" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Industry</FieldLabel>
              <SelectInput value={form.industry} onChange={(v) => set("industry", v)} options={INDUSTRIES} placeholder="Select an industry…" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Target Audience</FieldLabel>
              <TextArea
                value={form.targetAudience}
                onChange={(v) => set("targetAudience", v)}
                placeholder="Describe your ideal customers — demographics, interests, pain points…"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Drag the sliders to define your brand&apos;s communication style. These guide the AI when writing content.
              </p>
              <div className="flex flex-col gap-6 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
                <VoiceSlider name="formalCasual" value={form.brandVoiceFormalCasual} onChange={(v) => set("brandVoiceFormalCasual", v)} leftLabel="Formal" rightLabel="Casual" />
                <VoiceSlider name="seriousPlayful" value={form.brandVoiceSeriousPlayful} onChange={(v) => set("brandVoiceSeriousPlayful", v)} leftLabel="Serious" rightLabel="Playful" />
                <VoiceSlider name="conservativeBold" value={form.brandVoiceConservativeBold} onChange={(v) => set("brandVoiceConservativeBold", v)} leftLabel="Conservative" rightLabel="Bold" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Unique Selling Propositions</FieldLabel>
              <TextArea
                value={form.uniqueSellingProps}
                onChange={(v) => set("uniqueSellingProps", v)}
                placeholder="What makes your brand different? List your key USPs…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Products &amp; Services</FieldLabel>
              <TextArea
                value={form.productsServices}
                onChange={(v) => set("productsServices", v)}
                placeholder="Describe your main products or services…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Competitors</FieldLabel>
              <TextArea
                value={form.competitors}
                onChange={(v) => set("competitors", v)}
                placeholder="List 3–5 main competitors and what differentiates you from them…"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Do-Not-Talk-About List</FieldLabel>
              <TextArea
                value={form.doNotMentionList}
                onChange={(v) => set("doNotMentionList", v)}
                placeholder="Topics, people, or brands to avoid mentioning…"
                rows={2}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <FieldLabel>Content Goals</FieldLabel>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_GOALS.map((goal) => {
                  const checked = form.contentGoals.includes(goal);
                  return (
                    <label
                      key={goal}
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs cursor-pointer transition"
                      style={{
                        borderColor: checked ? "var(--brand-primary)" : "var(--border-soft)",
                        background: checked ? "var(--brand-primary)/5" : "var(--canvas)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            set("contentGoals", [...form.contentGoals, goal]);
                          } else {
                            set("contentGoals", form.contentGoals.filter((g) => g !== goal));
                          }
                        }}
                        className="accent-[var(--brand-primary)]"
                      />
                      {goal}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Target Locales</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {LOCALES.map(({ code, label }) => {
                  const checked = form.targetLocales.includes(code);
                  return (
                    <label
                      key={code}
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs cursor-pointer transition"
                      style={{
                        borderColor: checked ? "var(--brand-primary)" : "var(--border-soft)",
                        background: checked ? "var(--brand-primary)/5" : "var(--canvas)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            set("targetLocales", [...form.targetLocales, code]);
                          } else {
                            set("targetLocales", form.targetLocales.filter((l) => l !== code));
                          }
                        }}
                        className="accent-[var(--brand-primary)]"
                      />
                      <span className="font-mono uppercase mr-0.5">{code}</span> {label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Posting Cadence Per Platform</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { platform: "Instagram", key: "cadenceInstagram" as const },
                  { platform: "Facebook", key: "cadenceFacebook" as const },
                  { platform: "LinkedIn", key: "cadenceLinkedin" as const },
                  { platform: "TikTok", key: "cadenceTiktok" as const },
                ].map(({ platform, key }) => (
                  <div key={platform} className="flex flex-col gap-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{platform}</span>
                    <SelectInput
                      value={form[key]}
                      onChange={(v) => set(key, v)}
                      options={CADENCE_OPTIONS}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", background: "var(--subtle)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-primary)" }}>Brand Assets</p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Provide brand colors, fonts, and sample content URLs. The AI will use these to align the strategy with your existing brand identity.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel optional>Primary Brand Color (hex)</FieldLabel>
                  <div className="flex gap-2 items-center">
                    <TextInput value={form.colorHex} onChange={(v) => set("colorHex", v)} placeholder="#FF6B35" />
                    {form.colorHex && (
                      <div
                        className="h-9 w-9 rounded-xl border flex-shrink-0"
                        style={{ background: form.colorHex, borderColor: "var(--border-soft)" }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel optional>Fonts</FieldLabel>
                  <TextInput value={form.fonts} onChange={(v) => set("fonts", v)} placeholder="e.g. Playfair Display (headings), Inter (body)" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel optional>Sample Content URLs</FieldLabel>
                  <TextArea
                    value={form.sampleContentUrls}
                    onChange={(v) => set("sampleContentUrls", v)}
                    placeholder="One URL per line — Instagram posts, website, etc."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", background: "var(--canvas)" }}>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-primary)" }}>Ready to Submit?</p>
              <ul className="flex flex-col gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.businessName ? "var(--brand-success)" : "var(--brand-danger)" }}>
                    {form.businessName ? "✓" : "✗"}
                  </span>
                  Business name {form.businessName ? `"${form.businessName}"` : "(required)"}
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.industry ? "var(--brand-success)" : "var(--text-muted)" }}>
                    {form.industry ? "✓" : "○"}
                  </span>
                  Industry {form.industry ? `"${form.industry}"` : "(optional)"}
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.contentGoals.length > 0 ? "var(--brand-success)" : "var(--text-muted)" }}>
                    {form.contentGoals.length > 0 ? "✓" : "○"}
                  </span>
                  {form.contentGoals.length} content goal{form.contentGoals.length !== 1 ? "s" : ""} selected
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--brand-success)" }}>✓</span>
                  {form.targetLocales.length} target locale{form.targetLocales.length !== 1 ? "s" : ""}
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Brand Intake Form
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Complete all steps to generate your AI brand strategy draft.
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
      >
        <StepIndicator current={step} />

        <div className="min-h-[320px]">
          {renderStep()}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-between gap-3 pt-4 mt-4 border-t"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="rounded-xl px-3 py-1.5 text-xs font-medium transition hover:bg-[var(--subtle)] disabled:opacity-50"
              style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
            >
              {isSaving ? "Saving…" : "Save Draft"}
            </button>
            {savedAt && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-[var(--subtle)]"
                style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
              >
                Back
              </button>
            )}
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !form.businessName.trim()}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--brand-primary)" }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !form.businessName.trim()}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--brand-primary)" }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating AI Draft…
                  </>
                ) : (
                  "Submit & Generate AI Draft"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
