'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import type { User } from '@/types';

export function ProfilePage() {
  const { user, setUser, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ id: string; email: string; displayName?: string; createdAt?: string } | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await api.get<{ id: string; email: string; displayName?: string; createdAt?: string }>(
      '/api/users/me'
    );

    if (apiError || !data) {
      setError(apiError || 'Unable to load profile.');
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(data);
    setDisplayName(data.displayName || '');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProfile();
  }, [fetchProfile, isAuthenticated]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);

    const { data, error: apiError } = await api.put<{ user: { id: string; email: string; displayName?: string; createdAt?: string } }>(
      `/api/users/${profile.id}`,
      { displayName: displayName || undefined }
    );

    if (apiError || !data?.user) {
      setError(apiError || 'Unable to update profile.');
      toast(apiError || 'Profile update failed', 'error');
      setSaving(false);
      return;
    }

    setProfile(data.user);
    const updatedUser: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.displayName || data.user.email.split('@')[0],
      displayName: data.user.displayName,
      role: user?.role || 'customer',
      createdAt: data.user.createdAt || user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(updatedUser);
    toast('Profile updated successfully!', 'success');
    setSaving(false);
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
            <p className="text-secondary">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-secondary">Update your personal information.</p>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {error && !loading && (
            <p className="text-sm text-error">{error}</p>
          )}
          {!loading && profile && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Email" value={profile.email} disabled />
              <Input
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Member since"
                value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                disabled
              />
              {error && <p className="text-sm text-error">{error}</p>}
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </form>
          )}
          {!loading && !error && !profile && (
            <p className="text-secondary">No profile data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
