import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@getpostflow/ai",
    "@getpostflow/auth",
    "@getpostflow/billing",
    "@getpostflow/permissions",
    "@getpostflow/shared",
    "@getpostflow/social",
    "@getpostflow/ui",
  ],
  // Clerk routes
  env: {
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
  },
};

export default nextConfig;
