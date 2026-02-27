'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { Task } from '@/types';

interface TaskListResponse {
  items: Task[];
  meta: { page: number; limit: number; total: number };
}

const statusLabels: Record<Task['status'], { label: string; variant: 'default' | 'warning' | 'success' }> = {
  todo: { label: 'To do', variant: 'default' },
  in_progress: { label: 'In progress', variant: 'warning' },
  done: { label: 'Done', variant: 'success' },
};

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number }>({ page: 1, limit: 10, total: 0 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dueAfter, setDueAfter] = useState('');
  const [dueBefore, setDueBefore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(meta.page));
    params.set('limit', String(meta.limit));
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (dueAfter) params.set('dueAfter', dueAfter);
    if (dueBefore) params.set('dueBefore', dueBefore);

    const { data, error: apiError } = await api.get<TaskListResponse>(`/api/tasks?${params.toString()}`);

    if (apiError) {
      setError(apiError);
      setTasks([]);
      setLoading(false);
      return;
    }

    setTasks(data?.items || []);
    setMeta((prev) => ({
      ...prev,
      page: data?.meta.page || prev.page,
      limit: data?.meta.limit || prev.limit,
      total: data?.meta.total || 0,
    }));
    setLoading(false);
  }, [meta.page, meta.limit, status, search, dueAfter, dueBefore]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTasks();
  }, [fetchTasks, isAuthenticated]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const handleDelete = async () => {
    if (!deleteTaskId) return;
    const { error: apiError } = await api.delete<null>(`/api/tasks/${deleteTaskId}`);
    if (apiError) {
      setError(apiError);
      setDeleteTaskId(null);
      return;
    }
    setDeleteTaskId(null);
    fetchTasks();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-secondary">Please log in to view your tasks.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-secondary">Manage and track your tasks.</p>
        </div>
        <Button onClick={() => router.push('/tasks/new')}>Create task</Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <Input
            label="Due after"
            type="date"
            value={dueAfter}
            onChange={(event) => setDueAfter(event.target.value)}
          />
          <Input
            label="Due before"
            type="date"
            value={dueBefore}
            onChange={(event) => setDueBefore(event.target.value)}
          />
          <div className="md:col-span-4 flex flex-wrap gap-2">
            <Button onClick={() => fetchTasks()} loading={loading}>
              Apply filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStatus('');
                setSearch('');
                setDueAfter('');
                setDueBefore('');
                setMeta((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && !loading && (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && tasks.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-secondary">No tasks found. Create your first task.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-secondary">{task.description || 'No description provided.'}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-secondary">
                    <span>Priority: {priorityLabels[task.priority]}</span>
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusLabels[task.status].variant}>{statusLabels[task.status].label}</Badge>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.id}`)}>
                    View
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTaskId(task.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm text-secondary">
            Page {meta.page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeta((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={meta.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeta((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={meta.page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        title="Delete task"
      >
        <p className="text-sm text-secondary">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TasksPage;
