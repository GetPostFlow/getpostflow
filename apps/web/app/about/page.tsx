import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "About | GetPostFlow — Our Story",
  description:
    "GetPostFlow was built to give small businesses a real team managing their social media — not templates, not bots, not freelancers who disappear.",
  openGraph: {
    title: "About GetPostFlow",
    description: "Built for businesses that don't have time to figure out social media.",
    type: "website",
    url: "https://getpostflow.com/about",
  },
};

export default function AboutPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          About us
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Built because social media<br />
          <span style={{ color: "#2F5D62" }}>shouldn't be this hard.</span>
        </h1>
        <p className="text-lg leading-8 max-w-2xl" style={{ color: "#3A3A3A" }}>
          GetPostFlow was founded by a team of social media strategists who were tired of watching
          great businesses fail at social because they lacked the time, team, or tools to execute
          consistently. We built the platform we wished existed.
        </p>
      </section>

      {/* Mission */}
      <section className="py-16" style={{ background: "#EFE7DA" }}>
        <div className="mx-auto max-w-4xl px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
              Our mission
            </p>
            <h2
              className="text-3xl font-bold mb-5"
              style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
            >
              Give every business a real social media team.
            </h2>
            <p className="text-sm leading-8" style={{ color: "#3A3A3A" }}>
              Not templates. Not bots. Not a freelancer who disappears after month two. A dedicated
              strategist, a content team, and a community manager — working for your business,
              learning your brand, and showing up every single day.
            </p>
          </div>
          <div
            className="rounded-2xl p-8"
            style={{ background: "#2F5D62", color: "#FFFDF9" }}
          >
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#B9A28E" }}>
              What we believe
            </p>
            <ul className="flex flex-col gap-3 text-sm leading-7">
              {[
                "Consistency beats virality every time.",
                "Community management is a revenue driver, not a nice-to-have.",
                "Every business deserves content that sounds like them.",
                "Analytics should tell a story, not just report numbers.",
                "Your time is better spent running your business.",
              ].map((belief) => (
                <li key={belief} className="flex items-start gap-2.5">
                  <span className="mt-1" style={{ color: "#B9A28E" }}>→</span>
                  <span style={{ color: "rgba(255,253,249,0.9)" }}>{belief}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team placeholder */}
      <section className="py-16" style={{ background: "#F6F2EA" }}>
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            The team
          </p>
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
          >
            We're a small team with big results.
          </h2>
          <p className="text-base leading-8 mb-10 max-w-2xl" style={{ color: "#3A3A3A" }}>
            Full team profiles coming soon. In the meantime — we're hiring. If you're a social media
            strategist, content creator, community manager, or engineer who cares about this problem,
            we'd love to talk.
          </p>
          <a
            href="/careers"
            className="inline-flex rounded-xl px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#2F5D62" }}
          >
            See open roles →
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
