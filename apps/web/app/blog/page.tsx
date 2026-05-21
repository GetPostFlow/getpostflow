import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | GetPostFlow — Social Media Tips & Strategy",
  description:
    "Social media strategy, content tips, and platform guides for small businesses and agencies. Learn how to grow your audience without burning out.",
  openGraph: {
    title: "Blog | GetPostFlow",
    description: "Social media strategy for businesses that don't have time to guess.",
    type: "website",
    url: "https://getpostflow.com/blog",
  },
};

const posts = [
  {
    slug: "content-calendar-tips",
    category: "Content strategy",
    title: "How to Build a Content Calendar That Actually Gets Used",
    excerpt:
      "Most content calendars die in a Google Sheet. Here's a practical system for planning and executing social media content consistently — whether you're a solo founder or managing 10 client brands.",
    readTime: "6 min read",
    date: "May 2025",
  },
  {
    slug: "social-media-management-guide",
    category: "Platform guide",
    title: "The Complete Guide to Social Media Management for Small Businesses",
    excerpt:
      "A no-nonsense guide covering every platform, what works on each one, how to manage community without losing your mind, and when it makes sense to hand it off to a service.",
    readTime: "12 min read",
    date: "April 2025",
  },
];

export default function BlogIndexPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          Blog
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Social media strategy,<br />
          <span style={{ color: "#2F5D62" }}>without the fluff.</span>
        </h1>
        <p className="text-lg leading-8" style={{ color: "#3A3A3A" }}>
          Practical guides for small businesses, solopreneurs, and agencies managing social media.
        </p>
      </section>

      {/* Posts */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border p-8 flex flex-col gap-3 transition hover:shadow-md"
              style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: "#EFE7DA", color: "#8C6A43" }}
                >
                  {post.category}
                </span>
                <span className="text-xs" style={{ color: "#5E6472" }}>{post.date}</span>
                <span className="text-xs" style={{ color: "#5E6472" }}>· {post.readTime}</span>
              </div>
              <h2
                className="text-xl font-bold group-hover:text-[#2F5D62] transition"
                style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
              >
                {post.title}
              </h2>
              <p className="text-sm leading-7" style={{ color: "#3A3A3A" }}>
                {post.excerpt}
              </p>
              <span className="text-sm font-semibold" style={{ color: "#2F5D62" }}>
                Read more →
              </span>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div
          className="mt-8 rounded-2xl border p-8 text-center"
          style={{ background: "#EFE7DA", borderColor: "#D8CCBA" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "#8C6A43" }}>More posts coming soon</p>
          <p className="text-xs" style={{ color: "#5E6472" }}>
            We publish new guides regularly. Follow us on LinkedIn or subscribe below.
          </p>
          <a
            href="mailto:hello@getpostflow.com?subject=Blog updates"
            className="inline-block mt-4 text-xs font-semibold underline"
            style={{ color: "#2F5D62" }}
          >
            Subscribe for updates
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
