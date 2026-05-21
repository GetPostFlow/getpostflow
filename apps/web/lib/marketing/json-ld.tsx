const BASE_URL = "https://getpostflow.com";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetPostFlow",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@getpostflow.com",
      contactType: "customer service",
    },
    sameAs: [
      "https://www.linkedin.com/company/getpostflow",
      "https://twitter.com/getpostflow",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ServiceJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Social Media Management",
    provider: {
      "@type": "Organization",
      name: "GetPostFlow",
      url: BASE_URL,
    },
    name: "Done-for-You Social Media Management",
    description:
      "GetPostFlow provides full-service social media management: content creation, scheduling, community management, analytics, and client approval workflows.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "299",
      highPrice: "1499",
      offerCount: 5,
    },
    areaServed: "Worldwide",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BlogPostJsonLd({
  title,
  description,
  url,
  datePublished,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${BASE_URL}${url}`,
    datePublished,
    author: {
      "@type": "Organization",
      name: "GetPostFlow",
    },
    publisher: {
      "@type": "Organization",
      name: "GetPostFlow",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
