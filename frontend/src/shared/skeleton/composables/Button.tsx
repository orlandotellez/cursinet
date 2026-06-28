import { SkeletonBase } from '../SkeletonBase';

interface SkeletonButtonProps {
  width?: number;
  height?: number;
  className?: string;
}

export function SkeletonButton({ width = 120, height = 36, className }: SkeletonButtonProps) {
  return <SkeletonBase width={width} height={height} borderRadius={8} className={className} />;
}
