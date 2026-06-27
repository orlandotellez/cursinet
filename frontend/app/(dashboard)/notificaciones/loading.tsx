import {
  SkeletonHeader,
  SkeletonRowList,
} from '@/src/shared/components/PageSkeleton';

export const NotificacionesSkeleton = Loading;

export default function Loading() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <SkeletonHeader titleWidth={200} subtitleWidth={80} actionWidth={180} />
      <SkeletonRowList count={4} iconSize={36} lines={3} />
    </div>
  );
}
