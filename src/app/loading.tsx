import Spinner from '@/components/ui/Spinner';

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
