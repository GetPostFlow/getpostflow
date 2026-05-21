import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "The Complete Guide to Social Media Management for Small Businesses | GetPostFlow",
  description:
    "A no-nonsense guide covering every platform, what works on each one, how to manage community without losing your mind, and when to hand it off.",
  openGraph: {
    title: "The Complete Guide to Social Media Management for Small Businesses",
    description: "Every platform. What works. When to hand it off.",
    type: "article",
    url: "https://getpostflow.com/blog/social-media-management-guide",
  },
};

export default function SocialMediaGuidePost() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "#EFE7DA", color: "#8C6A43" }}
          >
            Platform guide
          </span>
          <p className="text-xs mt-3" style={{ color: "#5E6472" }}>April 2025 · 12 min read</p>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold mb-6 leading-snug"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          The Complete Guide to Social Media Management for Small Businesses
        </h1>

        <div
          className="rounded-2xl p-6 mb-10"
          style={{ background: "#EFE7DA", borderLeft: "4px solid #2F5D62" }}
        >
          <p className="text-sm leading-7" style={{ color: "#3A3A3A" }}>
            <strong>TL;DR:</strong> Social media management is content creation, scheduling, community
            management, and analytics — all done consistently across multiple platforms. For most small
            businesses, the hard part isn't knowing what to do, it's having the bandwidth to do it.
          </p>
        </div>

        <div className="prose prose-sm max-w-none" style={{ color: "#3A3A3A" }}>
          <h2 style={{ color: "#1A1A1A", fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}>
            What social media management actually involves
          </h2>
          <p className="leading-8">
            "Social media management" gets thrown around a lot, but let's be specific. Done well, it
            includes: content strategy, content creation (copy, graphics, video), scheduling and
            publishing, community management (replies, DMs, comments), analytics and reporting, and
            ongoing strategy refinement.
          </p>
          <p className="leading-8">
            Most small business owners do about 20% of this — usually the posting part — and wonder why
            results are slow. The community management and analytics layers are where consistency builds
            audience trust and where you learn what to do more of.
          </p>

          <h2 style={{ color: "#1A1A1A", fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}>
            Platform breakdown: what works where
          </h2>

          <h3 style={{ color: "#2F5D62" }}>Instagram</h3>
          <p className="leading-8">
            Instagram rewards consistency and visual quality. Reels are the primary growth lever in
            2024–2025; carousels drive saves and profile visits; Stories maintain daily connection with
            your existing audience. Don't try to do everything — pick 2 of the 3 and do them well.
            Posting 4–6x per week is the minimum for meaningful growth.
          </p>

          <h3 style={{ color: "#2F5D62" }}>TikTok</h3>
          <p className="leading-8">
            TikTok has the highest organic reach of any platform right now. The algorithm is interest-graph
            based, not follower-based, which means new accounts can go viral immediately. Volume matters
            here — brands that post 1–3x per day see dramatically better results than those that post
            3x per week. Short hooks (first 2 seconds), captions as on-screen text, and trending audio
            are the core mechanics.
          </p>

          <h3 style={{ color: "#2F5D62" }}>LinkedIn</h3>
          <p className="leading-8">
            LinkedIn is the highest-intent platform for B2B businesses. Text-first posts, personal
            stories with business lessons, and carousel "how-to" posts perform best. Video is
            underutilized here — if you're in B2B and not posting video on LinkedIn, you're missing
            an opportunity. Post 3–5x per week for consistent reach.
          </p>

          <h3 style={{ color: "#2F5D62" }}>Facebook</h3>
          <p className="leading-8">
            Organic Facebook reach has declined significantly, but it still matters for local businesses,
            community groups, and video. Facebook Groups are often more valuable than Pages for
            community building. Paid promotion amplifies everything, so treat organic Facebook as a base
            and boost your best-performing posts.
          </p>

          <h3 style={{ color: "#2F5D62" }}>YouTube & YouTube Shorts</h3>
          <p className="leading-8">
            YouTube is the second largest search engine in the world — it has SEO value that Instagram
            and TikTok don't. YouTube Shorts (repurposed from TikToks or Reels) allow you to benefit
            from both the short-form algorithm and YouTube's search discovery. If you're already making
            short-form video, post it on YouTube Shorts. The incremental effort is minimal.
          </p>

          <h2 style={{ color: "#1A1A1A", fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}>
            Community management: the most neglected layer
          </h2>
          <p className="leading-8">
            Most businesses post and disappear. They never respond to comments. They have unread DMs
            from potential customers. They miss brand mentions. This is leaving money on the table.
          </p>
          <p className="leading-8">
            Responding to every comment within a few hours signals to the algorithm that your content
            is generating conversation (which boosts distribution). More importantly, it signals to
            humans that you're a real business that cares about its community — which drives trust and
            eventually sales.
          </p>

          <h2 style={{ color: "#1A1A1A", fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}>
            How to measure what's working
          </h2>
          <p className="leading-8">
            Don't optimize for vanity metrics (follower count, likes). Optimize for:
          </p>
          <ul className="leading-8 space-y-1">
            <li><strong>Engagement rate:</strong> likes + comments + shares ÷ reach. Above 3% is healthy.</li>
            <li><strong>Profile visits and link clicks:</strong> Signals intent from new audiences.</li>
            <li><strong>Saves (Instagram):</strong> Saves are the highest-intent signal on the platform.</li>
            <li><strong>DM volume:</strong> A leading indicator of conversion-ready interest.</li>
          </ul>

          <h2 style={{ color: "#1A1A1A", fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}>
            When does it make sense to hand social media off?
          </h2>
          <p className="leading-8">
            The honest answer: when the opportunity cost of doing it yourself exceeds the cost of
            having someone else do it better. For most business owners, an hour on content creation
            could be an hour on product, sales, or customer service.
          </p>
          <p className="leading-8">
            The second signal: when you've been inconsistent for more than 3 months. Inconsistency
            compounds — every gap resets your algorithmic momentum. If you can't commit to consistency
            yourself, outsourcing is the only path to a social presence that actually drives results.
          </p>
        </div>

        <div
          className="mt-12 rounded-2xl p-8"
          style={{ background: "#2F5D62", color: "#FFFDF9" }}
        >
          <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#B9A28E" }}>
            Hands-off social media management
          </p>
          <p className="text-base font-bold mb-4">
            GetPostFlow handles every layer: strategy, content, community, and reporting.
          </p>
          <a
            href="/sign-up"
            className="inline-flex rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ background: "#FFFDF9", color: "#2F5D62" }}
          >
            Start 14-day free trial
          </a>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}
