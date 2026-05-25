import { requireOrgAuth } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import { tasks, clients } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";
import TasksClient from "./_tasks-client";

export const metadata: Metadata = {
  title: "Tasks — GetPostFlow",
};

export default async function TasksPage() {
  const db = createDb(process.env.DATABASE_URL!);
  const { orgRow: org } = await requireOrgAuth();

  const clientList = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(eq(clients.orgId, org.id));

  const clientIds = clientList.map((c) => c.id);

  const taskRows =
    clientIds.length > 0
      ? await db
          .select()
          .from(tasks)
          .where(eq(tasks.clientId, clientIds[0])) // simplistic: show tasks for first client or all
          .orderBy(desc(tasks.createdAt))
          .limit(50)
      : [];

  // If no tasks yet, seed demo tasks
  if (taskRows.length === 0 && clientIds.length > 0) {
    for (let i = 0; i < Math.min(clientIds.length, 3); i++) {
      const cid = clientIds[i];
      const cname = clientList.find((c) => c.id === cid)?.name ?? "Client";
      await db.insert(tasks).values({
        title: `Review ${cname} strategy`,
        description: "Review and approve the brand strategy draft.",
        clientId: cid,
        status: "todo",
        priority: "high",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
      await db.insert(tasks).values({
        title: `Draft ${cname} May posts`,
        description: "Create 8-12 posts for the May content calendar.",
        clientId: cid,
        status: "in_progress",
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
    // Add one more generic task
    await db.insert(tasks).values({
      title: "Approve Northwind intake",
      description: "Review the submitted brand intake form.",
      clientId: clientIds[0],
      status: "todo",
      priority: "low",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });
  }

  const refreshed =
    clientIds.length > 0
      ? await db
          .select()
          .from(tasks)
          .orderBy(desc(tasks.createdAt))
          .limit(50)
      : [];

  return (
    <TasksClient
      tasks={refreshed.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        clientId: t.clientId,
        clientName: clientList.find((c) => c.id === t.clientId)?.name ?? "—",
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        completedAt: t.completedAt?.toISOString() ?? null,
      }))}
      clients={clientList}
    />
  );
}
