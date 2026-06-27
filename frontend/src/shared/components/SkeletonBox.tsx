import styles from './SkeletonBox.module.css';

interface SkeletonBoxProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonBox({
  height = 16,
  width = '100%',
  borderRadius = 5,
  className = '',
  style,
}: SkeletonBoxProps) {
  return (
    <div
      className={`${styles.base} ${className}`}
      style={{ height, width, borderRadius, ...style }}
    />
  );
}


interface SkeletonCardProps {
  count?: number;
  showThumbnail?: boolean;
  showAction?: boolean;
  className?: string;
}

export function SkeletonCardGrid({
  count = 6,
  showThumbnail = true,
  showAction = false,
}: SkeletonCardProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          {showAction && (
            <SkeletonBox
              width={32}
              height={32}
              borderRadius={8}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
            />
          )}
          {showThumbnail && (
            <SkeletonBox width="100%" height={0} style={{ aspectRatio: '16 / 9', borderRadius: 0 }} />
          )}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <SkeletonBox width={80} height={20} borderRadius={4} />
              <SkeletonBox width={90} height={20} borderRadius={4} />
            </div>
            <SkeletonBox width="85%" height={18} />
            <SkeletonBox width="50%" height={14} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <SkeletonBox height={6} borderRadius={3} style={{ flex: 1 }} />
              <SkeletonBox width={60} height={14} />
            </div>
            <SkeletonBox width={120} height={36} borderRadius={8} style={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  showIcon?: boolean;
  iconSize?: number;
  lines?: number;
  showAction?: boolean;
  actionWidth?: number;
  actionHeight?: number;
}

export function SkeletonListItem({
  count = 4,
  showIcon = true,
  iconSize = 40,
  lines = 2,
  showAction = true,
  actionWidth = 100,
  actionHeight = 36,
}: SkeletonListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          {showIcon && <SkeletonBox width={iconSize} height={iconSize} borderRadius={8} style={{ flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            {Array.from({ length: lines }).map((_, j) => (
              <SkeletonBox
                key={j}
                width={j === 0 ? '60%' : '90%'}
                height={j === 0 ? 15 : 13}
                borderRadius={4}
                style={{ marginBottom: j < lines - 1 ? 6 : 0 }}
              />
            ))}
          </div>
          {showAction && <SkeletonBox width={actionWidth} height={actionHeight} borderRadius={8} style={{ flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}
