import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import Navigation from '@/components/layout/Navigation';

export const metadata = {
  title: 'DataPulse - Analytics That Drive Decisions',
  description: 'DataPulse is a modern analytics platform for real-time insights, alerts, and integrations.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
