import { SkeletonBase } from '../SkeletonBase';
import { SkeletonCard } from '../composables/Card';
import { SkeletonAvatar } from '../composables/Avatar';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTableSkeleton({ rows = 8, columns = 6, className }: TableSkeletonProps) {
  return (
    <SkeletonCard className={className}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} style={{ padding: '12px 16px', textAlign: 'left' }}>
                  <SkeletonBase width={i === 0 ? 120 : i === 1 ? 200 : 80} height={14} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
                    {c === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <SkeletonAvatar size={32} />
                        <SkeletonBase width={100} height={14} />
                      </div>
                    ) : (
                      <SkeletonBase width={c === 1 ? 180 : 70} height={14} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SkeletonCard>
  );
}
