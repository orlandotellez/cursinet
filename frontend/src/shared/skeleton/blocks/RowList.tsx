import { SkeletonBase } from '../SkeletonBase';
import { SkeletonTextLines } from '../composables/TextLines';
import { SkeletonCard } from '../composables/Card';

interface RowListProps {
  count?: number;
  iconSize?: number;
  lines?: number;
  showAction?: boolean;
  actionWidth?: number;
  actionHeight?: number;
  className?: string;
}

export function SkeletonRowList({
  count = 4,
  iconSize = 40,
  lines = 2,
  showAction,
  actionWidth = 100,
  actionHeight = 36,
  className,
}: RowListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
            <SkeletonBase width={iconSize} height={iconSize} borderRadius={8} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <SkeletonTextLines lines={lines} widths={['60%', '90%']} lineHeight={lines === 1 ? 15 : 13} gap={4} />
            </div>
            {showAction && (
              <SkeletonBase width={actionWidth} height={actionHeight} borderRadius={8} style={{ flexShrink: 0 }} />
            )}
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
