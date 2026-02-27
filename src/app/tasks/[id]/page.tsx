'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import type { Task } from '@/types';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await api.get<{ task: Task }>(`/api/tasks/${id}`);

    if (apiError || !data?.task) {
      setError(apiError || 'Unable to load task.');
      setTask(null);
      setLoading(false);
      return;
    }

    const fetchedTask = data.task;
    setTask(fetchedTask);
    setTitle(fetchedTask.title);
    setDescription(fetchedTask.description || '');
    setDueDate(fetchedTask.dueDate ? new Date(fetchedTask.dueDate).toISOString().slice(0, 10) : '');
    setPriority(fetchedTask.priority);
    setStatus(fetchedTask.status);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      description: description || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      status,
    };

    const { data, error: apiError } = await api.put<{ task: Task }>(`/api/tasks/${id}`, payload);

    if (apiError || !data?.task) {
      setError(apiError || 'Unable to update task.');
      toast(apiError || 'Task update failed', 'error');
      setSaving(false);
      return;
    }

    setTask(data.task);
    toast('Task updated successfully!', 'success');
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error: apiError } = await api.delete<null>(`/api/tasks/${id}`);
    if (apiError) {
      setError(apiError);
      toast(apiError, 'error');
      return;
    }
    toast('Task deleted', 'success');
    router.push('/tasks');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-secondary">Task not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold">Task details</h1>
            <Badge>{task.status}</Badge>
          </div>
          <p className="text-sm text-secondary">Created on {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>
            <Input
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground" htmlFor="priority">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as Task['priority'])}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Task['status'])}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/tasks')}>
                Back to tasks
              </Button>
              <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete task">
        <p className="text-sm text-secondary">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TaskDetailPage;
