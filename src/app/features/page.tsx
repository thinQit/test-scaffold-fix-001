'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, string> = {
  'chart-line': '📊',
  bell: '🔔',
  plug: '🔌',
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchFeatures = async () => {
      setLoading(true);
      const { data, error } = await api.get<Feature[]>('/api/features');
      if (!active) return;
      if (error) {
        setError(error);
      } else {
        setFeatures(data || []);
      }
      setLoading(false);
    };

    fetchFeatures();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Product Features</h1>
        <p className="text-secondary max-w-2xl">
          DataPulse makes analytics actionable with curated dashboards, proactive alerts, and rapid integrations.
        </p>
      </section>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-7 w-7" />
        </div>
      )}
      {error && !loading && (
        <div className="rounded-md border border-error bg-red-50 px-4 py-3 text-sm text-error">
          Unable to load features. {error}
        </div>
      )}
      {!loading && !error && features.length === 0 && (
        <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-secondary">
          Features are not available right now.
        </div>
      )}
      {!loading && !error && features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {iconMap[feature.icon] || '✨'}
                  </span>
                  <h2 className="text-xl font-semibold">{feature.title}</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
