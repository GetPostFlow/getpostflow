import { launchPlatforms } from "@getpostflow/social";

// SVG icon components for pain point cards
function IconClock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C6A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconUserX() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C6A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="11" x2="23" y2="17" />
      <line x1="23" y1="11" x2="17" y2="17" />
    </svg>
  );
}
function IconTrendingDown() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C6A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
function IconHelpCircle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C6A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C6A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

const painPoints = [
  {
    icon: <IconClock />,
    title: "No time to post",
    body: "You know social media matters but between running your business, you never have a spare hour to figure out what to post.",
  },
  {
    icon: <IconUserX />,
    title: "Freelancers who ghost",
    body: "You've hired people before. They started strong, then disappeared, taking your brand voice and content calendar with them.",
  },
  {
    icon: <IconTrendingDown />,
    title: "Posts that get 3 likes",
    body: "You publish something and nothing happens. No comments, no DMs, no sales. You don't know what you're doing wrong.",
  },
  {
    icon: <IconHelpCircle />,
    title: "No idea what to post",
    body: "You stare at a blank screen wondering what your audience even wants to see, and give up after 10 minutes.",
  },
  {
    icon: <IconLayers />,
    title: "5 platforms, zero bandwidth",
    body: "Facebook, Instagram, TikTok, LinkedIn, YouTube… keeping up with all of them is a full-time job you didn't sign up for.",
  },
];

const steps = [
  {
    number: "01",
    title: "Onboarding intake",
    body: "Tell us about your business, your audience, and your goals. We learn your brand voice so nothing ever sounds generic.",
  },
  {
    number: "02",
    title: "Your strategist builds the plan",
    body: "A dedicated strategist maps out your content calendar: topics, formats, posting cadence, tailored to your industry.",
  },
  {
    number: "03",
    title: "Content created & scheduled",
    body: "Posts, captions, videos, and graphics are created for every platform and loaded into your approval queue.",
  },
  {
    number: "04",
    title: "Community managed & reported",
    body: "We handle replies, DMs, and comments every day. Monthly reports show you exactly what's working.",
  },
];

const included = [
  "Dedicated strategist who learns your brand",
  "Content calendar planned and executed for you",
  "Posts optimized for every platform",
  "Real community management: replies, DMs, comments",
  "Monthly performance reports you actually understand",
  "Client approval workflow: nothing goes live without your okay",
];

