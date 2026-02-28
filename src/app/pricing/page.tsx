'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface PricingTier {
  id: string;
  name: string;
  price_monthly: number;
  features: string[];
  cta_text: string;
}

export default function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchPricing = async () => {
      setLoading(true);
      const { data, error } = await api.get<PricingTier[]>('/api/pricing');
      if (!active) return;
      if (error) {
        setError(error);
      } else {
        setTiers(data || []);
      }
      setLoading(false);
    };

    fetchPricing();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-secondary max-w-2xl">
          Simple, transparent pricing for teams of every size. Start with a free trial and upgrade anytime.
        </p>
      </section>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-7 w-7" />
        </div>
      )}
      {error && !loading && (
        <div className="rounded-md border border-error bg-red-50 px-4 py-3 text-sm text-error">
          Unable to load pricing. {error}
        </div>
      )}
      {!loading && !error && tiers.length === 0 && (
        <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-secondary">
          Pricing details are not available.
        </div>
      )}
      {!loading && !error && tiers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier, index) => (
            <Card key={tier.id} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{tier.name}</h2>
                  {index === 1 && <Badge variant="success">Best value</Badge>}
                </div>
                <p className="text-3xl font-bold">${tier.price_monthly}/mo</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-secondary">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${encodeURIComponent(tier.id)}`}>
                  <Button fullWidth>{tier.cta_text}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
