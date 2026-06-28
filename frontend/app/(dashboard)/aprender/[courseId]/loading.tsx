import { SkeletonBase } from '@/src/shared/skeleton';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      gap: 16,
      padding: 24,
    }}>
      <SkeletonBase width={48} height={48} borderRadius={9999} />
      <SkeletonBase width={200} height={16} />
      <SkeletonBase width={140} height={12} />
    </div>
  );
}
