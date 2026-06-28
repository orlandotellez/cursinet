import { SkeletonBase } from '../SkeletonBase';
import { SkeletonTextLines } from '../composables/TextLines';
import { SkeletonCard } from '../composables/Card';

interface CardGridProps {
  count?: number;
  variant?: 'course' | 'simple';
  showHeart?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  className?: string;
}

export function SkeletonCardGrid({
  count = 6,
  variant = 'course',
  showHeart,
  showProgress,
  showStats,
  className,
}: CardGridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          {variant === 'course' ? (
            <>
              {showHeart && (
                <SkeletonBase
                  width={32}
                  height={32}
                  borderRadius={8}
                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
                />
              )}
              <SkeletonBase width="100%" height={0} style={{ aspectRatio: '16 / 9', borderRadius: 0 }} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <SkeletonBase width={80} height={20} borderRadius={4} />
                  <SkeletonBase width={90} height={20} borderRadius={4} />
                </div>
                <SkeletonBase width="85%" height={18} />
                <SkeletonBase width="50%" height={14} />
                {showStats && (
                  <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <SkeletonBase width={14} height={14} borderRadius={3} />
                        <SkeletonBase width={24} height={12} />
                      </div>
                    ))}
                  </div>
                )}
                {showProgress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <SkeletonBase height={6} borderRadius={3} style={{ flex: 1 }} />
                    <SkeletonBase width={60} height={14} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonTextLines lines={3} widths={['80%', '100%', '60%']} />
            </div>
          )}
        </SkeletonCard>
      ))}
    </div>
  );
}
