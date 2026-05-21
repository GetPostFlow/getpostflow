import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "Careers | GetPostFlow — Join the Team",
  description:
    "We're building the future of done-for-you social media management. Come work with us.",
  openGraph: {
    title: "Careers at GetPostFlow",
    description: "We're hiring. Help us build the future of done-for-you social media.",
    type: "website",
    url: "https://getpostflow.com/careers",
  },
};

const openRoles = [
  {
    title: "Social Media Strategist",
    type: "Full-time",
    location: "Remote",
    description:
      "Own client strategy from onboarding to reporting. You'll learn brand voices, build content calendars, and be the main point of contact for a portfolio of clients.",
    requirements: [
      "3+ years managing social media for multiple brands",
      "Strong writing and communication skills",
      "Experience with analytics and data-driven decisions",
      "Agency background preferred",
    ],
  },
  {
    title: "Content Creator / Copywriter",
    type: "Full-time",
    location: "Remote",
    description:
      "Write compelling captions, scripts, and copy for clients across industries. You'll write content for Facebook, Instagram, TikTok, LinkedIn, and YouTube every day.",
    requirements: [
      "Portfolio of social media copy across multiple brands and tones",
      "Fast turnaround: you can produce 20+ pieces of content per day when batching",
      "Understanding of platform-specific content formats",
      "Experience writing for both B2C and B2B brands",
    ],
  },
  {
    title: "Community Manager",
    type: "Full-time",
    location: "Remote",
    description:
      "Monitor and respond to comments, DMs, and brand mentions for our client portfolio. You'll be the human behind the brand for dozens of businesses.",
    requirements: [
      "Experience managing community for multiple brands simultaneously",
      "Calm under pressure: you handle negative feedback professionally",
      "Fast response time and strong written communication",
      "Familiarity with social platform moderation tools",
    ],
  },
  {
    title: "Full-Stack Engineer (Next.js / TypeScript)",
    type: "Full-time",
    location: "Remote",
    description:
      "Build and scale the GetPostFlow platform. Work on the approval workflow engine, analytics pipeline, AI content tools, and client-facing dashboard.",
    requirements: [
      "Strong TypeScript and React / Next.js skills",
      "Experience with PostgreSQL or similar relational databases",
      "Comfort with API integrations (social platforms, payment, auth)",
      "Bonus: experience with edge runtimes, queues, or AI/LLM integration",
    ],
  },
];

export default function CareersPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          Careers
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Help us build the<br />
          <span style={{ color: "#2F5D62" }}>future of social media management.</span>
        </h1>
        <p className="text-lg leading-8 max-w-2xl" style={{ color: "#3A3A3A" }}>
          We're a remote-first team building the platform and service we wish had existed when we
          were running social media for clients. We move fast, we care about quality, and we take
          care of our people.
        </p>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: "#EFE7DA" }}>
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
          >
            What it's like to work here
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Remote-first", body: "Work from anywhere. We have no office, no commute, and no in-person requirements. Async communication is our default." },
              { title: "Ownership culture", body: "You own your work end-to-end. We don't micromanage. We set clear goals and get out of your way." },
              { title: "Results over hours", body: "We care about what you ship, not how many hours you're at a desk. Output is the only metric that matters." },
              { title: "Transparent comp", body: "Salary bands are shared openly during the hiring process. No negotiation games." },
              { title: "Learning budget", body: "Annual budget for courses, books, tools, or conferences relevant to your role. Keep growing." },
              { title: "Startup upside", body: "Early team gets meaningful equity. We want you to share in what we build together." },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border p-6"
                style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
              >
                <h3 className="text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>{v.title}</h3>
                <p className="text-xs leading-6" style={{ color: "#5E6472" }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-16" style={{ background: "#F6F2EA" }}>
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
          >
            Open roles
          </h2>
          <div className="flex flex-col gap-6">
            {openRoles.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border p-8"
                style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
                    >
                      {role.title}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EFE7DA", color: "#8C6A43" }}
                      >
                        {role.type}
                      </span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EFE7DA", color: "#5E6472" }}
                      >
                        {role.location}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@getpostflow.com?subject=Application: ${encodeURIComponent(role.title)}`}
                    className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "#2F5D62" }}
                  >
                    Apply
                  </a>
                </div>
                <p className="text-sm leading-7 mb-4" style={{ color: "#3A3A3A" }}>{role.description}</p>
                <ul className="flex flex-col gap-1.5">
                  {role.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                        <path d="M3 8l4 4 6-7" stroke="#708B75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs leading-5" style={{ color: "#5E6472" }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: "#EFE7DA" }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: "#1A1A1A" }}>Don't see your role?</p>
            <p className="text-xs mb-4" style={{ color: "#5E6472" }}>
              We're always open to exceptional people. Send us a note about what you'd bring.
            </p>
            <a
              href="mailto:careers@getpostflow.com?subject=Open application"
              className="inline-flex rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#2F5D62" }}
            >
              Send open application
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
