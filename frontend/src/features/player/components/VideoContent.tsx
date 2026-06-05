'use client'

import { VideoPlayer } from '@/src/shared/components/VideoPlayer';
import styles from './VideoContent.module.css';

interface VideoContentProps {
  videoUrl?: string | null;
  title?: string;
  emptyMessage?: string;
}

export function VideoContent({ videoUrl, title, emptyMessage }: VideoContentProps) {
  if (!videoUrl || videoUrl === '#') {
    return (
      <section className={styles.wrapper}>
        <div className={styles.emptyState}>
          {emptyMessage ?? 'No hay URL de video configurada.'}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <VideoPlayer videoUrl={videoUrl} title={title} />
      </div>
    </section>
  );
}
