'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface LeadResponse {
  id: string;
  status: string;
  lead: {
    name?: string;
    email?: string;
    selected_plan?: string;
    created_at?: string;
  };
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const selectedPlan = useMemo(() => searchParams.get('plan') || '', [searchParams]);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState(selectedPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      selected_plan: plan || undefined,
    };

    const { data, error } = await api.post<LeadResponse>('/api/leads', payload);
    setLoading(false);

    if (error) {
      setError(error);
      toast('Unable to submit your request. Please try again.', 'error');
      return;
    }

    if (data) {
      setSuccess(true);
      toast('Thanks for signing up! We will be in touch soon.', 'success');
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Start your DataPulse trial</h1>
          <p className="text-secondary">
            Share your details and we will get you set up with dashboards tailored to your team.
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="rounded-md border border-success bg-green-50 px-4 py-4 text-sm text-green-700">
              We received your request! Expect a confirmation email shortly.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Full name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                required
              />
              <Input
                label="Work email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@datapulse.com"
                required
              />
              <div className="space-y-1">
                <label htmlFor="plan" className="block text-sm font-medium text-foreground">
                  Selected plan (optional)
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={plan}
                  onChange={(event) => setPlan(event.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No plan selected</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              {error && (
                <div className="rounded-md border border-error bg-red-50 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}
              <Button type="submit" fullWidth loading={loading}>
                {loading ? 'Submitting' : 'Request access'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
