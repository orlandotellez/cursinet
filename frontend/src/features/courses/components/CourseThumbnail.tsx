import Image from 'next/image';
import styles from './CourseThumbnail.module.css';

interface CourseThumbnailProps {
  title: string;
  thumbnailUrl?: string;
  badge?: string;
}

export function CourseThumbnail({ title, thumbnailUrl, badge }: CourseThumbnailProps) {
  return (
    <div className={styles.thumbnail}>
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.img}
        />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.letter}>{title.charAt(0)}</span>
        </div>
      )}
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
