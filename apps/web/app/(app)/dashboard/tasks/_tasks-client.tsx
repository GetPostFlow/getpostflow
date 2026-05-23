"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  clientId: string | null;
  clientName: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface Props {
  tasks: Task[];
  clients: { id: string; name: string }[];
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

export default function TasksClient({ tasks, clients }: Props) {
  const [items, setItems] = useState<Task[]>(tasks);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDueDate, setNewDueDate] = useState("");

  async function toggleTask(id: string) {
    const task = items.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === "done" ? "todo" : "done";
    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: nextStatus, completedAt: nextStatus === "done" ? new Date().toISOString() : null }
            : t
        )
      );
    } catch {
      // ignore
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          clientId: newClientId || null,
          priority: newPriority,
          dueDate: newDueDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { task: Task };
      setItems((prev) => [data.task, ...prev]);
      setNewTitle("");
      setNewClientId("");
      setNewPriority("medium");
      setNewDueDate("");
      setShowCreate(false);
    } catch {
      alert("Failed to create task");
    }
  }

  const myTasks = items.filter((t) => t.status !== "done");
  const completed = items.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Tasks</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Your task list across all clients.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "var(--brand-primary)" }}
        >
          + Create Task
        </button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-4 flex flex-col gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
            />
            <div className="flex gap-2">
              <select
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium transition"
                style={{ border: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="rounded-xl px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                Create
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {myTasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => toggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{task.title}</span>
                    {task.clientName && task.clientName !== "—" && (
                      <Badge variant="muted">{task.clientName}</Badge>
                    )}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${PRIORITY_COLORS[task.priority] ?? "#9ca3af"}18`,
                        color: PRIORITY_COLORS[task.priority] ?? "#9ca3af",
                      }}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {completed.map((task) => (
          <Card key={task.id} className="overflow-hidden opacity-60">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium line-through" style={{ color: "var(--text-muted)" }}>{task.title}</span>
                  {task.clientName && task.clientName !== "—" && (
                    <Badge variant="muted">{task.clientName}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              No tasks yet. Create one to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
