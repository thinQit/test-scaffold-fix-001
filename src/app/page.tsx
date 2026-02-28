'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface PricingTier {
  id: string;
  name: string;
  price_monthly: number;
  features: string[];
  cta_text: string;
}

const iconMap: Record<string, string> = {
  'chart-line': '📈',
  bell: '🔔',
  plug: '🔌',
};

export default function HomePage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pricing, setPricing] = useState<PricingTier[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [featureError, setFeatureError] = useState<string | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchFeatures = async () => {
      setLoadingFeatures(true);
      const { data, error } = await api.get<Feature[]>('/api/features');
      if (!active) return;
      if (error) {
        setFeatureError(error);
      } else {
        setFeatures(data || []);
      }
      setLoadingFeatures(false);
    };

    const fetchPricing = async () => {
      setLoadingPricing(true);
      const { data, error } = await api.get<PricingTier[]>('/api/pricing');
      if (!active) return;
      if (error) {
        setPricingError(error);
      } else {
        setPricing(data || []);
      }
      setLoadingPricing(false);
    };

    fetchFeatures();
    fetchPricing();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12">
      <section className="text-center space-y-6">
        <Badge className="mx-auto w-fit">Analytics for modern teams</Badge>
        <h1 className="text-4xl md:text-5xl font-bold">DataPulse</h1>
        <p className="text-lg text-secondary">
          Real-time analytics dashboards that surface the signals your team needs to act faster.
        </p>
        <p className="text-base text-secondary">
          Track KPIs, automate alerts, and integrate your data sources in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="features-heading">
        <div className="flex items-center justify-between">
          <h2 id="features-heading" className="text-2xl font-semibold">Features built for speed</h2>
          <Link href="/features" className="text-sm font-medium text-primary hover:text-primary-hover">Explore all features</Link>
        </div>
        {loadingFeatures && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {featureError && !loadingFeatures && (
          <div className="rounded-md border border-error bg-red-50 px-4 py-3 text-sm text-error">
            Unable to load features. {featureError}
          </div>
        )}
        {!loadingFeatures && !featureError && features.length === 0 && (
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-secondary">
            Features are being updated. Please check back soon.
          </div>
        )}
        {!loadingFeatures && !featureError && features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">
                      {iconMap[feature.icon] || '✨'}
                    </span>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6" aria-labelledby="pricing-heading">
        <div className="flex items-center justify-between">
          <h2 id="pricing-heading" className="text-2xl font-semibold">Pricing that scales</h2>
          <Link href="/pricing" className="text-sm font-medium text-primary hover:text-primary-hover">See pricing details</Link>
        </div>
        {loadingPricing && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {pricingError && !loadingPricing && (
          <div className="rounded-md border border-error bg-red-50 px-4 py-3 text-sm text-error">
            Unable to load pricing. {pricingError}
          </div>
        )}
        {!loadingPricing && !pricingError && pricing.length === 0 && (
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-secondary">
            Pricing will be available shortly.
          </div>
        )}
        {!loadingPricing && !pricingError && pricing.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricing.map((tier, index) => (
              <Card key={tier.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    {index === 1 && <Badge variant="success">Most popular</Badge>}
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
      </section>
    </div>
  );
}
