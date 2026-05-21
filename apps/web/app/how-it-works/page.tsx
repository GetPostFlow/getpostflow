import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "How It Works | GetPostFlow",
  description:
    "See exactly how GetPostFlow's done-for-you social media service works — from onboarding intake to daily community management and monthly reporting.",
  openGraph: {
    title: "How It Works | GetPostFlow",
    description: "From sign-up to a fully managed social presence in under 24 hours.",
    type: "website",
    url: "https://getpostflow.com/how-it-works",
  },
};

const steps = [
  {
    number: "01",
    phase: "Day 1",
    title: "Onboarding intake",
    body: "You fill out a detailed intake form covering your business, audience, brand voice, competitors, and goals. This becomes our Bible — every piece of content we create references it.",
    details: [
      "30-minute strategy call with your dedicated strategist",
      "Brand voice questionnaire and example post review",
      "Platform access granted via secure OAuth — no passwords shared",
      "Content calendar kickoff for the first 30 days",
    ],
  },
  {
    number: "02",
    phase: "Days 2–5",
    title: "Strategist builds your plan",
    body: "Your dedicated strategist maps out a full content strategy: which topics, which formats, which platforms, and which posting cadence will move the needle for your specific business.",
    details: [
      "Topic clusters mapped to your audience pain points and goals",
      "Platform-specific format selection: Reels, carousels, threads",
      "Posting schedule optimized by platform algorithm timing",
      "Monthly content themes aligned to your business calendar",
    ],
  },
  {
    number: "03",
    phase: "Week 1–2",
    title: "Content created & queued",
    body: "Posts, captions, graphics, and short-form videos are produced for every platform. Everything lands in your approval queue — you review, comment, or approve with one click.",
    details: [
      "Full batch of content delivered to your approval queue",
      "Inline commenting for revision requests",
      "One-click approve → auto-scheduled to post at optimal time",
      "Nothing publishes without your explicit sign-off",
    ],
  },
  {
    number: "04",
    phase: "Ongoing",
    title: "Community managed daily",
    body: "Our team monitors every comment, DM, and mention across your connected platforms every business day. Replies are on-brand, timely, and escalated to you only when needed.",
    details: [
      "Daily monitoring of all platform inboxes",
      "Replies within business hours on all platforms (except Reddit, per policy)",
      "Negative sentiment flagged and escalated within 2 hours",
      "Community engagement summary in your monthly report",
    ],
  },
  {
    number: "05",
    phase: "Monthly",
    title: "Reporting & refinement",
    body: "Every month you receive a plain-English performance report: what grew, what drove clicks, what flopped, and what we're changing next month. Strategy evolves as your audience grows.",
    details: [
      "Cross-platform reach, impressions, and follower growth",
      "Engagement rate by platform and content type",
      "Link click and conversion tracking (where available)",
      "Next month strategy adjustments based on data",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          How it works
        </p>
        <h1
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Up and running in 24 hours.<br />
          <span style={{ color: "#2F5D62" }}>Results in 30 days.</span>
        </h1>
        <p className="text-lg leading-8 max-w-2xl mx-auto" style={{ color: "#3A3A3A" }}>
          We've stripped away every moment of friction. You onboard once, approve content on your
          schedule, and let us handle the rest.
        </p>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-8 md:left-10 top-0 bottom-0 w-0.5 hidden md:block"
            style={{ background: "#D8CCBA" }}
          />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <div key={step.number} className="md:flex gap-10 items-start relative">
                {/* Number bubble */}
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center text-center mb-4 md:mb-0 relative z-10"
                  style={{ background: "#2F5D62", color: "#FFFDF9" }}
                >
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#B9A28E" }}>
                    {step.phase}
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-2xl border p-8"
                  style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
                >
                  <h2
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
                  >
                    {step.title}
                  </h2>
                  <p className="text-sm leading-7 mb-5" style={{ color: "#3A3A3A" }}>
                    {step.body}
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {step.details.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                          <path d="M3 8l4 4 6-7" stroke="#2F5D62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs leading-5" style={{ color: "#5E6472" }}>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "#EFE7DA" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
          >
            Ready to get started?
          </h2>
          <p className="text-base mb-8" style={{ color: "#3A3A3A" }}>
            14-day free trial on Starter and Growth plans. No credit card required.
          </p>
          <a
            href="/sign-up"
            className="inline-flex rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:opacity-90"
            style={{ background: "#2F5D62" }}
          >
            Start 14-day free trial
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
