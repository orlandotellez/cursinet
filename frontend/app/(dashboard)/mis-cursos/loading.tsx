import {
  SkeletonHeader,
  SkeletonTabs,
  SkeletonCardGrid,
} from '@/src/shared/components/PageSkeleton';

export const MisCursosSkeleton = Loading;

export default function Loading() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <SkeletonHeader titleWidth={140} actionWidth={80} />
      <SkeletonTabs count={3} />
      <SkeletonCardGrid count={6} showStats={false} />
    </div>
  );
}
