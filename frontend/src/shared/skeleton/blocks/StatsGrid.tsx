import { SkeletonBase } from '../SkeletonBase';

interface StatsGridProps {
  count?: number;
  className?: string;
}

export function SkeletonStatsGrid({ count = 4, className }: StatsGridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)`,
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '24px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <SkeletonBase width={40} height={40} borderRadius={8} />
          <SkeletonBase width={48} height={24} borderRadius={4} />
          <SkeletonBase width={80} height={12} />
        </div>
      ))}
    </div>
  );
}
