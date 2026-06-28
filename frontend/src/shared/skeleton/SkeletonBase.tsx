import styles from './SkeletonBase.module.css';

export interface SkeletonBaseProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonBase({
  width = '100%',
  height = 16,
  borderRadius = 5,
  className = '',
  style,
}: SkeletonBaseProps) {
  return (
    <div
      className={`${styles.base} ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}
