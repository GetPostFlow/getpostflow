import { createDb, contentItems } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import { requireOrgAuth } from "@/lib/auth-org";
import { redirect } from "next/navigation";

export default async function ContentCalendarPage() {
  const { orgRow } = await requireOrgAuth();
  if (!orgRow) redirect("/sign-in");

  const db = createDb();

  const scheduledContent = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.orgId, orgRow.id),
        eq(contentItems.status, "scheduled")
      )
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global view of all scheduled posts across your agency.
        </p>
      </div>

      <div className="p-12 bg-card border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
          📅
        </div>
        <h3 className="font-semibold">Calendar View Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          We are currently building the interactive calendar view. You have {scheduledContent.length} posts scheduled.
        </p>
      </div>
    </div>
  );
}
