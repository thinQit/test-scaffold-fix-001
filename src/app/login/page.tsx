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

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<{ user: { id: string; email: string; displayName?: string; createdAt?: string }; token: string }>(
      '/api/auth/login',
      { email, password }
    );

    if (apiError || !data?.user) {
      setError(apiError || 'Unable to log in. Please try again.');
      toast(apiError || 'Login failed', 'error');
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
    toast('Welcome back!', 'success');
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="text-sm text-secondary">Access your tasks and dashboard.</p>
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
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Log in
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => router.push('/register')}
            >
              Need an account? Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
