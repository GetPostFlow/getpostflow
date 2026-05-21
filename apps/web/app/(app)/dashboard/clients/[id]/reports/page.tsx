import ReportsListClient from "./_reports-list-client";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Reports — GetPostFlow",
};

export default async function ReportsPage({ params }: Props) {
  const { id } = await params;

  const stubMode =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length <= 30;

  if (stubMode) {
    return <ReportsListClient clientId={id} clientName="Demo Client" />;
  }

  // Production: delegate auth check to the shell layout — just pass the id through
  return <ReportsListClient clientId={id} clientName="Client" />;
}
