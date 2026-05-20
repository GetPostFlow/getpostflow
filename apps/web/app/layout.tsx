import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GetPostFlow",
  description:
    "AI-powered social community management, multilingual content creation, approvals, and reporting.",
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
      <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
        <body>{children}</body>
      </html>
    </MaybeClerkProvider>
  );
}
