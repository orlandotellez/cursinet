import s from '@/src/shared/styles/skeleton.module.css';
import {
  SkeletonHeader,
  SkeletonStatCards,
  SkeletonContinueCard,
  SkeletonCertCard,
} from '@/src/shared/components/PageSkeleton';

export const DashboardSkeleton = Loading;

export default function Loading() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <SkeletonHeader titleWidth={260} subtitleWidth={200} actionWidth={140} />

      {/* Stats Cards */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonStatCards />
      </div>

      {/* Continue Learning */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div className={s.base} style={{ height: 18, width: 200 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonContinueCard key={i} />
          ))}
        </div>
      </div>

      {/* Recent Certificates */}
      <div>
        <div className={s.base} style={{ height: 18, width: 200, marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCertCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
