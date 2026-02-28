import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-secondary">The page you are looking for does not exist.</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );
}
