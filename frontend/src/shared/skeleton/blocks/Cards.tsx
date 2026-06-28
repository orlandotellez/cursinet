import { SkeletonBase } from '../SkeletonBase';
import { SkeletonCard } from '../composables/Card';
import { SkeletonTextLines } from '../composables/TextLines';
import { SkeletonAvatar } from '../composables/Avatar';

interface ContinueCardProps {
  className?: string;
}

export function SkeletonContinueCard({ className }: ContinueCardProps) {
  return (
    <SkeletonCard className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
        <SkeletonBase width={48} height={48} borderRadius={8} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <SkeletonBase width="70%" height={16} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SkeletonBase height={6} borderRadius={3} style={{ flex: 1 }} />
            <SkeletonBase width={60} height={14} />
          </div>
        </div>
        <SkeletonBase width={18} height={18} borderRadius={4} style={{ flexShrink: 0 }} />
      </div>
    </SkeletonCard>
  );
}

interface CertCardProps {
  className?: string;
}

export function SkeletonCertCard({ className }: CertCardProps) {
  return (
    <SkeletonCard className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
        <SkeletonBase width={40} height={40} borderRadius={8} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <SkeletonBase width={200} height={16} style={{ marginBottom: 6 }} />
          <SkeletonBase width={140} height={12} />
        </div>
        <SkeletonBase width={36} height={36} borderRadius={8} style={{ flexShrink: 0 }} />
      </div>
    </SkeletonCard>
  );
}

export { SkeletonContinueCard as SkeletonContinueRow, SkeletonCertCard as SkeletonCertRow };
