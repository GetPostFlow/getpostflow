import { createDb } from "@getpostflow/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { contentTable } from "@getpostflow/db/schema";
import { auth } from "@getpostflow/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Content Calendar",
  description: "View all scheduled content across your clients",
};

export default async function ContentCalendarPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/");

  const db = createDb();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const scheduledContent = await db
    .select()
    .from(contentTable)
    .where(
      and(
        eq(contentTable.orgId, orgId),
        gte(contentTable.scheduledAt, monthStart),
        lte(contentTable.scheduledAt, monthEnd)
      )
    )
    .orderBy(contentTable.scheduledAt);

  const contentByDate = scheduledContent.reduce(
    (acc: any, content: any) => {
      const date = content.scheduledAt?.toISOString().split("T")[0] || "unscheduled";
      if (!acc[date]) acc[date] = [];
      acc[date].push(content);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all scheduled content across your clients
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(contentByDate).length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No scheduled content for this month</p>
          </div>
        ) : (
          Object.entries(contentByDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, contents]) => (
              <div key={date} className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold mb-3">
                  {date === "unscheduled" ? "Unscheduled" : new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="space-y-2">
                  {(contents as any[]).map((content: any) => (
                    <div
                      key={content.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium">{content.title}</p>
                        <p className="text-xs text-muted-foreground">{content.platform}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
                        {content.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
