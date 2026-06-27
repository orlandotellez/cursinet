import {
  SkeletonHeader,
  SkeletonCardGrid,
} from '@/src/shared/components/PageSkeleton';

export const FavoritosSkeleton = Loading;

export default function Loading() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <SkeletonHeader titleWidth={140} actionWidth={80} />
      <SkeletonCardGrid count={6} showHeart showStats />
    </div>
  );
}
