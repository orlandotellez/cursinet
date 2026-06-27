import {
  SkeletonHeader,
  SkeletonRowList,
} from '@/src/shared/components/PageSkeleton';

export const CertificadosSkeleton = Loading;

export default function Loading() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <SkeletonHeader titleWidth={160} actionWidth={100} />
      <SkeletonRowList count={3} iconSize={48} lines={2} />
    </div>
  );
}
