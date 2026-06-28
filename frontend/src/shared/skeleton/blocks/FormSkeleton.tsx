import { SkeletonBase } from '../SkeletonBase';
import { SkeletonCard } from '../composables/Card';
import { SkeletonTextLines } from '../composables/TextLines';

interface FormSkeletonProps {
  fields?: { labelWidth: number; inputHeight: number }[];
  sections?: number;
  className?: string;
}

const DEFAULT_FIELDS = [
  { labelWidth: 60, inputHeight: 40 },
  { labelWidth: 140, inputHeight: 40 },
  { labelWidth: 50, inputHeight: 80 },
];

export function SkeletonFormSkeleton({
  fields = DEFAULT_FIELDS,
  sections = 1,
  className,
}: FormSkeletonProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className={className}>
      {Array.from({ length: sections }).map((_, s) => (
        <SkeletonCard key={s}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <SkeletonBase width={18} height={18} borderRadius={4} />
              <SkeletonBase width={s === 0 ? 60 : 100} height={16} />
            </div>
            {fields.map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SkeletonBase width={f.labelWidth} height={13} />
                <SkeletonBase width="100%" height={f.inputHeight} borderRadius={8} />
              </div>
            ))}
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
