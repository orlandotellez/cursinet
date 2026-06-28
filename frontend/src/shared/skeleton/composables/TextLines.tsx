import { SkeletonBase } from '../SkeletonBase';

interface TextLinesProps {
  lines?: number;
  widths?: (string | number)[];
  lineHeight?: number;
  gap?: number;
  className?: string;
}

export function SkeletonTextLines({
  lines = 3,
  widths,
  lineHeight = 14,
  gap = 8,
  className,
}: TextLinesProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          width={widths?.[i] ?? (i === lines - 1 ? '60%' : '100%')}
          height={lineHeight}
        />
      ))}
    </div>
  );
}
