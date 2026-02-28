'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Signup', href: '/signup' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4" aria-label="Primary">
        <Link href="/" className="text-xl font-bold">DataPulse</Link>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border border-border p-2"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </div>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-secondary hover:text-foreground">
              {link.label}
            </Link>
          ))}
          {loading ? (
            <span className="text-sm text-secondary">Loading...</span>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">Hi, {user.name}</span>
              <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup"><Button size="sm">Sign Up</Button></Link>
              <Link href="/login"><Button size="sm" variant="ghost">Log In</Button></Link>
            </div>
          )}
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {loading ? (
            <span className="text-sm text-secondary">Loading...</span>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">Hi, {user.name}</span>
              <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup"><Button size="sm">Sign Up</Button></Link>
              <Link href="/login"><Button size="sm" variant="ghost">Log In</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navigation;
