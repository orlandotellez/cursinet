import styles from './CourseThumbnail.module.css';

interface CourseThumbnailProps {
  title: string;
  badge?: string;
}

export function CourseThumbnail({ title, badge }: CourseThumbnailProps) {
  return (
    <div className={styles.thumbnail}>
      <div className={styles.placeholder}>
        <span className={styles.letter}>{title.charAt(0)}</span>
      </div>
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
