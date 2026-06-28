import { DashboardSkeleton } from '@/src/shared/skeleton';

export default function Loading() {
  return <DashboardSkeleton variant="grid" count={6} />;
}
