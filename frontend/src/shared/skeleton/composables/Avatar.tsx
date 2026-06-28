import { SkeletonBase } from '../SkeletonBase';

interface SkeletonAvatarProps {
  size?: number;
  className?: string;
}

export function SkeletonAvatar({ size = 36, className }: SkeletonAvatarProps) {
  return <SkeletonBase width={size} height={size} borderRadius={9999} className={className} />;
}
