'use client';

import { useState } from 'react';

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

type ViewType = 'table' | 'list' | 'board';

export default function TasksClient({ tasks: initialTasks, clients }: Props) {
  const [view, setView] = useState<ViewType>('table');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Task[]>(initialTasks);

  const filtered = items.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  async function toggleTask(id: string) {
    const task = items.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setItems((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: nextStatus, completedAt: nextStatus === 'done' ? new Date().toISOString() : null }
            : t
        )
      );
    } catch {
      // ignore
    }
  }

  const priorityColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  const statusLabels: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  const tasksByStatus = {
    todo: filtered.filter(t => t.status === 'todo'),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    done: filtered.filter(t => t.status === 'done'),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Your task list across all clients.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          + Create Task
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              border: '1px solid var(--border-soft)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex gap-1 rounded-xl p-1" style={{ border: '1px solid var(--border-soft)', background: 'var(--bg-subtle)' }}>
            {(['table', 'list', 'board'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1 rounded text-xs font-medium transition"
                style={{
                  background: view === v ? 'var(--brand-primary)' : 'transparent',
                  color: view === v ? 'white' : 'var(--text-secondary)',
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'todo', 'in_progress', 'done'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="px-3 py-1 rounded-full text-xs font-medium transition"
              style={{
                background: filter === status ? 'var(--brand-primary)' : 'var(--subtle)',
                color: filter === status ? 'white' : 'var(--text-secondary)',
              }}
            >
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl px-4 py-8 text-center text-xs"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
        >
          No tasks found.
        </div>
      ) : view === 'table' ? (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-soft)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-soft)' }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Title</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Client</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Priority</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{task.title}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{task.clientName}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${priorityColors[task.priority] ?? '#9ca3af'}18`,
                        color: priorityColors[task.priority] ?? '#9ca3af',
                      }}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {statusLabels[task.status] || task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : view === 'list' ? (
        <div className="flex flex-col gap-3">
          {filtered.map(task => (
            <div
              key={task.id}
              className="rounded-xl overflow-hidden p-4"
              style={{
                border: '1px solid var(--border-soft)',
                background: 'var(--bg-subtle)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {task.clientName}
                  </p>
                  {task.description && (
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${priorityColors[task.priority] ?? '#9ca3af'}18`,
                        color: priorityColors[task.priority] ?? '#9ca3af',
                      }}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                      {statusLabels[task.status] || task.status}
                    </span>
                  </div>
                </div>
                {task.dueDate && (
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Due</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['todo', 'in_progress', 'done'].map(status => (
            <div key={status}>
              <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--bg-subtle)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {statusLabels[status]} ({tasksByStatus[status as keyof typeof tasksByStatus].length})
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {tasksByStatus[status as keyof typeof tasksByStatus].map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl"
                    style={{
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{task.clientName}</p>
                    <div className="flex gap-1 mt-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${priorityColors[task.priority] ?? '#9ca3af'}18`,
                          color: priorityColors[task.priority] ?? '#9ca3af',
                        }}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
