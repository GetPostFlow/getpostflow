import type { Metadata } from "next";
import { Poppins, Montserrat, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-subtitle",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const BASE_URL = "https://getpostflow.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GetPostFlow — Done-for-You Social Media Management",
    template: "%s | GetPostFlow",
  },
  description:
    "GetPostFlow is a done-for-you social media management service. Real strategists plan your content, manage your community, and send monthly reports while you focus on your business.",
  keywords: ["social media management", "done-for-you social media", "social media agency", "content creation", "community management"],
  authors: [{ name: "GetPostFlow", url: BASE_URL }],
  creator: "GetPostFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "GetPostFlow",
    title: "GetPostFlow — Done-for-You Social Media Management",
    description: "Real strategists plan your content, manage your community, and send monthly reports.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GetPostFlow — Done-for-You Social Media Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetPostFlow — Done-for-You Social Media Management",
    description: "Real strategists plan your content, manage your community, and send monthly reports.",
    images: ["/og-image.png"],
    creator: "@getpostflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// Preview/stub mode: ClerkProvider is only mounted when a real publishable key is present.
// This allows the public marketing surface to render without Clerk errors
// when deployed with placeholder env vars for preview builds.
// A real Clerk key encodes a valid instance hostname in base64 after the prefix.
// We detect stub/placeholder keys by checking for the well-known example.com stub value.
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const STUB_CLERK_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
const isRealClerkKey =
  (clerkKey.startsWith("pk_live_") || clerkKey.startsWith("pk_test_")) &&
  clerkKey !== STUB_CLERK_KEY &&
  clerkKey.length > 30;

function MaybeClerkProvider({ children }: { children: React.ReactNode }) {
  if (!isRealClerkKey) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MaybeClerkProvider>
      <html lang="en" className={`${poppins.variable} ${montserrat.variable} ${dmSans.variable}`}>
        <body>{children}</body>
      </html>
    </MaybeClerkProvider>
  );
}
