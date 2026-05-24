"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntakeFormData {
  // Basic Info
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  // Social Media Accounts
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  redditUrl: string;
  // Brand Guidelines
  brandVoice: string;
  keyMessaging: string;
  targetAudience: string;
  logoUrl: string;
  brandColors: string;
  brandFonts: string;
  preferredContentExamples: string;
  dislikedContentExamples: string;
  // Content Preferences
  contentTypes: string[];
  frequencyInstagram: string;
  frequencyFacebook: string;
  frequencyLinkedin: string;
  frequencyTwitter: string;
  frequencyTiktok: string;
  frequencyYoutube: string;
  frequencyReddit: string;
  themesToFocus: string;
  themesToAvoid: string;
  // Community Management
  keywordsToMonitor: string;
  desiredAutoResponses: string;
  escalationProtocol: string;
  // Marketing Goals
  marketingGoals: string[];
  // Website
  websiteUrl: string;
}

const CONTENT_TYPES = [
  "Educational posts",
  "Promotional videos",
  "Behind-the-scenes stories",
  "User-generated content",
  "Product showcases",
  "Testimonials",
  "Industry news",
  "Polls / Engagement",
];

const MARKETING_GOALS = [
  "Lead generation",
  "Brand awareness",
  "Website traffic",
  "Sales",
  "Community building",
  "Thought leadership",
];

const FREQUENCY_OPTIONS = [
  "Daily",
  "3x per week",
  "2x per week",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "N/A",
];

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Social Accounts" },
  { number: 3, label: "Brand Guidelines" },
  { number: 4, label: "Content Preferences" },
  { number: 5, label: "Community Mgmt" },
  { number: 6, label: "Goals & Submit" },
];

const DEFAULTS: IntakeFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  redditUrl: "",
  brandVoice: "",
  keyMessaging: "",
  targetAudience: "",
  logoUrl: "",
  brandColors: "",
  brandFonts: "",
  preferredContentExamples: "",
  dislikedContentExamples: "",
  contentTypes: [],
  frequencyInstagram: "3x per week",
  frequencyFacebook: "3x per week",
  frequencyLinkedin: "Weekly",
  frequencyTwitter: "Daily",
  frequencyTiktok: "3x per week",
  frequencyYoutube: "Weekly",
  frequencyReddit: "N/A",
  themesToFocus: "",
  themesToAvoid: "",
  keywordsToMonitor: "",
  desiredAutoResponses: "",
  escalationProtocol: "",
  marketingGoals: [],
  websiteUrl: "",
};

