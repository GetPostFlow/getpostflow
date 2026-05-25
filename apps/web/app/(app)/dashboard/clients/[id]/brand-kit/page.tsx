import type { Metadata } from "next";
import BrandKitClient from "./_brand-kit-client";

export const metadata: Metadata = {
  title: "Brand Kit — GetPostFlow",
};

export default function BrandKitPage({ params }: { params: Promise<{ id: string }> }) {
  return <BrandKitClient params={params} />;
}
