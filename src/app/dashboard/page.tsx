'use client';

import { useCallback, useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { TaskSummary } from '@/types';

export function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const { data, error: apiError } = await api.get<TaskSummary>(
      `/api/dashboard/summary${params.toString() ? `?${params.toString()}` : ''}`
    );

    if (apiError) {
      setError(apiError);
      setSummary(null);
      setLoading(false);
      return;
    }

    setSummary(data || null);
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchSummary();
  }, [fetchSummary, isAuthenticated]);

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
            <p className="text-secondary">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-secondary">Overview of your tasks and progress.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <Button onClick={fetchSummary} loading={loading}>
            Apply filters
          </Button>
        </div>
      </div>

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

      {!loading && !error && summary && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <p className="text-sm text-secondary">Total tasks</p>
                <p className="text-2xl font-semibold">{summary.total}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm text-secondary">Completed</p>
                <p className="text-2xl font-semibold">{summary.completed}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm text-secondary">Overdue</p>
                <p className="text-2xl font-semibold">{summary.overdue}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm text-secondary">Due soon</p>
                <p className="text-2xl font-semibold">{summary.dueSoon}</p>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Status breakdown</h2>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm">To do</span>
                <Badge>{summary.byStatus.todo}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm">In progress</span>
                <Badge variant="warning">{summary.byStatus.in_progress}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm">Done</span>
                <Badge variant="success">{summary.byStatus.done}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && !summary && (
        <Card>
          <CardContent>
            <p className="text-secondary">No summary data available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DashboardPage;
