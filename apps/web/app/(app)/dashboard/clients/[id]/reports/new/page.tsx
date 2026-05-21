import { notFound } from "next/navigation";
import GenerateReportClient from "./_generate-report-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewReportPage({ params }: Props) {
  const { id } = await params;

  const stubMode =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length <= 30;

  if (stubMode) {
    return (
      <GenerateReportClient
        clientId={id}
        clientName="Demo Client"
        orgName="GetPostFlow Agency"
        brandColor="#2F5D62"
      />
    );
  }

  // Production path — same static-import pattern as existing workspace pages
  const { auth } = await import("@clerk/nextjs/server");
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    const { redirect } = await import("next/navigation");
    redirect("/sign-in");
  }

  return (
    <GenerateReportClient
      clientId={id}
      clientName="Client"
      orgName="Agency"
      brandColor="#2F5D62"
    />
  );
}
