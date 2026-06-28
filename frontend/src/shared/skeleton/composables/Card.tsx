import { type ReactNode } from 'react';
import styles from './Card.module.css';

interface SkeletonCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonCard({ children, className = '', style }: SkeletonCardProps) {
  return (
    <div className={`${styles.card} ${className}`} style={style}>
      {children}
    </div>
  );
}
