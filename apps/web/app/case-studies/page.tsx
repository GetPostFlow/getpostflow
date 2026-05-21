import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "Case Studies | GetPostFlow",
  description:
    "See how businesses like yours grew on social media with GetPostFlow's done-for-you management service.",
  openGraph: {
    title: "Case Studies | GetPostFlow",
    description: "Real results from real businesses.",
    type: "website",
    url: "https://getpostflow.com/case-studies",
  },
};

const placeholderStudies = [
  {
    industry: "Food & Beverage",
    name: "Local Bakery",
    result: "+40% Instagram followers in 90 days",
    metric1: { label: "Follower growth", value: "40%" },
    metric2: { label: "Engagement rate", value: "6.2%" },
    metric3: { label: "Time saved / week", value: "12 hrs" },
    quote: "I went from posting once a month out of guilt to having a full content calendar. My Instagram grew 40% in 90 days.",
    author: "Sarah K., Owner",
    coming: false,
  },
  {
    industry: "Health & Fitness",
    name: "Fitness Studio",
    result: "+80 new members traced to social in 6 months",
    metric1: { label: "New member leads", value: "80+" },
    metric2: { label: "DM response rate", value: "100%" },
    metric3: { label: "Platforms managed", value: "5" },
    quote: "I fired two freelancers before finding GetPostFlow. Finally a team that actually shows up and knows what they're doing.",
    author: "Marcus T., Studio Owner",
    coming: false,
  },
  {
    industry: "Retail",
    name: "Boutique Retailer",
    result: "+22% online sales attributed to social content",
    metric1: { label: "Link click growth", value: "3.4×" },
    metric2: { label: "Approval time", value: "< 5 min" },
    metric3: { label: "Content pieces / mo", value: "40" },
    quote: "I used to dread social media. Now I just approve posts and watch the engagement come in. It's a relief.",
    author: "Priya M., Founder",
    coming: false,
  },
  {
    industry: "Professional Services",
    name: "B2B Agency",
    result: "Case study coming soon",
    metric1: { label: "Platforms", value: "—" },
    metric2: { label: "Content / mo", value: "—" },
    metric3: { label: "Result", value: "—" },
    quote: "",
    author: "",
    coming: true,
  },
  {
    industry: "E-commerce",
    name: "Online Brand",
    result: "Case study coming soon",
    metric1: { label: "Platforms", value: "—" },
    metric2: { label: "Content / mo", value: "—" },
    metric3: { label: "Result", value: "—" },
    quote: "",
    author: "",
    coming: true,
  },
  {
    industry: "Hospitality",
    name: "Hotel & Travel",
    result: "Case study coming soon",
    metric1: { label: "Platforms", value: "—" },
    metric2: { label: "Content / mo", value: "—" },
    metric3: { label: "Result", value: "—" },
    quote: "",
    author: "",
    coming: true,
  },
];

export default function CaseStudiesPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          Results
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Real businesses.<br />
          <span style={{ color: "#2F5D62" }}>Real results.</span>
        </h1>
        <p className="text-lg leading-8 max-w-2xl mx-auto" style={{ color: "#3A3A3A" }}>
          From local cafes to e-commerce brands, see how our clients grow their social presence
          without spending hours on content.
        </p>
      </section>

      {/* Case study grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {placeholderStudies.map((cs) => (
            <div
              key={cs.name}
              className="rounded-2xl border flex flex-col"
              style={{
                background: cs.coming ? "#EFE7DA" : "#FFFDF9",
                borderColor: "#D8CCBA",
                opacity: cs.coming ? 0.65 : 1,
              }}
            >
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8C6A43" }}>
                    {cs.industry}
                  </p>
                  <h2 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>{cs.name}</h2>
                  {!cs.coming && (
                    <p className="text-sm font-semibold mt-1" style={{ color: "#2F5D62" }}>{cs.result}</p>
                  )}
                  {cs.coming && (
                    <p className="text-sm mt-1" style={{ color: "#5E6472" }}>Case study coming soon</p>
                  )}
                </div>

                {!cs.coming && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {[cs.metric1, cs.metric2, cs.metric3].map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl p-3 text-center"
                          style={{ background: "#F6F2EA", border: "1px solid #EFE7DA" }}
                        >
                          <p className="text-lg font-bold" style={{ color: "#2F5D62" }}>{m.value}</p>
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: "#5E6472" }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {cs.quote && (
                      <blockquote className="border-l-2 pl-4" style={{ borderColor: "#2F5D62" }}>
                        <p className="text-xs leading-6 italic" style={{ color: "#3A3A3A" }}>"{cs.quote}"</p>
                        <p className="text-xs font-semibold mt-1" style={{ color: "#8C6A43" }}>{cs.author}</p>
                      </blockquote>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "#2F5D62" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif" }}
          >
            Want to be our next case study?
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(255,253,249,0.85)" }}>
            Start your 14-day free trial and let's build your results story together.
          </p>
          <a
            href="/sign-up"
            className="inline-flex rounded-xl px-8 py-4 text-base font-semibold transition hover:opacity-90"
            style={{ background: "#FFFDF9", color: "#2F5D62" }}
          >
            Start free trial
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
