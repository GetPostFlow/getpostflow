import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "FAQ | GetPostFlow — Frequently Asked Questions",
  description:
    "Answers to common questions about GetPostFlow: platforms supported, the 14-day trial, Reddit policy, video content, approval workflows, and more.",
  openGraph: {
    title: "FAQ | GetPostFlow",
    description: "Everything you need to know before getting started.",
    type: "website",
    url: "https://getpostflow.com/faq",
  },
};

const faqs = [
  {
    category: "Getting started",
    items: [
      {
        q: "How does the 14-day free trial work?",
        a: "The 14-day free trial is available on Starter and Growth plans. You can sign up and explore every feature of your chosen plan — content creation, scheduling, community management, and approvals — without entering a credit card. At the end of your trial, you'll be asked to add payment details to continue. If you cancel before the trial ends, you owe nothing.",
      },
      {
        q: "How quickly can we get started?",
        a: "Within 24 hours of signing up, you'll complete a onboarding intake form and have a 30-minute kickoff call with your dedicated strategist. Your first batch of content will be ready for approval within 3-5 business days.",
      },
      {
        q: "Do I need to sign a long-term contract?",
        a: "No. All plans are month-to-month (or annual with a discount). You can cancel anytime from your billing settings. There are no cancellation fees.",
      },
    ],
  },
  {
    category: "Platform support",
    items: [
      {
        q: "What platforms do you support?",
        a: "GetPostFlow manages content and community across: Facebook, Instagram, TikTok, YouTube, YouTube Shorts, LinkedIn, Pinterest, Reddit (monitoring only), and Discord. Posts are optimized per-platform — not just copy-pasted from one account to another.",
      },
      {
        q: "Why can't you auto-respond on Reddit?",
        a: "Reddit's platform policies explicitly prohibit automated responses and prohibit third-party tools from posting on users' behalf in most contexts. Violating these rules can get accounts permanently banned. GetPostFlow includes Reddit for content monitoring, keyword alerts, and brand mention tracking — but all Reddit replies must be made manually by you or your team. We surface the posts that need your attention, you do the replying.",
      },
      {
        q: "Can I add more social accounts later?",
        a: "Yes. You can connect additional social accounts at any time. The number of connected accounts is determined by your plan (Starter: 4, Growth: 8, Scale: 15, Performance: 30, Enterprise: unlimited). If you need more, you can upgrade your plan instantly.",
      },
    ],
  },
  {
    category: "Content & approvals",
    items: [
      {
        q: "Can I publish content directly without going through the approval workflow?",
        a: "Yes. While the default workflow routes all content through your approval queue before scheduling, you can configure direct publishing for specific accounts and team members. This is available on all plans. We recommend keeping approvals on by default until you're comfortable with the content quality and brand consistency.",
      },
      {
        q: "What happens if I don't like a post?",
        a: "Every post in your queue can be rejected with inline comments explaining what to change. Your strategist receives the feedback immediately and revises the content. There's no limit on revision requests — we keep iterating until you're happy. If content is rejected and not revised in time for the scheduled slot, it's held and rescheduled.",
      },
      {
        q: "How far ahead is content prepared?",
        a: "By default, we prepare a full month's content in advance. The first batch is delivered within 3-5 business days of onboarding. After that, you'll receive the next month's batch for review before the current month ends — so there's never a gap.",
      },
    ],
  },
  {
    category: "Video content",
    items: [
      {
        q: "Do you create video content?",
        a: "Yes. Every GetPostFlow plan includes short-form video creation and editing for TikTok, Instagram Reels, and YouTube Shorts. This includes script writing, editing, captions, thumbnails, and scheduling. The number of videos per month depends on your plan (Starter: 2/mo, Growth: 5/mo, Scale: 10/mo, Performance: 20/mo, Enterprise: unlimited).",
      },
      {
        q: "Can you repurpose my existing long-form videos?",
        a: "Yes. If you have existing YouTube videos, podcast recordings, webinars, or any long-form content, we can repurpose them into multiple short clips optimized for TikTok, Reels, and Shorts. Just upload your source files to your workspace and we'll handle the rest.",
      },
    ],
  },
  {
    category: "Plans & billing",
    items: [
      {
        q: "What's included in every plan?",
        a: "Every GetPostFlow plan — from Starter to Enterprise — includes: a dedicated strategist who learns your brand, a full content calendar planned and executed for you, posts optimized for every connected platform, real community management (replies, DMs, and comments handled), monthly performance reports, and the client approval workflow.",
      },
      {
        q: "What's the difference between monthly and annual billing?",
        a: "Annual billing is billed once per year and saves you 17% versus paying month-to-month. The effective monthly rate is shown on the pricing page when you select Annual. You can switch from monthly to annual at any time, and the unused portion of your current month is credited.",
      },
      {
        q: "Do you offer refunds?",
        a: "If you cancel within the first 7 days of a paid plan (not a trial), we'll issue a full refund. After 7 days, refunds are handled case-by-case. Contact billing@getpostflow.com and we'll take care of you.",
      },
    ],
  },
  {
    category: "Teams & collaboration",
    items: [
      {
        q: "Can multiple team members use GetPostFlow?",
        a: "Yes. Plans include multiple client seats (Starter: 2, Growth: 4, Scale: 8, Performance: 15, Enterprise: unlimited). Each seat gets role-based access — admins can see everything, while clients only see their own brand's content and approvals. You can invite team members and clients from your workspace settings.",
      },
      {
        q: "I'm an agency. Can I manage multiple client brands?",
        a: "Absolutely. GetPostFlow is built with agencies in mind. Each client brand is a separate workspace, and you can switch between them from a single login. Client seats are per-workspace, and clients only see their own content — they never see other clients in your account.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          FAQ
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Questions? We've got answers.
        </h1>
        <p className="text-lg leading-8" style={{ color: "#3A3A3A" }}>
          Can't find what you're looking for?{" "}
          <a href="/contact" className="underline" style={{ color: "#2F5D62" }}>Contact us</a> and
          we'll get back to you within one business day.
        </p>
      </section>

      {/* FAQ Categories */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="flex flex-col gap-12">
          {faqs.map((cat) => (
            <div key={cat.category}>
              <h2
                className="text-lg font-bold mb-6 pb-3 border-b"
                style={{
                  fontFamily: "var(--font-heading,'Poppins'),sans-serif",
                  color: "#1A1A1A",
                  borderColor: "#D8CCBA",
                }}
              >
                {cat.category}
              </h2>
              <div className="flex flex-col gap-4">
                {cat.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border"
                    style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
                  >
                    <summary
                      className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-sm list-none select-none"
                      style={{ color: "#1A1A1A" }}
                    >
                      {item.q}
                      <svg
                        className="shrink-0 ml-4 transition-transform group-open:rotate-180"
                        width="16" height="16" viewBox="0 0 16 16" fill="none"
                      >
                        <path d="M4 6l4 4 4-4" stroke="#5E6472" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-7" style={{ color: "#3A3A3A" }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16" style={{ background: "#EFE7DA" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
          >
            Still have questions?
          </h2>
          <p className="text-base mb-6" style={{ color: "#3A3A3A" }}>
            We reply within one business day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex justify-center rounded-xl px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#2F5D62" }}
            >
              Contact us
            </a>
            <a
              href="/sign-up"
              className="inline-flex justify-center rounded-xl border px-7 py-3 text-sm font-semibold transition hover:bg-[#F6F2EA]"
              style={{ borderColor: "#2F5D62", color: "#2F5D62" }}
            >
              Start 14-day free trial
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
