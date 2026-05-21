import ReportScheduleClient from "./_schedule-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportSchedulePage({ params }: Props) {
  const { id } = await params;
  return <ReportScheduleClient clientId={id} clientName="Demo Client" planCode="starter" />;
}
