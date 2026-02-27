'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import type { User } from '@/types';

export function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<{ user: { id: string; email: string; displayName?: string; createdAt?: string }; token: string }>(
      '/api/auth/register',
      { email, password, displayName: displayName || undefined }
    );

    if (apiError || !data?.user) {
      setError(apiError || 'Unable to register. Please try again.');
      toast(apiError || 'Registration failed', 'error');
      setLoading(false);
      return;
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.displayName || data.user.email.split('@')[0],
      displayName: data.user.displayName,
      role: 'customer',
      createdAt: data.user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('token', data.token);
    login(user);
    toast('Account created successfully!', 'success');
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-xl font-semibold">Create an account</h1>
          <p className="text-sm text-secondary">Start organizing your tasks in minutes.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Jane Doe"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Create account
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Already have an account? Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
