import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "Features | GetPostFlow — Done-for-You Social Media Management",
  description:
    "Explore every feature: content creation & scheduling, community management, analytics, client approvals, multi-platform publishing, video, and team collaboration.",
  openGraph: {
    title: "Features | GetPostFlow",
    description: "Everything you need to run social media without lifting a finger.",
    type: "website",
    url: "https://getpostflow.com/features",
  },
};

const features = [
  {
    id: "content",
    eyebrow: "Content creation & scheduling",
    title: "Strategy-driven content, delivered on time — every time.",
    body: "A dedicated strategist plans your entire content calendar: topics, formats, captions, and graphics tailored to your brand voice and each platform's algorithm. Posts are scheduled ahead, never last-minute.",
    bullets: [
      "Full content calendar mapped out monthly",
      "Platform-native formats: carousels, Reels, Shorts, threads",
      "Brand-voice training from your onboarding intake",
      "Visual assets: graphics, cover images, and short-form video",
      "Approval queue so nothing goes live without your sign-off",
    ],
    accent: "#2F5D62",
  },
  {
    id: "community",
    eyebrow: "Community management & unified inbox",
    title: "Every comment, DM, and mention — handled daily.",
    body: "Our team monitors and responds to your community across all platforms from one unified inbox. Engagement is fast, on-brand, and never left to go stale.",
    bullets: [
      "Replies to comments and DMs within business hours",
      "Unified inbox: Facebook, Instagram, TikTok, LinkedIn, YouTube, Discord",
      "Sentiment tagging and escalation alerts for negative feedback",
      "Reddit monitoring and alert workflows (no automated replies per policy)",
      "Monthly engagement summary report",
    ],
    accent: "#8C6A43",
  },
  {
    id: "analytics",
    eyebrow: "Analytics & reporting",
    title: "Reports you'll actually read, with numbers that matter.",
    body: "Monthly performance reports in plain English: what grew, what drove clicks, and what we're doing next month. Advanced analytics include cross-platform reach, engagement rate, and audience growth trends.",
    bullets: [
      "Monthly PDF & email performance report",
      "Cross-platform reach and impression tracking",
      "Engagement rate, follower growth, and link click metrics",
      "Content performance heatmap by platform and post type",
      "Custom KPIs aligned to your business goals",
    ],
    accent: "#708B75",
  },
  {
    id: "approvals",
    eyebrow: "Client approval workflow",
    title: "Nothing goes live without your okay.",
    body: "Every post enters your approval queue before it's scheduled. Review content, leave comments, request edits, or approve in one click — from any device. You stay in control, without doing the work.",
    bullets: [
      "Draft → Review → Approved → Scheduled pipeline",
      "One-click approve or request revision with inline comments",
      "Email and in-app notifications for pending approvals",
      "Audit trail of every approval and edit",
      "Direct client publishing option for trusted accounts",
    ],
    accent: "#2F5D62",
  },
  {
    id: "platforms",
    eyebrow: "Multi-platform publishing",
    title: "9 platforms, zero extra work on your end.",
    body: "We publish to every platform your audience uses, with posts optimized for each one — not just copy-pasted. Each platform has its own tone, format, and caption length handled correctly.",
    bullets: [
      "Facebook, Instagram, TikTok, YouTube, YouTube Shorts",
      "LinkedIn, Pinterest, Reddit (monitoring), Discord",
      "Platform-native scheduling and algorithm-aware timing",
      "Hashtag research and SEO-optimized captions per platform",
      "Cross-posting with per-platform customization (not lazy reposting)",
    ],
    accent: "#8C6A43",
  },
  {
    id: "video",
    eyebrow: "Video content & repurposing",
    title: "Short-form video managed end-to-end.",
    body: "From script to edit to posting, we handle your short-form video pipeline. Got existing long-form content? We repurpose it into TikToks, Reels, and Shorts automatically.",
    bullets: [
      "Short-form video creation: TikTok, IG Reels, YouTube Shorts",
      "Viral hook writing and trending audio suggestions",
      "Long-video repurposing into multiple short clips",
      "Captions, thumbnails, and title optimization",
      "Video scheduling across all supported platforms",
    ],
    accent: "#708B75",
  },
  {
    id: "team",
    eyebrow: "Team collaboration",
    title: "Built for agencies and in-house teams.",
    body: "Multi-seat access, role-based permissions, and client workspaces mean your whole team can collaborate without stepping on each other. From agency account managers to client stakeholders — everyone has the right level of access.",
    bullets: [
      "Multiple client seats with role-based permissions",
      "Separate client workspace per brand",
      "Team activity log and comment threads",
      "Clients see only their content, not others",
      "Whitelabel-ready reporting (Enterprise)",
    ],
    accent: "#2F5D62",
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          Platform features
        </p>
        <h1
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Everything social media.<br />
          <span style={{ color: "#2F5D62" }}>None of the work.</span>
        </h1>
        <p className="text-lg leading-8 max-w-2xl mx-auto" style={{ color: "#3A3A3A" }}>
          GetPostFlow combines a dedicated human strategist with powerful platform tooling so your
          social presence runs on autopilot — without sacrificing quality or brand authenticity.
        </p>
      </section>

      {/* Feature sections */}
      {features.map((f, i) => (
        <section
          key={f.id}
          id={f.id}
          className="py-16"
          style={{ background: i % 2 === 0 ? "#F6F2EA" : "#EFE7DA" }}
        >
          <div className={`mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
            <div style={{ direction: "ltr" }}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#8C6A43" }}
              >
                {f.eyebrow}
              </p>
              <h2
                className="text-3xl font-bold mb-4 leading-snug"
                style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
              >
                {f.title}
              </h2>
              <p className="text-base leading-7 mb-6" style={{ color: "#3A3A3A" }}>
                {f.body}
              </p>
              <ul className="flex flex-col gap-2.5">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                      <path d="M3 8l4 4 6-7" stroke={f.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm leading-6" style={{ color: "#3A3A3A" }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Placeholder visual */}
            <div
              className="rounded-3xl p-10 flex items-center justify-center min-h-[260px]"
              style={{ background: f.accent + "18", border: `2px solid ${f.accent}30` }}
            >
              <p
                className="text-center text-4xl font-bold leading-tight"
                style={{ color: f.accent, fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}
              >
                {f.eyebrow}
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24" style={{ background: "#2F5D62" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}
          >
            Ready to hand it all off?
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(255,253,249,0.85)" }}>
            Start your 14-day free trial — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sign-up"
              className="inline-flex justify-center rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:opacity-90"
              style={{ background: "#8C6A43" }}
            >
              Start 14-day free trial
            </a>
            <a
              href="/pricing"
              className="inline-flex justify-center rounded-xl border px-8 py-4 text-base font-semibold transition"
              style={{ borderColor: "rgba(255,253,249,0.4)", color: "#FFFDF9" }}
            >
              View pricing
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