// ─── UI Components ────────────────────────────────────────────────────────────

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
                color: step.number <= current ? "white" : "var(--text-muted)",
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortalIntakeForm({
  clientId,
  orgSlug,
  clientSlug,
  token,
}: {
  clientId: string;
  orgSlug: string;
  clientSlug: string;
  token: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<IntakeFormData>(DEFAULTS);

  const set = useCallback(<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  function buildPayload() {
    return {
      businessName: form.companyName,
      contactPerson: form.contactPerson,
      email: form.email,
      phone: form.phone,
      socialAccounts: {
        linkedin: form.linkedinUrl,
        instagram: form.instagramUrl,
        facebook: form.facebookUrl,
        twitter: form.twitterUrl,
        tiktok: form.tiktokUrl,
        youtube: form.youtubeUrl,
        reddit: form.redditUrl,
      },
      brandGuidelines: {
        voice: form.brandVoice,
        keyMessaging: form.keyMessaging,
        targetAudience: form.targetAudience,
        logoUrl: form.logoUrl,
        colors: form.brandColors,
        fonts: form.brandFonts,
        preferredExamples: form.preferredContentExamples,
        dislikedExamples: form.dislikedContentExamples,
      },
      contentPreferences: {
        types: form.contentTypes,
        frequency: {
          instagram: form.frequencyInstagram,
          facebook: form.frequencyFacebook,
          linkedin: form.frequencyLinkedin,
          twitter: form.frequencyTwitter,
          tiktok: form.frequencyTiktok,
          youtube: form.frequencyYoutube,
          reddit: form.frequencyReddit,
        },
        themesToFocus: form.themesToFocus,
        themesToAvoid: form.themesToAvoid,
      },
      communityManagement: {
        keywordsToMonitor: form.keywordsToMonitor,
        desiredAutoResponses: form.desiredAutoResponses,
        escalationProtocol: form.escalationProtocol,
      },
      marketingGoals: form.marketingGoals,
      website: form.websiteUrl,
    };
  }

  async function handleSubmit() {
    if (!form.companyName.trim() || !form.email.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/portal/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          token,
          payload: buildPayload(),
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      router.push(`/portal/${orgSlug}/${clientSlug}/strategy?token=${token}`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Company Name <span style={{ color: "var(--brand-danger)" }}>*</span></FieldLabel>
              <TextInput value={form.companyName} onChange={(v) => set("companyName", v)} placeholder="e.g. Acme Inc." />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Contact Person <span style={{ color: "var(--brand-danger)" }}>*</span></FieldLabel>
              <TextInput value={form.contactPerson} onChange={(v) => set("contactPerson", v)} placeholder="Full name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Email <span style={{ color: "var(--brand-danger)" }}>*</span></FieldLabel>
              <TextInput type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@company.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Phone</FieldLabel>
              <TextInput type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Provide URLs to your social profiles. Leave blank if you don&apos;t have an account on that platform.</p>
            {[
              { label: "LinkedIn", key: "linkedinUrl" as const },
              { label: "Instagram", key: "instagramUrl" as const },
              { label: "Facebook", key: "facebookUrl" as const },
              { label: "X / Twitter", key: "twitterUrl" as const },
              { label: "TikTok", key: "tiktokUrl" as const },
              { label: "YouTube", key: "youtubeUrl" as const },
              { label: "Reddit", key: "redditUrl" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <FieldLabel optional>{label}</FieldLabel>
                <TextInput type="url" value={form[key]} onChange={(v) => set(key, v)} placeholder={`https://${label.toLowerCase().replace(/[^a-z]/g, "")}.com/...`} />
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Brand Voice / Tone</FieldLabel>
              <TextArea value={form.brandVoice} onChange={(v) => set("brandVoice", v)} placeholder="e.g. Professional yet approachable, witty, authoritative..." rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Key Messaging / USPs</FieldLabel>
              <TextArea value={form.keyMessaging} onChange={(v) => set("keyMessaging", v)} placeholder="What makes you different? Core messages to communicate." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Target Audience Description</FieldLabel>
              <TextArea value={form.targetAudience} onChange={(v) => set("targetAudience", v)} placeholder="Demographics, interests, pain points, behaviours..." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Logo URL</FieldLabel>
              <TextInput type="url" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} placeholder="https://..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Brand Color Palette (hex codes)</FieldLabel>
              <TextInput value={form.brandColors} onChange={(v) => set("brandColors", v)} placeholder="#2F5D62, #F6F2EA, #1A1A1A" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Preferred Fonts</FieldLabel>
              <TextInput value={form.brandFonts} onChange={(v) => set("brandFonts", v)} placeholder="e.g. Inter, Poppins" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Preferred Content Examples</FieldLabel>
              <TextArea value={form.preferredContentExamples} onChange={(v) => set("preferredContentExamples", v)} placeholder="URLs or descriptions of content you love..." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Disliked Content Examples</FieldLabel>
              <TextArea value={form.dislikedContentExamples} onChange={(v) => set("dislikedContentExamples", v)} placeholder="URLs or descriptions of content you want to avoid..." rows={3} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <FieldLabel>Preferred Content Types</FieldLabel>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((type) => {
                  const checked = form.contentTypes.includes(type);
                  return (
                    <label
                      key={type}
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
                            set("contentTypes", [...form.contentTypes, type]);
                          } else {
                            set("contentTypes", form.contentTypes.filter((t) => t !== type));
                          }
                        }}
                        className="accent-[var(--brand-primary)]"
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Posting Frequency Per Platform</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { platform: "Instagram", key: "frequencyInstagram" as const },
                  { platform: "Facebook", key: "frequencyFacebook" as const },
                  { platform: "LinkedIn", key: "frequencyLinkedin" as const },
                  { platform: "X / Twitter", key: "frequencyTwitter" as const },
                  { platform: "TikTok", key: "frequencyTiktok" as const },
                  { platform: "YouTube", key: "frequencyYoutube" as const },
                  { platform: "Reddit", key: "frequencyReddit" as const },
                ].map(({ platform, key }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{platform}</span>
                    <SelectInput value={form[key]} onChange={(v) => set(key, v)} options={FREQUENCY_OPTIONS} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Themes / Topics to Focus On</FieldLabel>
              <TextArea value={form.themesToFocus} onChange={(v) => set("themesToFocus", v)} placeholder="Specific themes, campaigns, or topics you want to emphasise..." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Themes / Topics to Avoid</FieldLabel>
              <TextArea value={form.themesToAvoid} onChange={(v) => set("themesToAvoid", v)} placeholder="Topics, politics, or subjects to stay away from..." rows={3} />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Keywords to Monitor</FieldLabel>
              <TextArea value={form.keywordsToMonitor} onChange={(v) => set("keywordsToMonitor", v)} placeholder="Brand name, product names, competitor names, industry hashtags..." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Desired Automated Responses</FieldLabel>
              <TextArea value={form.desiredAutoResponses} onChange={(v) => set("desiredAutoResponses", v)} placeholder="Examples of replies you&apos;d like us to use for common questions..." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel optional>Escalation Protocol</FieldLabel>
              <TextArea value={form.escalationProtocol} onChange={(v) => set("escalationProtocol", v)} placeholder="When should we escalate to you? e.g. negative sentiment, legal mentions, refund requests..." rows={3} />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <FieldLabel>Marketing Goals</FieldLabel>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2">
                {MARKETING_GOALS.map((goal) => {
                  const checked = form.marketingGoals.includes(goal);
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
                            set("marketingGoals", [...form.marketingGoals, goal]);
                          } else {
                            set("marketingGoals", form.marketingGoals.filter((g) => g !== goal));
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

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Website / Landing Page URL</FieldLabel>
              <TextInput type="url" value={form.websiteUrl} onChange={(v) => set("websiteUrl", v)} placeholder="https://yourcompany.com" />
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", background: "var(--canvas)" }}>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-primary)" }}>Ready to Submit?</p>
              <ul className="flex flex-col gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.companyName ? "var(--brand-success)" : "var(--brand-danger)" }}>{form.companyName ? "✓" : "✗"}</span>
                  Company name {form.companyName ? `"${form.companyName}"` : "(required)"}
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.email ? "var(--brand-success)" : "var(--brand-danger)" }}>{form.email ? "✓" : "✗"}</span>
                  Contact email {form.email ? `"${form.email}"` : "(required)"}
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.contentTypes.length > 0 ? "var(--brand-success)" : "var(--text-muted)" }}>{form.contentTypes.length > 0 ? "✓" : "○"}</span>
                  {form.contentTypes.length} content type{form.contentTypes.length !== 1 ? "s" : ""} selected
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: form.marketingGoals.length > 0 ? "var(--brand-success)" : "var(--text-muted)" }}>{form.marketingGoals.length > 0 ? "✓" : "○"}</span>
                  {form.marketingGoals.length} marketing goal{form.marketingGoals.length !== 1 ? "s" : ""} selected
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
          Welcome to GetPostFlow
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Please complete this intake form so our team can craft your social media strategy.
        </p>
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
        <StepIndicator current={step} />

        <div className="min-h-[320px]">{renderStep()}</div>

        <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t" style={{ borderColor: "var(--border-soft)" }}>
          <div />
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
                disabled={step === 1 && (!form.companyName.trim() || !form.email.trim())}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--brand-primary)" }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !form.companyName.trim() || !form.email.trim()}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--brand-primary)" }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  "Submit Intake"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
