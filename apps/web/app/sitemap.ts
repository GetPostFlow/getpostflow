import type { MetadataRoute } from "next";

const BASE_URL = "https://getpostflow.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const marketingPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/features", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/case-studies", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/blog/content-calendar-tips", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/blog/social-media-management-guide", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/careers", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/legal/cookie-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/legal/gdpr", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return marketingPages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
