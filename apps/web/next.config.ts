import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@getpostflow/ai",
    "@getpostflow/auth",
    "@getpostflow/billing",
    "@getpostflow/permissions",
    "@getpostflow/shared",
    "@getpostflow/social",
    "@getpostflow/ui"
  ]
};

export default nextConfig;