export default function MarketingHomePage() {
  return (
    <main style={{ background: "#F6F2EA", color: "#1A1A1A" }}>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "#F6F2EA", borderColor: "#D8CCBA" }}
      >
        <a
          href="/"
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#2F5D62" }}
        >
          GetPostFlow
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "#1A1A1A" }}>
          <a href="#how-it-works" className="hover:opacity-70 transition">How it works</a>
          <a href="/pricing" className="hover:opacity-70 transition">Pricing</a>
          <a href="/sign-in" className="hover:opacity-70 transition">Sign in</a>
          <a
            href="/sign-up"
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#2F5D62" }}
          >
            Book a free call
          </a>
        </nav>
        <a
          href="/sign-up"
          className="md:hidden rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "#2F5D62" }}
        >
          Get started
        </a>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "#8C6A43" }}
          >
            Done-for-you social media management
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold leading-[1.08] mb-6"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Your social media,
            <br />
            <span style={{ color: "#2F5D62" }}>handled.</span>
          </h1>
          <p className="text-lg leading-8 mb-8" style={{ color: "#3A3A3A" }}>
            GetPostFlow is a done-for-you social media service. Real strategists
            plan your content, create your posts, manage your community, and send
            you monthly reports, while you focus on running your business.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/sign-up"
              className="inline-flex rounded-xl px-7 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
              style={{ background: "#2F5D62" }}
            >
              Start 14-day free trial
            </a>
            <a
              href="#how-it-works"
              className="inline-flex rounded-xl border px-7 py-3.5 text-base font-semibold transition hover:bg-[#EFE7DA]"
              style={{ borderColor: "#2F5D62", color: "#2F5D62" }}
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm" style={{ color: "#5E6472" }}>
            No credit card required for trial. Cancel anytime.
          </p>
        </div>
        <div
          className="rounded-3xl p-8 flex flex-col gap-5"
          style={{ background: "#2F5D62", color: "#FFFDF9" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#B9A28E" }}>
            What we manage for you
          </p>
          {included.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                className="mt-0.5 shrink-0"
              >
                <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.15)" />
                <path d="M5 9l3 3 5-5" stroke="#B9A28E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm leading-6" style={{ color: "rgba(255,253,249,0.9)" }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="py-20" style={{ background: "#EFE7DA" }}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            Sound familiar?
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-10"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            You're not alone.
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ background: "#F6F2EA", border: "1px solid #D8CCBA" }}
              >
                <div className="shrink-0">{p.icon}</div>
                <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>{p.title}</h3>
                <p className="text-sm leading-6" style={{ color: "#3A3A3A" }}>{p.body}</p>
              </div>
            ))}
            {/* CTA card */}
            <div
              className="rounded-2xl p-6 flex flex-col justify-between gap-4"
              style={{ background: "#2F5D62", color: "#FFFDF9" }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#B9A28E" }}>
                  The fix
                </p>
                <h3 className="text-lg font-bold leading-snug">
                  GetPostFlow handles it all, so you never have to think about social media again.
                </h3>
              </div>
              <a
                href="/sign-up"
                className="inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-center transition hover:opacity-90"
                style={{ color: "#2F5D62" }}
              >
                Start free trial →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20" style={{ background: "#F6F2EA" }}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            How it works
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-12"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Up and running in days, not months.
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col gap-4">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#D8CCBA" }}
                >
                  {step.number}
                </span>
                <h3 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>{step.title}</h3>
                <p className="text-sm leading-7" style={{ color: "#3A3A3A" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-20" style={{ background: "#2F5D62" }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#B9A28E" }}>
            Trusted by SMBs
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif" }}
          >
            Join 50+ businesses growing<br />on social media, without the stress.
          </h2>
          <p className="text-base mb-10" style={{ color: "rgba(255,253,249,0.8)" }}>
            From local cafes to e-commerce brands, our clients get consistent results
            while we handle every post, every reply, and every platform.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { quote: "I went from posting once a month out of guilt to having a full content calendar. My Instagram grew 40% in 90 days.", author: "Sarah K., bakery owner" },
              { quote: "I fired two freelancers before finding GetPostFlow. Finally a team that actually shows up and knows what they're doing.", author: "Marcus T., fitness studio" },
              { quote: "I used to dread social media. Now I just approve posts and watch the engagement come in. It's a relief.", author: "Priya M., boutique retailer" },
            ].map((t) => (
              <div
                key={t.author}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: "rgba(255,253,249,0.08)", border: "1px solid rgba(255,253,249,0.15)" }}
              >
                <p className="text-sm leading-7 italic" style={{ color: "rgba(255,253,249,0.9)" }}>
                  "{t.quote}"
                </p>
                <p className="text-xs font-semibold" style={{ color: "#B9A28E" }}>{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Logos ── */}
      <section className="py-16" style={{ background: "#EFE7DA" }}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            We manage them all
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Every platform your customers use, covered.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {launchPlatforms.map((platform) => (
              <span
                key={platform}
                className="rounded-full px-5 py-2 text-sm font-semibold"
                style={{ background: "#F6F2EA", border: "1px solid #D8CCBA", color: "#1A1A1A" }}
              >
                {platform}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm" style={{ color: "#5E6472" }}>
            Posts are optimized for each platform's algorithm, format, and audience.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24" style={{ background: "#F6F2EA" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
            Ready to hand it off?
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#1A1A1A" }}
          >
            Stop stressing about social media.
            <br />
            <span style={{ color: "#2F5D62" }}>Start seeing results.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "#3A3A3A" }}>
            Start your 14-day free trial today, or book a free 30-minute strategy
            call and we'll show you exactly what we'd do for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sign-up"
              className="inline-flex justify-center rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:opacity-90"
              style={{ background: "#2F5D62" }}
            >
              Start 14-day free trial
            </a>
            <a
              href="mailto:hello@getpostflow.com?subject=Free%20Strategy%20Call"
              className="inline-flex justify-center rounded-xl border px-8 py-4 text-base font-semibold transition hover:bg-[#EFE7DA]"
              style={{ borderColor: "#2F5D62", color: "#2F5D62" }}
            >
              Book a free strategy call
            </a>
          </div>
          <p className="mt-4 text-sm" style={{ color: "#5E6472" }}>
            No credit card required for trial · Cancel anytime · Setup takes under 24 hours
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-6 py-8"
        style={{ borderColor: "#D8CCBA", background: "#F6F2EA" }}
      >
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "var(--font-heading, 'Poppins'), sans-serif", color: "#2F5D62" }}
            >
              GetPostFlow
            </p>
            <p className="text-xs mt-1" style={{ color: "#5E6472" }}>
              Done-for-you social media management for growing businesses.
            </p>
          </div>
          <nav className="flex gap-6 text-xs" style={{ color: "#5E6472" }}>
            <a href="/pricing" className="hover:text-[#1A1A1A] transition">Pricing</a>
            <a href="/sign-in" className="hover:text-[#1A1A1A] transition">Sign in</a>
            <a href="mailto:hello@getpostflow.com" className="hover:text-[#1A1A1A] transition">Contact</a>
          </nav>
          <p className="text-xs" style={{ color: "#5E6472" }}>
            © 2025 GetPostFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
