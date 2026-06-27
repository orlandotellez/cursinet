import styles from './CourseLevelBadge.module.css';

interface CourseLevelBadgeProps {
  level: string;
}

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function CourseLevelBadge({ level }: CourseLevelBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[level] ?? ''}`}>
      {levelLabels[level] || level}
    </span>
  );
}
