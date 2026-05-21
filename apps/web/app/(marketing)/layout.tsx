import { OrganizationJsonLd, ServiceJsonLd } from "@/lib/marketing/json-ld";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OrganizationJsonLd />
      <ServiceJsonLd />
      {children}
    </>
  );
}
